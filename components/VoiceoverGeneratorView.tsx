
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import LoadingSpinner from './LoadingSpinner';
import CopyIcon from './icons/CopyIcon';
import SparklesIcon from './icons/SparklesIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';

type Tone = 'visionary' | 'technical' | 'enthusiastic' | 'professional';
type Audience = 'investors' | 'customers' | 'retailers';

const VoiceoverGeneratorView: React.FC = () => {
    const [script, setScript] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [tone, setTone] = useState<Tone>('visionary');
    const [audience, setAudience] = useState<Audience>('investors');

    const generateScript = async () => {
        setIsLoading(true);
        setError(null);
        setScript('');
        
        try {
            // Fix: Initialize GoogleGenAI with process.env.API_KEY directly as per guidelines
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `أنت الآن كاتب سيناريو وثائقي عالمي ومستشار استراتيجي في قطاع التجزئة والموضة الرقمية.
            
            المهمة: كتابة سيناريو فويس أوفر احترافي وشامل لمشروع "StyleFit" (ستايل فيت)، مدته 10 دقائق كاملة (حوالي 1600 كلمة).
            
            النبرة المطلوبة: ${tone === 'visionary' ? 'ملهمة ورؤيوية تركز على مستقبل الموضة' : tone === 'technical' ? 'دقيقة وتقنية تركز على الذكاء الاصطناعي والخوارزميات' : tone === 'enthusiastic' ? 'حماسية وتسويقية تجذب الانتباه' : 'احترافية متزنة للأعمال'}.
            الجمهور المستهدف: ${audience === 'investors' ? 'مستثمرين يبحثون عن العائد المادي وحل مشاكل السوق بالأرقام' : audience === 'retailers' ? 'أصحاب براندات يبحثون عن تقليل المرتجعات وزيادة المبيعات' : 'المستخدم النهائي الذي يريد تجربة تسوق أسهل'}.

            المحاور التي يجب تغطيتها بالتفصيل الدقيق جداً وبناءً على أرقام السوق:
            1. [0:00-1:15] المقدمة: صدمة الأرقام في التجارة الإلكترونية (خسائر المرتجعات في الشرق الأوسط التي تصل لـ 40% من المبيعات بسبب المقاسات).
            2. [1:15-2:30] الفلسفة وراء ستايل فيت: كيف نكسر الحاجز بين الشاشة والواقع.
            3. [2:30-4:00] الغوص التقني العميق (Deep Dive): شرح دمج Gemini AI، تقنية الـ AI Body Mesh، وكيفية تحليل الصورة لتقدير القياسات بدقة مليمترية.
            4. [4:00-5:30] تجربة المستخدم الشاملة: من تصوير القطعة في الدولاب (Closet AI) إلى القياس الافتراضي (Virtual Try-On) وتحليل انسدال الأقمشة.
            5. [5:30-7:30] قوة المجتمع والـ Social Feed: شرح ميزة "Social Feed" حيث يتحول المستخدم من متسوق صامت إلى "Style Influencer". كيف يمكن للمستخدمين مشاركة نتائج قياساتهم الافتراضية، التفاعل في "Style Battles" (معارك الستايل)، والحصول على إلهام من أطقم حقيقية قام الذكاء الاصطناعي بتنسيقها لأشخاص حقيقيين.
            6. [7:30-9:00] الجدوى الاقتصادية للبراندات: زيادة معدل التحويل (Conversion Rate) بنسبة 30% وتقليل تكاليف الشحن من خلال دمج الميزة الاجتماعية التي تزيد من وقت بقاء المستخدم في التطبيق.
            7. [9:00-10:00] الخاتمة: رؤية StyleFit كخزانة ملابس رقمية مستدامة تحمي البيئة من انبعاثات الشحن الزائدة، وكشبكة اجتماعية تربط عشاق الموضة بالتكنولوجيا.

            التعليمات الإضافية:
            - استخدم لغة عربية فصحى فخمة.
            - أضف علامات زمنية [00:00] وتوجيهات أداء للمؤدي الصوتي.
            - اذكر أن التطبيق يستخدم Gemini 3 Pro للتحليل و Gemini 2.5 Flash Image للتوليد.

            ابدأ بكتابة السيناريو الآن:`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            });

            // Fix: Directly use .text property as per GenerateContentResponse extraction rules
            setScript(response.text || "عذراً، لم يتمكن النظام من توليد النص.");
        } catch (e) {
            setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if (!script) return;
        navigator.clipboard.writeText(script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-8 animate-fade-in" dir="rtl">
            <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-purple-100 rounded-3xl mb-2 shadow-inner">
                    <MicrophoneIcon className="w-10 h-10 text-purple-600" />
                </div>
                <h2 className="text-4xl font-black tracking-tight text-gray-900">مولد السيناريو الاحترافي</h2>
                <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                    قم بصياغة قصة مشروعك بأسلوب وثائقي عالمي. اختر النبرة والجمهور، ودع الذكاء الاصطناعي يكتب لك سيناريو الـ 10 دقائق بالتفصيل.
                </p>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
                {!script && !isLoading && (
                    <div className="grid md:grid-cols-2 gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-2xl animate-fade-in-up">
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 border-r-4 border-purple-500 pr-3">نبرة الصوت</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {(['visionary', 'technical', 'enthusiastic', 'professional'] as Tone[]).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTone(t)}
                                        className={`p-4 rounded-2xl text-xs font-bold transition-all border ${tone === t ? 'bg-purple-600 text-white border-purple-600 shadow-lg scale-105' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'}`}
                                    >
                                        {t === 'visionary' ? 'ملهمة / رؤيوية' : t === 'technical' ? 'تقنية / دقيقة' : t === 'enthusiastic' ? 'حماسية / تسويقية' : 'رسمية / للأعمال'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-bold text-gray-800 border-r-4 border-blue-500 pr-3">الجمهور المستهدف</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {(['investors', 'retailers', 'customers'] as Audience[]).map((a) => (
                                    <button
                                        key={a}
                                        onClick={() => setAudience(a)}
                                        className={`p-4 rounded-2xl text-xs font-bold transition-all border ${audience === a ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100'}`}
                                    >
                                        {a === 'investors' ? 'مستثمرين (لغة الأرقام)' : a === 'retailers' ? 'شركات الموضة (لغة البيزنس)' : 'المستخدمين (لغة التجربة)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2 pt-6">
                            <button
                                onClick={generateScript}
                                className="w-full primary-gradient text-white font-black py-6 px-10 rounded-2xl hover:opacity-95 transition-all transform hover:scale-[1.01] shadow-2xl flex items-center justify-center gap-4 text-xl"
                            >
                                <SparklesIcon className="w-6 h-6" />
                                توليد السيناريو الكامل
                            </button>
                        </div>
                    </div>
                )}

                {(script || isLoading) && (
                    <div className="bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-800 min-h-[500px] flex flex-col">
                        <div className="p-8 border-b border-slate-800 bg-slate-900/90 backdrop-blur-2xl flex justify-between items-center sticky top-0 z-20">
                            <div className="flex items-center gap-4">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-slate-100 text-lg font-black block">سيناريو StyleFit</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                disabled={!script}
                                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                            >
                                <CopyIcon className="w-4 h-4" />
                                {copied ? 'تم النسخ!' : 'نسخ السيناريو'}
                            </button>
                        </div>
                        <div className="flex-1 p-10 overflow-y-auto">
                            {isLoading ? (
                                <LoadingSpinner text="جاري صياغة المحتوى..." />
                            ) : error ? (
                                <div className="text-center text-red-400 p-10">
                                    <p>{error}</p>
                                    <button onClick={generateScript} className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg font-bold">إعادة المحاولة</button>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap text-slate-200 leading-[2.2] font-serif text-xl text-right" dir="rtl">
                                    {script}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoiceoverGeneratorView;
