
import React, { useState, useEffect, useCallback } from 'react';
import { Outfit, SocialPost, SavedOutfit, Product, BodyProfile, SizeRecommendation, UserProfile, ProductItem } from '../types';
import { virtualTryOn, getAiBodyMeasurements, getAiBodyMesh, getRecommendedSize, getOutfitRecommendations, virtualVideoTryOn } from '../services/geminiService';
import { currentUser } from '../constants';
import ShareIcon from './icons/ShareIcon';
import ShareModal from './ShareModal';
import SaveIcon from './icons/SaveIcon';
import LoadingSpinner from './LoadingSpinner';
import SkeletonLoader from './SkeletonLoader';
import ShopThisLook from './ShopThisLook';
import CheckIcon from './icons/CheckIcon';
import SparklesIcon from './icons/SparklesIcon';
import CameraIcon from './icons/CameraIcon';

interface VirtualDressingRoomProps {
  userImage: string;
  product: Product;
  onShareOutfit: (post: Omit<SocialPost, 'id' | 'likes' | 'comments'>) => void;
  onSaveOutfit: (outfit: Omit<SavedOutfit, 'id' | 'createdAt'>) => void;
  initialOutfit?: Outfit | null;
}

const VirtualDressingRoom: React.FC<VirtualDressingRoomProps> = ({ userImage, product, onShareOutfit, onSaveOutfit, initialOutfit }) => {
  const [bodyProfile, setBodyProfile] = useState<BodyProfile | null>(null);
  const [sizeRecommendation, setSizeRecommendation] = useState<SizeRecommendation | null>(null);
  const [triedOnImage, setTriedOnImage] = useState<string | null>(null);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  
  const [isBodyProfileLoading, setIsBodyProfileLoading] = useState(true);
  const [bodyError, setBodyError] = useState<string | null>(null);
  const [isSizeLoading, setIsSizeLoading] = useState(true);
  const [isTryOnLoading, setIsTryOnLoading] = useState(true);
  const [areOutfitsLoading, setAreOutfitsLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedRecommendedOutfits, setSavedRecommendedOutfits] = useState<Set<string>>(new Set());
  const [itemToShare, setItemToShare] = useState<{ imageUrl?: string; videoUrl?: string; caption: string } | null>(null);

  const isQuotaError = error === "QUOTA_EXCEEDED" || bodyError === "QUOTA_EXCEEDED";

  const handleOpenKeySelection = async () => {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      window.location.reload();
    }
  };

  const fetchBodyData = async () => {
    setIsBodyProfileLoading(true);
    setBodyError(null);
    try {
        const profile = await getAiBodyMeasurements(userImage);
        try {
            const mesh = await getAiBodyMesh(userImage);
            profile.bodyMeshSvg = mesh;
        } catch (e) { console.warn("Mesh failed."); }
        setBodyProfile(profile);
        return profile;
    } catch (e: any) {
        setBodyError(e.message);
        return null;
    } finally {
        setIsBodyProfileLoading(false);
    }
  };

  const generateTryOn = async (profile: UserProfile, specificOutfit?: Outfit) => {
    setIsTryOnLoading(true);
    setError(null);
    try {
        const targetOutfit: Outfit = specificOutfit || initialOutfit || { 
            name: product.name, 
            description: `Stylish look for ${product.name}`, 
            items: [{ name: product.name, price: product.price, brand: 'StyleFit', url: '' }] 
        };
        const result = await virtualTryOn(userImage, targetOutfit, product, profile);
        setTriedOnImage(result);
        if (!specificOutfit) {
            // If it's the main product, scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } catch (e: any) {
        setError(e.message);
    } finally {
        setIsTryOnLoading(false);
    }
  };

  const handleOutfitTryOn = (outfit: Outfit) => {
    if (!bodyProfile) return;
    generateTryOn({ gender: bodyProfile.gender, ageCategory: bodyProfile.ageCategory }, outfit);
  };

  const fetchSizeRec = async (profile: BodyProfile) => {
    setIsSizeLoading(true);
    try {
        const rec = await getRecommendedSize(product, profile);
        setSizeRecommendation(rec);
    } catch (e: any) { console.error("Size rec failed", e); } finally { setIsSizeLoading(false); }
  };

  const fetchOutfits = async (profile: UserProfile) => {
    setAreOutfitsLoading(true);
    try {
        let result = await getOutfitRecommendations(product, profile);
        if (initialOutfit) result = [initialOutfit, ...result.filter(o => o.name !== initialOutfit.name)];
        setOutfits(result.map(o => ({ ...o, items: o.items || [] })));
    } catch (e: any) { 
        console.error("Outfits failed", e);
        setError(e.message); 
    } finally { setAreOutfitsLoading(false); }
  };

  useEffect(() => {
    let isMounted = true;
    const runAll = async () => {
        const profile = await fetchBodyData();
        if (profile && isMounted) {
            const userProf: UserProfile = { gender: profile.gender, ageCategory: profile.ageCategory };
            await Promise.allSettled([
                generateTryOn(userProf),
                fetchSizeRec(profile),
                fetchOutfits(userProf)
            ]);
        }
    };
    runAll();
    return () => { isMounted = false; };
  }, [userImage, product.id]); // Stability improvement: only refetch on ID change

  // Background Try-On for suggested outfits (throttled to save quota)
  useEffect(() => {
    if (!userImage || !bodyProfile || outfits.length === 0) return;
    
    let isProcessing = true;
    const processNext = async () => {
        const userProf: UserProfile = { gender: bodyProfile.gender, ageCategory: bodyProfile.ageCategory };
        for (let i = 0; i < outfits.length; i++) {
            if (!isProcessing) break;
            const currentOutfit = outfits[i];
            if (!currentOutfit.imageUrl && !currentOutfit.error) {
                try {
                    // Check if initialOutfit matches to avoid redundant generation
                    if (initialOutfit && currentOutfit.name === initialOutfit.name && triedOnImage) {
                         setOutfits(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], imageUrl: triedOnImage };
                            return updated;
                        });
                        continue;
                    }

                    const img = await virtualTryOn(userImage, currentOutfit, product, userProf);
                    if (isProcessing) {
                        setOutfits(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], imageUrl: img };
                            return updated;
                        });
                    }
                    await new Promise(r => setTimeout(r, 2000)); // Quota friendly delay
                } catch (e: any) {
                    if (isProcessing) {
                        setOutfits(prev => {
                            const updated = [...prev];
                            updated[i] = { ...updated[i], error: e.message };
                            return updated;
                        });
                    }
                }
            }
        }
    };
    processNext();
    return () => { isProcessing = false; };
  }, [userImage, outfits.length, !!bodyProfile]);

  return (
    <div className="space-y-12 animate-fade-in" dir="rtl">
      {isQuotaError && (
        <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100 text-center shadow-sm">
            <h3 className="text-xl font-black text-purple-900 mb-2">انتهت حصة الاستخدام المجانية! 🚀</h3>
            <p className="text-purple-700 text-sm mb-4">استخدم مفتاحك الخاص لتجاوز الانتظار فوراً وبمجانية تامة.</p>
            <button onClick={handleOpenKeySelection} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:bg-purple-700 transition-all">
                استخدم مفتاحي الخاص
            </button>
        </div>
      )}

      <section className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-50 overflow-hidden">
        <h2 className="text-2xl font-black mb-6 text-center">
            {triedOnImage && outfits.find(o => o.imageUrl === triedOnImage)?.name ? `إطلالة: ${outfits.find(o => o.imageUrl === triedOnImage)?.name} ✨` : `قياس: ${product.name} ✨`}
        </h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="relative aspect-[3/4] bg-gray-50 rounded-[2rem] overflow-hidden shadow-inner">
             {isTryOnLoading ? (
              <LoadingSpinner text="جاري تنسيق الإطلالة عليك..." />
            ) : triedOnImage ? (
              <img src={triedOnImage} alt="Try-on" className="w-full h-full object-cover animate-fade-in" />
            ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <p className="text-red-500 font-bold mb-4">{error || "حدث خطأ"}</p>
                    <button onClick={() => bodyProfile && generateTryOn(bodyProfile)} className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold">إعادة المحاولة</button>
                </div>
            )}
            
            <div className="absolute top-4 right-4 flex flex-col gap-2">
                 <div className="bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/50 flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-purple-600"/>
                    <span className="text-[10px] font-black text-purple-900">StyleFit AI</span>
                 </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem]">
              {isSizeLoading ? (
                 <SkeletonLoader className="h-24 w-full rounded-2xl"/>
              ) : sizeRecommendation ? (
                <div className="text-right space-y-3">
                    <div className="flex justify-between items-center flex-row-reverse">
                        <span className="text-3xl font-black text-indigo-700">{sizeRecommendation.size}</span>
                        <span className="font-bold text-indigo-900">المقاس المقترح:</span>
                    </div>
                    <p className="text-sm text-indigo-700 font-medium leading-relaxed">{sizeRecommendation.analysis}</p>
                    <div className="pt-2">
                        <div className="w-full bg-indigo-200 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${sizeRecommendation.confidence}%` }}></div>
                        </div>
                    </div>
                </div>
              ) : (
                <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">تعذر اقتراح مقاس حالياً</p>
                </div>
              )}
            </div>
            
            {triedOnImage && outfits.find(o => o.imageUrl === triedOnImage)?.stylistNote && (
                 <div className="bg-amber-50 p-5 rounded-[1.5rem] border border-amber-100">
                    <h4 className="font-black text-amber-900 text-xs mb-2 flex items-center gap-2 justify-end">نصيحة المنسق الذكي <SparklesIcon className="w-3 h-3"/></h4>
                    <p className="text-xs text-amber-700 leading-relaxed italic">{outfits.find(o => o.imageUrl === triedOnImage)?.stylistNote}</p>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={() => triedOnImage && setItemToShare({ imageUrl: triedOnImage, caption: `رأيكم في هذا التنسيق من #StyleFit؟` })}
                    disabled={!triedOnImage}
                    className="flex-1 bg-green-500 text-white font-black py-4 rounded-2xl shadow-lg hover:opacity-90 disabled:opacity-30"
                >
                    مشاركة
                </button>
                <button
                    onClick={() => { if(triedOnImage) onSaveOutfit({imageUrl: triedOnImage, prompt: product.name}); setIsSaved(true); }}
                    disabled={!triedOnImage || isSaved}
                    className={`flex-1 font-black py-4 rounded-2xl shadow-lg transition-all ${isSaved ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                    {isSaved ? 'تم الحفظ' : 'حفظ'}
                </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-8 rounded-[2.5rem] shadow-xl text-right border border-gray-50">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2 justify-end">تحليل شكل الجسد (AI) <SparklesIcon className="w-5 h-5 text-purple-600"/></h2>
        {isBodyProfileLoading ? (
            <LoadingSpinner text="جاري تحليل أبعاد الجسد..." />
        ) : bodyProfile ? (
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { l: 'الطول', v: bodyProfile.height },
                            { l: 'الوزن', v: bodyProfile.weight },
                            { l: 'الصدر', v: bodyProfile.chest },
                            { l: 'الخصر', v: bodyProfile.waist }
                        ].map((stat, i) => (
                            <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">{stat.l}</p>
                                <p className="text-xl font-black text-gray-800">{stat.v}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="relative aspect-square bg-slate-900 rounded-[2.5rem] overflow-hidden group shadow-2xl">
                     <img src={userImage} alt="Analysis" className="w-full h-full object-cover opacity-50 blur-sm group-hover:blur-0 transition-all duration-700" />
                     {bodyProfile.bodyMeshSvg && (
                        <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none" dangerouslySetInnerHTML={{ __html: bodyProfile.bodyMeshSvg }} />
                     )}
                </div>
            </div>
        ) : null}
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-black text-center">تنسيقات خبير الموضة الذكي 🎩</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {areOutfitsLoading ? (
                 <>
                    <SkeletonLoader className="h-96 rounded-[2.5rem]"/>
                    <SkeletonLoader className="h-96 rounded-[2.5rem]"/>
                 </>
            ) : outfits.map((o, idx) => (
                <div key={idx} className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col transition-all hover:shadow-2xl hover:-translate-y-1">
                    <div className="relative aspect-[3/4] bg-gray-100">
                        {o.imageUrl ? (
                            <img src={o.imageUrl} alt={o.name} className="w-full h-full object-cover" />
                        ) : o.error ? (
                             <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-red-50">
                                <p className="text-xs font-bold text-red-700 mb-2">تعذر التحميل (حصّة API)</p>
                                <button onClick={() => bodyProfile && handleOutfitTryOn(o)} className="text-[10px] bg-red-600 text-white px-3 py-1.5 rounded-lg font-black">إعادة محاولة</button>
                             </div>
                        ) : <LoadingSpinner text="جاري التنسيق..." size="sm" />}
                        <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase shadow-lg">{o.occasion || 'Designer Pick'}</div>
                        
                        {o.imageUrl && (
                             <button 
                                onClick={() => handleOutfitTryOn(o)}
                                className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 font-black text-[10px] px-4 py-2 rounded-xl shadow-lg flex items-center gap-2"
                             >
                                <CameraIcon className="w-3 h-3"/> قياس هذا الطقم
                             </button>
                        )}
                    </div>
                    <div className="p-6 space-y-4 text-right">
                        <h3 className="text-xl font-black text-gray-900">{o.name}</h3>
                        {o.stylistNote && (
                             <p className="text-[10px] text-purple-600 font-bold bg-purple-50 p-2 rounded-lg border border-purple-100">💡 {o.stylistNote}</p>
                        )}
                        <p className="text-sm text-gray-500 line-clamp-2">{o.description}</p>
                        <ShopThisLook outfit={o} bodyProfile={bodyProfile} />
                    </div>
                </div>
            ))}
          </div>
      </section>

      {itemToShare && <ShareModal imageUrl={itemToShare.imageUrl} initialCaption={itemToShare.caption} onClose={() => setItemToShare(null)} onShare={(cap) => { onShareOutfit({ user: currentUser, outfitImageUrl: itemToShare.imageUrl, caption: cap }); setItemToShare(null); }} />}
    </div>
  );
};

export default VirtualDressingRoom;
