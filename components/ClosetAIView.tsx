
import React, { useState, useEffect, useRef } from 'react';
import { getStyledOutfitIdeasFromCloset, generateOutfitFromClosetItems, getAiUserProfile, getAiBodyMeasurements } from '../services/geminiService';
import { SavedOutfit, SocialPost, UserClosetItem, Outfit, UserProfile, ProductItem, BodyProfile } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import SaveIcon from './icons/SaveIcon';
import ShareIcon from './icons/ShareIcon';
import ShareModal from './ShareModal';
import AddItemToClosetModal from './AddItemToClosetModal';
import { currentUser } from '../constants';
import SwitchCameraIcon from './icons/SwitchCameraIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import CategorySelector from './CategorySelector';
import LoadingSpinner from './LoadingSpinner';
import SkeletonLoader from './SkeletonLoader';
import MicrophoneIcon from './icons/MicrophoneIcon';
import ShopThisLook from './ShopThisLook';

interface ClosetAIViewProps {
  userImage: string | null;
  closetItems: UserClosetItem[];
  onAddClosetItem: (item: Omit<UserClosetItem, 'id'>) => void;
  onRequestUserImage: () => void;
  onSaveOutfit: (outfit: Omit<SavedOutfit, 'id' | 'createdAt'>) => void;
  onShareOutfit: (post: Omit<SocialPost, 'id' | 'likes' | 'comments'>) => void;
}

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ClosetAIView: React.FC<ClosetAIViewProps> = ({ userImage, closetItems, onAddClosetItem, onRequestUserImage, onSaveOutfit, onShareOutfit }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  const [isTextLoading, setIsTextLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outfitToShare, setOutfitToShare] = useState<Outfit | null>(null);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState<boolean>(false);
  const [savedOutfits, setSavedOutfits] = useState<Set<string>>(new Set());

  const [selectedClosetItems, setSelectedClosetItems] = useState<UserClosetItem[]>([]);
  const [stagedClosetItems, setStagedClosetItems] = useState<UserClosetItem[]>([]); // Items used for the current generation

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bodyProfile, setBodyProfile] = useState<BodyProfile | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState<boolean>(false);
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<'Adult' | 'Child' | ''>('');
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'ar-EG'; // Default to Arabic/Egypt

        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript + ' ';
                }
            }
            if (transcript) {
                setPrompt(prev => (prev ? prev.trim() + ' ' : '') + transcript.trim());
            }
        };
        
        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error", event.error);
            setError(`Microphone error: ${event.error}. Please check permissions.`);
            setIsRecording(false);
        };
        
        recognitionRef.current = recognition;
    } else {
        console.warn("Speech Recognition not supported by this browser.");
    }

    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
        setError("Voice input is not supported on this browser.");
        return;
    }

    if (isRecording) {
        recognitionRef.current.stop();
    } else {
        setError(null);
        try {
            recognitionRef.current.start();
            setIsRecording(true);
        } catch(e) {
            console.error("Could not start recognition", e);
            setError("Could not start voice recording. It might already be active.");
            setIsRecording(false);
        }
    }
  };

  useEffect(() => {
    if (userImage) {
      setIsAnalyzingPhoto(true);
      setUserProfile(null);
      setBodyProfile(null);
      setSelectedAgeCategory('');
      const fetchProfiles = async () => {
        try {
          const [profile, bodyMeasurements] = await Promise.all([
            getAiUserProfile(userImage),
            getAiBodyMeasurements(userImage),
          ]);
          setUserProfile(profile);
          setBodyProfile(bodyMeasurements);
          setSelectedAgeCategory(profile.ageCategory as 'Adult' | 'Child');
        } catch (e) {
          console.error("Could not fetch user profile for Closet AI:", e);
          setError("Could not analyze your photo. Please try changing it or select a profile category manually.");
        } finally {
          setIsAnalyzingPhoto(false);
        }
      };
      fetchProfiles();
    } else {
      setUserProfile(null);
      setBodyProfile(null);
      setSelectedAgeCategory('');
    }
  }, [userImage]);

  const handleItemAdded = (imageBase64: string) => {
    onAddClosetItem({ imageUrl: imageBase64 });
    setIsAddItemModalOpen(false);
  };

  const handleGenerate = async () => {
    if (!prompt || !userImage || selectedClosetItems.length === 0 || !userProfile || !selectedAgeCategory) return;
    setIsTextLoading(true);
    setGeneratedOutfits([]);
    setError(null);
    setSavedOutfits(new Set());
    setStagedClosetItems(selectedClosetItems); // Stage the items for image generation
    try {
      const finalUserProfile: UserProfile = {
        ...userProfile,
        ageCategory: selectedAgeCategory,
      };
      // Fix: Removed extra arguments {} and sortBy to match getStyledOutfitIdeasFromCloset definition
      const resultOutfits = await getStyledOutfitIdeasFromCloset(selectedClosetItems, prompt, finalUserProfile);
      setGeneratedOutfits(resultOutfits);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsTextLoading(false);
    }
  };

  useEffect(() => {
    if (!userImage || generatedOutfits.length === 0 || stagedClosetItems.length === 0 || !userProfile || !selectedAgeCategory) {
        return;
    }

    const needsProcessing = generatedOutfits.some(o => !o.imageUrl && !o.error);
    if (!needsProcessing) {
        return;
    }

    const generateAllOutfitImages = async () => {
        const finalUserProfile: UserProfile = {
            ...userProfile,
            ageCategory: selectedAgeCategory,
        };

        const processedOutfits = await Promise.all(
            generatedOutfits.map(async (outfit) => {
                if (outfit.imageUrl || outfit.error) {
                    return outfit;
                }
                try {
                    const imageGenPrompt = `A person wearing the following outfit. Name: "${outfit.name}". Items: ${outfit.items.map(i => i.name).join(', ')}. Style: ${outfit.description}.`;
                    const outfitImage = await generateOutfitFromClosetItems(userImage, stagedClosetItems, imageGenPrompt, finalUserProfile);
                    return { ...outfit, imageUrl: outfitImage };
                } catch (e) {
                    const errorMessage = e instanceof Error ? e.message : "Could not generate this look.";
                    return { ...outfit, error: errorMessage };
                }
            })
        );
        
        setGeneratedOutfits(processedOutfits);
    };
    
    generateAllOutfitImages();
  }, [userImage, generatedOutfits, stagedClosetItems, userProfile, selectedAgeCategory]);


  const handleItemSelect = (item: UserClosetItem) => {
      setSelectedClosetItems(prev => {
          const isSelected = prev.some(i => i.id === item.id);
          if (isSelected) {
              return prev.filter(i => i.id !== item.id);
          } else {
              return [...prev, item];
          }
      });
  };

  const handleSave = (outfit: Outfit) => {
    if (!outfit.imageUrl) return;
    onSaveOutfit({
      imageUrl: outfit.imageUrl,
      prompt: `Closet AI: "${prompt}" - ${outfit.name}`,
    });
    setSavedOutfits(prev => new Set(prev).add(outfit.name));
  };

  const handleConfirmShare = (caption: string) => {
    if (!outfitToShare?.imageUrl) return;
    onShareOutfit({
      user: currentUser,
      outfitImageUrl: outfitToShare.imageUrl,
      caption: caption,
    });
    setOutfitToShare(null);
  };

  const canGenerate = !isTextLoading && !isAnalyzingPhoto && !!prompt && !!userImage && !!userProfile && !!selectedAgeCategory && selectedClosetItems.length > 0;

  return (
    <div className="space-y-8">
        <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">Your Closet AI</h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">Combine your real clothes with new finds to create unique, AI-styled outfits.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="space-y-6 bg-[var(--card)] p-6 rounded-[var(--radius)] shadow-xl self-start sticky top-28 lg:col-span-1">
                {userImage && (
                  <>
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                        <img src={userImage} alt="Your photo" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                            <button 
                                onClick={onRequestUserImage} 
                                className="w-full bg-black/60 backdrop-blur-sm text-white text-sm font-semibold py-2.5 px-4 rounded-xl hover:bg-black/80 transition-colors flex items-center justify-center gap-2"
                            >
                                <SwitchCameraIcon className="w-5 h-5"/>
                                Change Photo
                            </button>
                        </div>
                    </div>
                    <div className="space-y-4 animate-fade-in">
                        <div className="rounded-md text-center">
                            {isAnalyzingPhoto ? (
                                <p className="text-sm text-gray-500 animate-pulse bg-gray-100 p-2 rounded-md">Analyzing photo...</p>
                            ) : userProfile ? (
                                <p className="text-sm font-semibold text-gray-700 bg-gray-100 p-2 rounded-md">
                                📷 Detected Profile: {userProfile.ageCategory} ({userProfile.gender})
                                </p>
                            ) : (
                                <div className="text-sm font-semibold text-red-700 bg-red-100 p-3 rounded-lg">
                                    <p>Could not determine profile.</p>
                                    <p className="font-normal text-red-600 mt-1">Please select a category to continue.</p>
                                </div>
                            )}
                        </div>
                        <CategorySelector
                            title={userProfile ? "Confirm or Change Category" : "Select Profile Category"}
                            value={selectedAgeCategory}
                            onSelect={(cat) => setSelectedAgeCategory(cat)}
                            disabled={isAnalyzingPhoto}
                        />
                    </div>
                  </>
                )}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label htmlFor="closet-prompt" className="block text-sm font-bold text-gray-700">Describe the look you want:</label>
                        <button
                            onClick={handleMicClick}
                            disabled={!userImage || closetItems.length === 0}
                            className={`p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                isRecording
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            }`}
                            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                            title="Use Voice Input"
                        >
                            <MicrophoneIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <textarea
                        id="closet-prompt"
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder={!userImage ? "First, add your photo to start styling!" : (closetItems.length === 0 ? "Add items to your closet first!" : (isRecording ? "Listening..." : "e.g., 'a casual weekend look'"))}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={!userImage || closetItems.length === 0}
                    />
                </div>
                 <div className="pt-4 border-t border-gray-200">
                    <label htmlFor="closet-sort-by" className="block text-sm font-bold text-gray-700 mb-2">Sort new items by</label>
                    <select
                        id="closet-sort-by"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
                    >
                        <option value="relevance">Relevance</option>
                        <option value="price_low_to_high">Price: Low to High</option>
                        <option value="price_high_to_low">Price: High to Low</option>
                    </select>
                 </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-gray-700">Select item(s) from your closet:</h3>
                        <button 
                            onClick={() => setIsAddItemModalOpen(true)}
                            className="text-xs bg-purple-100 text-purple-700 font-semibold px-3 py-1.5 rounded-full hover:bg-purple-200 transition-colors"
                        >
                            + Add New
                        </button>
                    </div>
                    {closetItems.length === 0 ? (
                        <div className="text-center py-6 px-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Your closet is empty.</p>
                            <p className="text-xs text-gray-400 mt-1">Add items to start styling.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
                           {closetItems.map(item => {
                               const isSelected = selectedClosetItems.some(i => i.id === item.id);
                               return (
                                   <button key={item.id} onClick={() => handleItemSelect(item)} className="relative aspect-square rounded-md overflow-hidden transition-transform transform hover:scale-105">
                                       <img src={item.imageUrl} alt="closet item" className="w-full h-full object-cover" />
                                       {isSelected && <div className="absolute inset-0 bg-purple-500/50 border-4 border-purple-500 flex items-center justify-center">
                                           <CheckIcon className="w-8 h-8 text-white"/>
                                       </div>}
                                   </button>
                               );
                           })}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className="w-full primary-gradient text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition-transform transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {isTextLoading || isAnalyzingPhoto ? 'Generating...' : 'Create My Outfits'}
                </button>
            </div>
            
            <div className="lg:col-span-2">
                {!userImage ? (
                    <div className="bg-[var(--card)] p-6 rounded-[var(--radius)] shadow-xl min-h-[60vh] flex items-center justify-center">
                        <div className="text-center p-4">
                            <UserPlusIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-700">See Your Creations Come to Life</h3>
                            <p className="text-gray-500 mt-2 mb-6 text-sm max-w-xs mx-auto">Add a photo of yourself to virtually try on the new outfits you create with your closet items.</p>
                            <button
                                onClick={onRequestUserImage}
                                className="primary-gradient text-white font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-transform transform hover:scale-105"
                            >
                                Add Your Photo to Begin
                            </button>
                        </div>
                    </div>
                ) : isTextLoading ? (
                    <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-xl flex items-center justify-center p-4 h-96">
                        <LoadingSpinner text="Getting style ideas..." />
                    </div>
                ) : error ? (
                    <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-xl flex items-center justify-center p-4 h-96">
                        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                            <p className="font-bold">Generation Failed</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                ) : generatedOutfits.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {generatedOutfits.map((outfit, index) => {
                            const isSaved = savedOutfits.has(outfit.name);
                            return (
                                <div key={index} className="bg-[var(--card)] rounded-[var(--radius)] shadow-xl overflow-hidden animate-fade-in-up flex flex-col" style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}>
                                    <div className="w-full aspect-[3/4] bg-gray-100 relative">
                                        {outfit.imageUrl ? (
                                            <img src={outfit.imageUrl} alt={outfit.name} className="absolute inset-0 w-full h-full object-cover" />
                                        ) : outfit.error ? (
                                            <div className="absolute inset-0 flex items-center justify-center p-4 bg-red-50 text-red-700 text-center text-sm rounded-lg"><span>{outfit.error}</span></div>
                                        ) : (
                                            <SkeletonLoader className="w-full h-full" />
                                        )}
                                   </div>
                                   <div className="p-4 flex flex-col flex-grow">
                                       <div className="flex-grow">
                                            <h3 className="text-lg font-bold text-gray-800">{outfit.name}</h3>
                                            <p className="text-gray-600 mt-1 mb-3 text-sm">{outfit.description}</p>
                                            <ShopThisLook outfit={outfit} bodyProfile={bodyProfile} />
                                       </div>
                                       <div className="space-y-2 mt-auto pt-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <button 
                                                    onClick={() => handleSave(outfit)}
                                                    disabled={isSaved || !outfit.imageUrl}
                                                    className={`w-full text-sm font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:bg-gray-300 ${
                                                        isSaved ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                                                    }`}
                                                >
                                                    {isSaved ? <><CheckIcon className="w-4 h-4"/><span>Saved!</span></> : <><SaveIcon className="w-4 h-4"/><span>Save</span></>}
                                                </button>
                                                <button 
                                                    onClick={() => setOutfitToShare(outfit)} 
                                                    disabled={!outfit.imageUrl}
                                                    className="w-full text-sm bg-green-500 text-white font-bold py-2.5 px-3 rounded-xl hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                    >
                                                    <ShareIcon className="w-4 h-4"/> Share
                                                </button>
                                           </div>
                                       </div>
                                   </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-xl flex items-center justify-center min-h-[60vh]">
                        <div className="text-center text-gray-500 p-4">
                            <p className="font-semibold">Your generated outfits will appear here.</p>
                            <p className="text-sm">Select items, describe a look, and let the AI work its magic!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {isAddItemModalOpen && <AddItemToClosetModal onClose={() => setIsAddItemModalOpen(false)} onItemAdded={handleItemAdded} />}
        {outfitToShare && outfitToShare.imageUrl && (
            <ShareModal
                imageUrl={outfitToShare.imageUrl}
                initialCaption={`Check out this look I created with my own clothes using Closet AI! My prompt was: "${prompt}" #ClosetAI #StyleFit`}
                onClose={() => setOutfitToShare(null)}
                onShare={handleConfirmShare}
            />
        )}
    </div>
  );
};

export default ClosetAIView;
