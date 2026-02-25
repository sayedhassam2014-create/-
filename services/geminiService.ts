
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BodyProfile, Outfit, Product, SizeRecommendation, UserClosetItem, UserProfile, ProductSearchOutfit } from '../types';

/**
 * دالة لاستخراج بيانات الـ Base64 بأمان من الـ Data URL
 */
const extractBase64 = (dataUrl: string) => {
    if (!dataUrl) return "";
    if (!dataUrl.includes(',')) return dataUrl;
    return dataUrl.split(',')[1];
};

/**
 * وظيفة ذكية لإعادة المحاولة في حال تجاوز الحصة أو وجود أخطاء مؤقتة
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1500): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const errorMsg = error?.message?.toLowerCase() || "";
    const isRetryable = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('limit') || errorMsg.includes('exhausted');
    
    if (retries > 0 && isRetryable) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    
    if (isRetryable) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }
}

function safeJsonParse<T>(jsonString: string | undefined): T | null {
    if (!jsonString) return null;
    try {
        const sanitized = jsonString.replace(/^```json\s*|```\s*$/g, '').trim();
        return JSON.parse(sanitized) as T;
    } catch (e) {
        const arrayStart = jsonString.indexOf('[');
        const objectStart = jsonString.indexOf('{');
        let start = -1;
        let end = -1;
        if (arrayStart !== -1 && (objectStart === -1 || arrayStart < objectStart)) {
            start = arrayStart;
            end = jsonString.lastIndexOf(']');
        } else if (objectStart !== -1) {
            start = objectStart;
            end = jsonString.lastIndexOf('}');
        }
        if (start !== -1 && end !== -1) {
            try {
                return JSON.parse(jsonString.substring(start, end + 1)) as T;
            } catch (innerE) { return null; }
        }
        return null;
    }
}

export const virtualTryOn = async (userImageBase64: string, outfit: Outfit, mainProduct?: Product, userProfile?: UserProfile, prompt?: string): Promise<string> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const itemsList = outfit.items.map(i => i.name).join(' and ');
        
        const finalPrompt = prompt || `Virtual Styling Task (Fashion Expert Mode): 
        Anchor Piece: "${mainProduct?.name || outfit.name}".
        Target Ensemble: ${itemsList}.
        Stylist Goal: ${outfit.description}.
        Action: Photorealistically dress the person in the provided photo in this COMPLETE outfit. 
        Maintain face, skin tone, background, and lighting. The clothes should naturally drape over their body as if they are wearing them in that exact photo.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: extractBase64(userImageBase64), mimeType: 'image/jpeg' } },
                    { text: finalPrompt },
                ],
            },
            config: { imageConfig: { aspectRatio: "9:16" } }
        });
        
        let base64Data = "";
        const parts = response.candidates?.[0]?.content.parts || [];
        for (const part of parts) {
            if (part.inlineData) { 
                base64Data = part.inlineData.data; 
                break; 
            }
        }
        if (!base64Data) throw new Error("TRY_ON_FAILED");
        return `data:image/png;base64,${base64Data}`;
    });
};

export const getOutfitRecommendations = async (product: Product, userProfile: UserProfile): Promise<Outfit[]> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const stylistPrompt = `Act as a world-class luxury personal stylist. 
        MANDATORY RULES:
        1. Anchor Piece: The user has selected "${product.name}". Every outfit must complement this hero item.
        2. Occasions: Create exactly 3 outfits labeled: 'Casual', 'Formal', and 'Evening'.
        3. Stylist Intelligence: Use Color Theory (monochrome, complementary), Seasonality (current Egypt weather), and Proportions.
        4. Output: For each outfit, include:
           - A creative name.
           - A stylistNote: A 1-sentence expert explanation of WHY this look works.
           - Items: A list of 2-3 additional pieces (pants, shoes, accessories) with brand and price.
        Return strictly as a JSON array.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: stylistPrompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            stylistNote: { type: Type.STRING },
                            occasion: { type: Type.STRING, enum: ['Casual', 'Formal', 'Evening'] },
                            items: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        brand: { type: Type.STRING },
                                        price: { type: Type.STRING },
                                        url: { type: Type.STRING }
                                    },
                                    required: ["name", "brand", "price"]
                                }
                            }
                        },
                        required: ["name", "description", "items", "stylistNote", "occasion"]
                    }
                }
            }
        });
        const parsed = safeJsonParse<Outfit[]>(response.text) || [];
        return parsed.map(o => ({ ...o, items: o.items || [] }));
    });
};

export const getAiBodyMeasurements = async (img: string): Promise<BodyProfile> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ inlineData: { data: extractBase64(img), mimeType: 'image/jpeg' } }, { text: "Estimate body measurements (height, weight, chest, waist). Return JSON." }] },
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse<BodyProfile>(response.text) || { height: '170cm', weight: '70kg', chest: '90cm', waist: '80cm', analysis: '', gender: 'Female', ageCategory: 'Adult' };
    });
};

export const getRecommendedSize = async (product: Product, bodyProfile: BodyProfile): Promise<SizeRecommendation> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Recommend best size for "${product.name}" for a person with metrics: ${JSON.stringify(bodyProfile)}. Return JSON with 'size', 'analysis', 'confidence'.`,
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse<SizeRecommendation>(response.text) || { size: 'M', analysis: 'Standard fit.', confidence: 80 };
    });
};

export const getAiUserProfile = async (img: string): Promise<UserProfile> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ inlineData: { data: extractBase64(img), mimeType: 'image/jpeg' } }, { text: "Identify gender and age category for fashion. Return JSON." }] },
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse<UserProfile>(response.text) || { gender: 'Female', ageCategory: 'Adult' };
    });
};

export const getAiBodyMesh = async (img: string): Promise<string> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ inlineData: { data: extractBase64(img), mimeType: 'image/jpeg' } }, { text: "Generate raw SVG paths for body mesh analysis." }] }
        });
        return response.text.trim();
    });
};

export const virtualVideoTryOn = async (userImageBase64: string, product: Product): Promise<string> => {
    if (typeof window !== 'undefined' && (window as any).aistudio && !(await (window as any).aistudio.hasSelectedApiKey())) {
        await (window as any).aistudio.openSelectKey();
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A high-fashion cinematic video of the person from the photo wearing the ${product.name}.`,
        image: { imageBytes: extractBase64(userImageBase64), mimeType: 'image/jpeg' },
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
    });
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};

export const getStyledOutfitIdeasFromPrompt = async (prompt: string, userProfile: UserProfile): Promise<Outfit[]> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Stylist request: ${prompt}. Targeting: ${userProfile.gender}, ${userProfile.ageCategory}. Create 3 detailed outfits. Return JSON array.`,
            config: { responseMimeType: "application/json" }
        });
        const parsed = safeJsonParse<Outfit[]>(response.text) || [];
        return parsed.map(o => ({ ...o, items: o.items || [] }));
    });
};

export const getStyledOutfitIdeasFromCloset = async (closetItems: UserClosetItem[], prompt: string, userProfile: UserProfile): Promise<Outfit[]> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const parts: any[] = [{ text: `Create outfits using these closet items for: ${prompt}. Return JSON array.` }];
        closetItems.slice(0, 3).forEach(item => parts.push({ inlineData: { data: extractBase64(item.imageUrl), mimeType: 'image/jpeg' } }));
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts },
            config: { responseMimeType: "application/json" }
        });
        const parsed = safeJsonParse<Outfit[]>(response.text) || [];
        return parsed.map(o => ({ ...o, items: o.items || [] }));
    });
};

export const generateOutfitFromClosetItems = async (userImageBase64: string, closetItems: UserClosetItem[], prompt: string, userProfile: UserProfile): Promise<string> => { 
    return virtualTryOn(userImageBase64, { name: 'Closet Selection', description: prompt, items: [] }, undefined, userProfile, prompt); 
};

export const getProductSearchRecommendations = async (occasion: string, description: string): Promise<ProductSearchOutfit[]> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Search outfits for a ${occasion} in Egypt. Context: ${description}. Return JSON.`,
            config: { responseMimeType: "application/json" }
        });
        return safeJsonParse<ProductSearchOutfit[]>(response.text) || [];
    });
};

export const recommendStoreItemsForUserItem = async (imageBase64: string): Promise<Outfit[]> => {
    return withRetry(async () => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: extractBase64(imageBase64) } },
                    { text: "Analyze this item. Suggest 3 complementary high-fashion items. Return as JSON array of Outfit objects." }
                ]
            },
            config: { tools: [{googleSearch: {}}] }
        });
        const outfits = safeJsonParse<Outfit[]>(response.text) || [];
        return outfits.map(o => ({ ...o, items: o.items || [] }));
    });
};
