
import React, { useState, useEffect, useRef } from 'react';
import { getStyledOutfitIdeasFromPrompt, virtualTryOn, getAiUserProfile, getAiBodyMeasurements } from '../services/geminiService';
import { SavedOutfit, SocialPost, Outfit, UserProfile, ProductItem, BodyProfile } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import SaveIcon from './icons/SaveIcon';
import ShareIcon from './icons/ShareIcon';
import ShareModal from './ShareModal';
import { currentUser } from '../constants';
import UserPlusIcon from './icons/UserPlusIcon';
import SwitchCameraIcon from './icons/SwitchCameraIcon';
import CategorySelector from './CategorySelector';
import LoadingSpinner from './LoadingSpinner';
import SkeletonLoader from './SkeletonLoader';
import FilterSelector from './FilterSelector';
import MicrophoneIcon from './icons/MicrophoneIcon';
import ShopThisLook from './ShopThisLook';

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// Fix: Define the missing AiStylistViewProps interface to ensure proper type safety
interface AiStylistViewProps {
  userImage: string | null;
  onImageReady: (imageBase64: string) => void;
  onRequestUserImage: () => void;
  onSaveOutfit: (outfit: Omit<SavedOutfit, 'id' | 'createdAt'>) => void;
  onShareOutfit: (post: Omit<SocialPost, 'id' | 'likes' | 'comments'>) => void;
}

const AiStylistView: React.FC<AiStylistViewProps> = ({ userImage, onImageReady, onRequestUserImage, onSaveOutfit, onShareOutfit }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isTextLoading, setIsTextLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [outfitToShare, setOutfitToShare] = useState<Outfit | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bodyProfile, setBodyProfile] = useState<BodyProfile | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState<boolean>(false);
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<'Adult' | 'Child' | ''>('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // منطق معالجة خطأ الحصة المخصص
  const isQuotaError = error === "QUOTA_EXCEEDED";

  const handleOpenKeySelection = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // إعادة تحميل الصفحة أو الحالة للتطبيق باستخدام المفتاح الجديد
      window.location.reload();
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'ar-EG';
        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) transcript += event.results[i][0].transcript + ' ';
            }
            if (transcript) setPrompt(prev => (prev ? prev.trim() + ' ' : '') + transcript.trim());
        };
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isRecording) recognitionRef.current.stop();
    else { setIsRecording(true); recognitionRef.current.start(); }
  };

  useEffect(() => {
    if (userImage) {
      setIsAnalyzingPhoto(true);
      setError(null);
      Promise.all([getAiUserProfile(userImage), getAiBodyMeasurements(userImage)])
        .then(([profile, body]) => {
          setUserProfile(profile);
          setBodyProfile(body);
          setSelectedAgeCategory(profile.ageCategory as 'Adult' | 'Child');
        })
        .catch(e => setError(e.message))
        .finally(() => setIsAnalyzingPhoto(false));
    }
  }, [userImage]);

  const handleGenerate = async () => {
    if (!prompt || !userImage || !userProfile || !selectedAgeCategory) return;
    setIsTextLoading(true);
    setError(null);
    setOutfits([]);
    try {
      const finalProfile: UserProfile = { ...userProfile, ageCategory: selectedAgeCategory };
      const result = await getStyledOutfitIdeasFromPrompt(prompt, finalProfile);
      setOutfits(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsTextLoading(false);
    }
  };
  
  useEffect(() => {
    if (!userImage || outfits.length === 0 || !userProfile || !selectedAgeCategory) return;
    const needsProcessing = outfits.some(o => !o.imageUrl && !o.error);
    if (!needsProcessing) return;

    const generateImages = async () => {
      const finalProfile: UserProfile = { ...userProfile, ageCategory: selectedAgeCategory };
      const updated = await Promise.all(outfits.map(async (o) => {
        if (o.imageUrl || o.error) return o;
        try {
          const img = await virtualTryOn(userImage, o, undefined, finalProfile);
          return { ...o, imageUrl: img };
        } catch (e: any) {
          return { ...o, error: e.message === "QUOTA_EXCEEDED" ? "تجاوز الحصة" : "فشل التوليد" };
        }
      }));
      setOutfits(updated);
    };
    generateImages();
  }, [userImage, outfits, userProfile, selectedAgeCategory]);

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 flex items-center justify-center gap-3">
          <SparklesIcon className="w-10 h-10 text-purple-600" />
          المنسق الشخصي الذكي
        </h2>
        <p className="text-gray-500 mt-2 max-w-2xl mx-auto">أدخل ستايل، مناسبة، أو أي فكرة وسنقوم بتصميم 3 إطلالات متكاملة خصيصاً لك.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="space-y-6 bg-white p-6 rounded-[2.5rem] shadow-xl self-start sticky top-28 lg:col-span-1 border border-gray-100">
            <div className="relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-gray-100">
                {userImage ? (
                    <>
                        <img src={userImage} alt="Your photo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                             <button onClick={onRequestUserImage} className="bg-white/90 backdrop-blur-md text-gray-900 text-xs font-bold py-3 px-6 rounded-2xl shadow-xl flex items-center gap-2">
                                <SwitchCameraIcon className="w-4 h-4"/> تغيير الصورة
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center">
                        <UserPlusIcon className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="font-bold text-gray-700">أضف صورتك للتحليل</h3>
                        <button onClick={onRequestUserImage} className="mt-6 primary-gradient text-white font-bold py-3 px-8 rounded-xl shadow-lg">إضافة صورة</button>
                    </div>
                )}
            </div>

            {userImage && (
                <div className="space-y-4 animate-fade-in">
                    <CategorySelector title="الفئة العمرية" value={selectedAgeCategory} onSelect={setSelectedAgeCategory} disabled={isAnalyzingPhoto} />
                    <div className="relative">
                        <label className="block text-sm font-bold text-gray-700 mb-2 mr-2">ماذا تريد أن ترتدي؟</label>
                        <div className="relative">
                             <textarea
                                rows={3}
                                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 transition bg-gray-50 text-gray-800 text-sm font-medium"
                                placeholder="مثلاً: فستان سهرة أحمر مخملي..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                            <button onClick={handleMicClick} className={`absolute bottom-3 left-3 p-3 rounded-full ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
                                <MicrophoneIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <button onClick={handleGenerate} disabled={isTextLoading || !prompt || !userImage || !userProfile || !selectedAgeCategory} className="w-full primary-gradient text-white font-black py-4 px-6 rounded-2xl hover:opacity-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
                        {isTextLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <SparklesIcon className="w-5 h-5" />}
                        {isTextLoading ? 'جاري التحليل...' : 'تنسيق 3 إطلالات'}
                    </button>
                </div>
            )}
        </div>

        <div className="lg:col-span-2">
          {isTextLoading ? (
            <div className="bg-white rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-12 min-h-[500px] border border-gray-50">
                <LoadingSpinner text="أقوم الآن بتصميم إطلالاتك بعناية فائقة..." />
            </div>
          ) : isQuotaError ? (
            <div className="bg-purple-50 p-10 rounded-[2.5rem] border border-purple-100 text-center space-y-6 shadow-sm">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <SparklesIcon className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-black text-purple-900">المحرك العام مزدحم حالياً! 🚀</h3>
                <p className="text-purple-700 font-medium leading-relaxed max-w-sm mx-auto">
                    لقد وصلت للمرحلة القصوى من الحصة المجانية المشتركة. يمكنك تجاوز هذا الازدحام فوراً باستخدام مفتاحك الخاص.
                </p>
                <div className="space-y-3">
                    <button onClick={handleOpenKeySelection} className="w-full bg-purple-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-3">
                        <CheckIcon className="w-5 h-5" /> ربط مفتاحك الخاص الآن
                    </button>
                    <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">تجاوز الانتظار فوراً وبمجانية تامة</p>
                </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-8 rounded-[2.5rem] text-center border border-red-100 font-bold">{error}</div>
          ) : outfits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 animate-fade-in">
                {outfits.map((o, idx) => (
                    <div key={idx} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col group hover:shadow-2xl transition-all">
                        <div className="w-full aspect-[3/4] bg-gray-50 relative overflow-hidden">
                            {o.imageUrl ? <img src={o.imageUrl} alt={o.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <SkeletonLoader className="w-full h-full" />}
                            <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full text-[10px] font-black">إطلالة {idx + 1}</div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <h3 className="text-xl font-black text-gray-900 mb-2">{o.name}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">{o.description}</p>
                            <ShopThisLook outfit={o} bodyProfile={bodyProfile} />
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button onClick={() => { onSaveOutfit({ imageUrl: o.imageUrl!, prompt: o.name }); setSavedOutfits(prev => new Set(prev).add(o.name)) }} disabled={!o.imageUrl || savedOutfits.has(o.name)} className="bg-blue-50 text-blue-600 font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2">
                                    {savedOutfits.has(o.name) ? <CheckIcon className="w-4 h-4"/> : <SaveIcon className="w-4 h-4"/>}
                                    {savedOutfits.has(o.name) ? 'تم الحفظ' : 'حفظ'}
                                </button>
                                <button onClick={() => setOutfitToShare(o)} disabled={!o.imageUrl} className="bg-green-50 text-green-600 font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2">
                                    <ShareIcon className="w-4 h-4"/> مشاركة
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center p-12 min-h-[500px] border border-gray-50 text-center">
                <div className="p-8 bg-purple-50 rounded-full mb-6"><SparklesIcon className="w-16 h-16 text-purple-400" /></div>
                <h3 className="text-3xl font-black text-gray-800">طلبك هو مرجعنا ✨</h3>
                <p className="text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed font-medium">حدد اللون أو المناسبة، وسأقوم بتصميم إطلالتك فوراً.</p>
            </div>
          )}
        </div>
      </div>
      {outfitToShare && <ShareModal imageUrl={outfitToShare.imageUrl} initialCaption={`ما رأيكم بهذا التنسيق المخصص؟ #StyleFit #AI`} onClose={() => setOutfitToShare(null)} onShare={(cap) => { onShareOutfit({ user: currentUser, outfitImageUrl: outfitToShare.imageUrl, caption: cap }); setOutfitToShare(null); }} />}
    </div>
  );
};

export default AiStylistView;
