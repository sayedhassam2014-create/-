
import React, { useState, useEffect } from 'react';
import { AppView, SocialPost, UserClosetItem, Product, Outfit, User, DailyChallenge, StyleBattle } from '../types';
import SearchIcon from './icons/SearchIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import AddItemToClosetModal from './AddItemToClosetModal';
import ProductList from './ProductList';
import UploadIcon from './icons/UploadIcon';
import { recommendStoreItemsForUserItem } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import ShopLinkIcon from './icons/ShopLinkIcon';
import FireIcon from './icons/FireIcon';
import TrophyIcon from './icons/TrophyIcon';
import { currentUser } from '../constants';
import HeartIcon from './icons/HeartIcon';
import SparklesIcon from './icons/SparklesIcon';

interface HomeViewProps {
  setCurrentView: (view: AppView) => void;
  closetItems: UserClosetItem[];
  socialPosts: SocialPost[];
  onAddClosetItem: (item: Omit<UserClosetItem, 'id'>) => void;
  onRequestUserImage: () => void;
  products: Product[];
  onStartTryOn: (product: Product, outfit?: Outfit) => void;
  onGetStyleIdeas: (product: Product) => void;
}

const HomeView: React.FC<HomeViewProps> = ({
  setCurrentView,
  closetItems,
  socialPosts,
  onAddClosetItem,
  products,
  onStartTryOn,
  onGetStyleIdeas,
}) => {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [matchImage, setMatchImage] = useState<string | null>(null);
  const [matchResults, setMatchResults] = useState<Outfit[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [isQuotaWait, setIsQuotaWait] = useState(false);
  
  const [activeBattle, setActiveBattle] = useState<StyleBattle | null>({
      id: 'battle_1',
      imgA: 'https://images.pexels.com/photos/157675/fashion-men-s-individuality-black-and-white-157675.jpeg?auto=compress&cs=tinysrgb&w=400',
      imgB: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=400',
      userA: 'أحمد',
      userB: 'عمر',
      votesA: 45,
      votesB: 42
  });
  const [votedSide, setVotedSide] = useState<'A' | 'B' | null>(null);

  const handleVote = (side: 'A' | 'B') => {
      if (votedSide || !activeBattle) return;
      setVotedSide(side);
      setActiveBattle(prev => prev ? {
          ...prev,
          votesA: side === 'A' ? prev.votesA + 1 : prev.votesA,
          votesB: side === 'B' ? prev.votesB + 1 : prev.votesB
      } : null);
  };

  const handleItemAdded = (imageBase64: string) => {
    onAddClosetItem({ imageUrl: imageBase64 });
    setIsAddItemModalOpen(false);
  };
  
  const handleMatchUpload = async (imageBase64: string) => {
      setMatchImage(imageBase64);
      setIsMatching(true);
      setMatchError(null);
      setIsQuotaWait(false);
      setIsAddItemModalOpen(false);

      try {
          // Fix: Removed the second string argument that was causing an expected argument error
          const results = await recommendStoreItemsForUserItem(imageBase64);
          setMatchResults(results);
      } catch (err: any) {
          if (err?.message === "QUOTA_LIMIT_REACHED") {
              setIsQuotaWait(true);
              setMatchError("نحن ننتظر تجديد حصة الذكاء الاصطناعي.. ثواني ونعود!");
          } else {
              setMatchError("عذراً، حدث خطأ أثناء البحث. حاول مرة أخرى.");
          }
      } finally {
          setIsMatching(false);
      }
  };

  const dailyChallenge: DailyChallenge = {
      id: 'ch_1',
      title: 'ضيف في فرح صيفي',
      description: 'نسق أجمل طقم كلاسيك خفيف مناسب للأفراح الخارجية في الصيف.',
      participantsCount: 1240,
      timeLeft: '04:22:10',
      reward: 'خصم 20% من نمشي'
  };

  const getTimeGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'صباح الأناقة';
      if (hour < 18) return 'مساء الجمال';
      return 'أحلام سعيدة';
  };

  return (
    <div className="space-y-10 animate-fade-in pb-20" dir="rtl">
      
      {/* Quota Awareness Banner */}
      {isQuotaWait && (
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-3xl flex items-center gap-4 animate-slide-in-up">
              <div className="bg-white p-3 rounded-2xl shadow-sm animate-bounce">⏳</div>
              <div className="flex-1">
                  <p className="text-purple-900 text-sm font-black mb-1">الذكاء الاصطناعي يأخذ قسطاً من الراحة!</p>
                  <p className="text-purple-700 text-xs font-medium">نحن بانتظار تجديد الحصة المجانية. يمكنك تصفح نبض المجتمع بالأسفل ريثما نعود.</p>
              </div>
          </div>
      )}

      {/* Personalized Header */}
      <div className="flex justify-between items-center px-2">
          <div className="text-right">
            <p className="text-gray-500 font-medium text-sm">{getTimeGreeting()}،</p>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{currentUser.name}</h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-2xl text-xs font-black border border-purple-200 shadow-sm">
                350 نقطة ⭐
             </div>
          </div>
      </div>

      {/* Daily Challenge Banner */}
      <div 
        onClick={() => setCurrentView(AppView.AI_STYLIST)}
        className="relative bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl cursor-pointer hover:shadow-purple-200/50 transition-all transform hover:-translate-y-1 group overflow-hidden"
      >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/20 to-blue-600/20"></div>
          <div className="relative z-10 text-right">
              <div className="flex items-center justify-end gap-3 mb-4">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{dailyChallenge.timeLeft} متبقي</span>
                  <span className="bg-purple-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <FireIcon className="w-3 h-3" /> تحدي اليوم
                  </span>
              </div>
              <h2 className="text-3xl font-black mb-2">{dailyChallenge.title}</h2>
              <p className="text-slate-400 text-sm mb-6 max-w-sm mr-0 ml-auto leading-relaxed">{dailyChallenge.description}</p>
              
              <div className="flex items-center justify-between flex-row-reverse">
                  <div className="flex flex-row-reverse -space-x-3">
                     {[...Array(3)].map((_, i) => (
                         <img key={i} src={`https://i.pravatar.cc/150?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-slate-900 shadow-lg" alt="User" />
                     ))}
                     <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black">
                         +1.2k
                     </div>
                  </div>
                  <button className="bg-white text-slate-900 font-black py-3 px-6 rounded-2xl text-sm hover:scale-105 transition-transform">
                      شارك واكسب الجائزة 🎁
                  </button>
              </div>
          </div>
      </div>

      {/* Social Pulse Section */}
      <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="font-black text-2xl text-gray-900">نبض المجتمع 🌍</h2>
            <button onClick={() => setCurrentView(AppView.SOCIAL_FEED)} className="text-sm font-bold text-purple-600">اكتشف المزيد</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
              {socialPosts.slice(0, 3).map((post, idx) => (
                  <div key={idx} className="flex-shrink-0 w-40 space-y-2 group cursor-pointer" onClick={() => setCurrentView(AppView.SOCIAL_FEED)}>
                      <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-lg group-hover:shadow-purple-200 transition-all">
                          <img src={post.outfitImageUrl} className="w-full h-full object-cover" alt="Post" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all"></div>
                      </div>
                      <div className="flex items-center gap-2 px-1">
                          <img src={post.user.avatarUrl} className="w-5 h-5 rounded-full" alt="User" />
                          <span className="text-[10px] font-bold text-gray-600 truncate">@{post.user.name}</span>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Independent Style Matcher Widget */}
      <div className="bg-white border border-gray-100 p-8 rounded-[3rem] shadow-xl relative overflow-hidden">
         <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
         <div className="relative z-10 text-right">
             <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                 <div className="md:w-2/5">
                    <h2 className="font-black text-3xl text-gray-900 mb-4">كمل طقمك بذكاء ✨</h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                        صور أي قطعة في دولابك والذكاء الاصطناعي هيقولك إيه اللي يليق عليها من كل المتاجر (زارا، نمشي، أمازون) فوراً.
                    </p>
                    
                    {!matchImage ? (
                        <button 
                            onClick={() => setIsAddItemModalOpen(true)}
                            className="w-full bg-purple-50 border-2 border-dashed border-purple-200 text-purple-700 font-black py-6 rounded-[2rem] hover:bg-purple-100 hover:border-purple-400 transition-all flex flex-col items-center gap-3 group"
                        >
                            <div className="bg-white p-4 rounded-full shadow-md group-hover:scale-110 transition-transform">
                                <UploadIcon className="w-8 h-8 text-purple-600"/>
                            </div>
                            <span>صور القطعة من هنا</span>
                        </button>
                    ) : (
                         <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square max-w-[240px] border-4 border-white mr-auto ml-0 md:mr-0 md:ml-auto">
                             <img src={matchImage} alt="Your item" className="w-full h-full object-cover" />
                             <button 
                                onClick={() => { setMatchImage(null); setMatchResults([]); setMatchError(null); setIsQuotaWait(false); }}
                                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-gray-900 font-black text-xs px-4 py-2 rounded-xl shadow-lg"
                             >
                                تغيير الصورة
                             </button>
                         </div>
                    )}
                 </div>

                 <div className="md:w-3/5 w-full bg-gray-50 rounded-[2.5rem] border border-gray-100 p-6 min-h-[300px] flex items-center justify-center">
                    {!matchImage ? (
                         <div className="text-center opacity-40">
                             <div className="flex justify-center mb-4 gap-4">
                                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">👕</div>
                                 <div className="flex items-center text-2xl font-black">+</div>
                                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">👖</div>
                             </div>
                             <p className="text-sm font-bold">ابدأ بتصوير قطعة لتحليلها</p>
                         </div>
                    ) : isMatching ? (
                        <LoadingSpinner text="بنبحث لك في كل البراندات..." isQuotaWait={isQuotaWait} />
                    ) : matchError ? (
                        <div className="text-center p-6 bg-red-50 rounded-2xl border border-red-100">
                           <p className="text-red-500 font-bold mb-2">{matchError}</p>
                           {isQuotaWait && <p className="text-red-400 text-xs font-medium">الحصة المجانية تجدد كل دقيقة، يرجى الصبر قليلاً.</p>}
                        </div>
                    ) : (
                        <div className="w-full">
                            <h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-6 text-right">تنسيقات مقترحة لقطعتك:</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {matchResults.map((outfit, idx) => (
                                    <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col animate-fade-in-up" style={{animationDelay: `${idx * 100}ms`}}>
                                        <div className="flex-1 text-right">
                                            <h4 className="font-black text-gray-900 text-sm mb-1">{outfit.items[0].name}</h4>
                                            <p className="text-xs text-purple-600 font-bold mb-3">{outfit.items[0].price}</p>
                                            <div className="bg-purple-50 text-purple-700 text-[10px] p-3 rounded-2xl font-bold leading-relaxed border border-purple-100">
                                                "{outfit.description}"
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            {outfit.items[0].url && (
                                                <a href={outfit.items[0].url} target="_blank" rel="noreferrer" className="w-full bg-slate-900 text-white text-xs font-black py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                                                    <ShopLinkIcon className="w-4 h-4"/> تسوق الآن
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>
             </div>
         </div>
      </div>

       {/* Style Battle 🔥 */}
       {activeBattle && (
           <div className="bg-white rounded-[3rem] shadow-xl p-8 animate-slide-in-up text-right border border-gray-50">
               <div className="flex flex-row-reverse justify-between items-center mb-6">
                   <h2 className="font-black text-2xl text-gray-900">معركة الستايل 🔥</h2>
                   <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black">
                       <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                       </span>
                       مباشر الآن
                   </div>
               </div>
               <div className="grid grid-cols-2 gap-6 relative">
                   <div 
                        onClick={() => handleVote('A')}
                        className={`relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 group ${votedSide === 'A' ? 'ring-8 ring-purple-500 scale-[1.05] z-20' : (votedSide ? 'opacity-30 grayscale' : 'hover:scale-105')}`}
                   >
                       <img src={activeBattle.imgA} alt="Look A" className="w-full aspect-[3/4] object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-right">
                           <p className="text-white font-black text-sm">@{activeBattle.userA}</p>
                           {votedSide && (
                               <div className="mt-3 bg-white/20 backdrop-blur-md rounded-full h-2.5 overflow-hidden">
                                   <div className="bg-purple-400 h-full transition-all duration-1000" style={{width: `${(activeBattle.votesA / (activeBattle.votesA + activeBattle.votesB)) * 100}%`}}></div>
                               </div>
                           )}
                       </div>
                   </div>
                   
                   <div 
                        onClick={() => handleVote('B')}
                        className={`relative rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 group ${votedSide === 'B' ? 'ring-8 ring-purple-500 scale-[1.05] z-20' : (votedSide ? 'opacity-30 grayscale' : 'hover:scale-105')}`}
                   >
                       <img src={activeBattle.imgB} alt="Look B" className="w-full aspect-[3/4] object-cover" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-right">
                           <p className="text-white font-black text-sm">@{activeBattle.userB}</p>
                           {votedSide && (
                               <div className="mt-3 bg-white/20 backdrop-blur-md rounded-full h-2.5 overflow-hidden">
                                   <div className="bg-purple-400 h-full transition-all duration-1000" style={{width: `${(activeBattle.votesB / (activeBattle.votesA + activeBattle.votesB)) * 100}%`}}></div>
                               </div>
                           )}
                       </div>
                   </div>
                   
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-slate-900 font-black text-2xl w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-4 border-gray-50 z-30">
                       VS
                   </div>
               </div>
               {votedSide && (
                   <div className="text-center mt-6 animate-fade-in">
                       <p className="text-lg font-black text-purple-600">شكراً لتصويتك! كسبت +10 نقاط ⭐</p>
                   </div>
               )}
           </div>
       )}

      {/* Featured Products */}
       <div className="bg-white p-8 rounded-[3rem] shadow-xl text-right border border-gray-50">
        <div className="flex flex-row-reverse justify-between items-center mb-8">
            <h2 className="font-black text-2xl tracking-tight text-gray-900">الأكثر رواجاً في المتاجر 🛍️</h2>
            <button className="text-sm font-bold text-purple-600 hover:underline">عرض الكل</button>
        </div>
         <ProductList
            products={products}
            onStartTryOn={onStartTryOn}
            onGetStyleIdeas={onGetStyleIdeas}
          />
       </div>

      {isAddItemModalOpen && (
        <AddItemToClosetModal onClose={() => setIsAddItemModalOpen(false)} onItemAdded={matchImage ? handleItemAdded : handleMatchUpload} />
      )}
    </div>
  );
};

export default HomeView;
