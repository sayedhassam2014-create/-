
import React, { useState } from 'react';
import { SavedOutfit } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import FireIcon from './icons/FireIcon';
import ShoppingBagIcon from './icons/ShoppingBagIcon';
import SparklesIcon from './icons/SparklesIcon';
import CheckIcon from './icons/CheckIcon';

const CheckBadge: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-blue-500 text-white rounded-full p-0.5 ${className}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
    </div>
);

interface ProfileViewProps {
  savedOutfits: SavedOutfit[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ savedOutfits }) => {
  const [showPartnerDemo, setShowPartnerDemo] = useState(false);

  const stats = [
    { label: 'نقاط الستايل', value: '350', icon: <TrophyIcon className="w-5 h-5 text-yellow-500" />, sub: 'أفضل 5% هذا الشهر' },
    { label: 'توفير مرتجعات', value: '12', icon: <ShoppingBagIcon className="w-5 h-5 text-green-500" />, sub: 'وفرت ~1,200 ج.م للبراندات' },
    { label: 'سلسلة الالتزام', value: '5 أيام', icon: <FireIcon className="w-5 h-5 text-orange-500" />, sub: 'تحديات يومية مكتملة' },
  ];

  const partnerMetrics = [
    { label: 'زيادة المبيعات المتوقعة', value: '+94%', desc: 'بناءً على تجربة القياس الافتراضي', color: 'text-green-600' },
    { label: 'تقليل المرتجعات', value: '-32%', desc: 'بسبب دقة اختيار المقاس بالـ AI', color: 'text-blue-600' },
    { label: 'تفاعل العملاء', value: 'x4', desc: 'بقاء المستخدم لفترة أطول مع منتجاتكم', color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-10 animate-fade-in" dir="rtl">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">الملف الشخصي</h2>
        <p className="text-gray-500 mt-2">إدارة ستايلك الشخصي وشراكاتنا.</p>
      </div>

      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-xl inline-flex shadow-inner">
            <button 
                onClick={() => setShowPartnerDemo(false)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!showPartnerDemo ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
            >
                بروفايل المستخدم
            </button>
            <button 
                onClick={() => setShowPartnerDemo(true)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${showPartnerDemo ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500'}`}
            >
                بوابة الشركاء (B2B)
            </button>
        </div>
      </div>

      {!showPartnerDemo ? (
        <div className="space-y-10 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 transition-transform hover:scale-[1.02] text-right">
                    <div className="p-3 bg-gray-50 rounded-xl">
                    {stat.icon}
                    </div>
                    <div>
                    <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                    </div>
                </div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative text-right">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -mt-16 -ml-16"></div>
                <div className="relative z-10 flex flex-col md:flex-row-reverse items-center justify-between gap-4">
                    <div className="text-right">
                        <h3 className="text-xl font-bold mb-1">بصمتك الخضراء 🌿</h3>
                        <p className="text-green-100 text-sm max-w-md">
                            كل مرة بتقيس فيها "افتراضياً" بتوفر شحن ومرتجعات وبتحمي البيئة من انبعاثات الكربون.
                        </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center min-w-[120px]">
                        <p className="text-xs font-bold uppercase">CO2 تم توفيره</p>
                        <p className="text-3xl font-black">4.2kg</p>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-6 flex-row-reverse">
                    <h3 className="text-2xl font-bold text-gray-900">أطقمي المحفوظة</h3>
                    <span className="text-sm font-semibold text-gray-500">{savedOutfits.length} طقم</span>
                </div>
                
                {savedOutfits.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-100">
                    <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 font-bold">لسه مفيش أطقم هنا.</p>
                    <button className="text-purple-600 text-sm font-bold mt-2 hover:underline">ابدأ التنسيق الآن</button>
                </div>
                ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {savedOutfits.map((outfit) => (
                    <div key={outfit.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md border border-gray-100">
                        <div className="overflow-hidden relative aspect-[3/4]">
                        <img
                            src={outfit.imageUrl}
                            alt={outfit.prompt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        </div>
                        <div className="p-3 text-right">
                            <p className="text-xs text-gray-500 line-clamp-1 italic">"{outfit.prompt}"</p>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
        </div>
      ) : (
        /* PARTNER DASHBOARD - PITCH MODE */
        <div className="space-y-8 animate-fade-in text-right">
            <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6 justify-end">
                        <h3 className="text-2xl font-bold">بوابة عرض الشركاء (Demo)</h3>
                        <div className="bg-blue-500 p-1 rounded-md"><CheckIcon className="w-4 h-4 text-white"/></div>
                    </div>
                    <p className="text-slate-300 mb-8 max-w-xl mr-0 ml-auto leading-relaxed">
                        اعرض هذه الصفحة على أصحاب البراندات لتريهم كيف سيقوم تطبيق <b>StyleFit</b> بتحويل تجربة التسوق لديهم وزيادة أرباحهم.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {partnerMetrics.map((m, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 backdrop-blur-sm p-5 rounded-2xl">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">{m.label}</p>
                                <p className={`text-4xl font-black mb-1 ${m.color.replace('text-', 'text-white')}`}>{m.value}</p>
                                <p className="text-xs text-slate-500">{m.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h4 className="font-extrabold text-xl mb-6 flex items-center gap-2 justify-end">
                        كيف نساعد البراندات؟
                        <SparklesIcon className="w-5 h-5 text-purple-500" />
                    </h4>
                    <div className="space-y-6">
                        <div className="flex gap-4 flex-row-reverse">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">1</div>
                            <div>
                                <h5 className="font-bold text-gray-900 mb-1">تنسيق ذكي (Cross-Selling)</h5>
                                <p className="text-sm text-gray-500 leading-relaxed">الـ AI سيقترح قطعاً مكملة من متجركم لتكوين "طقم كامل"، مما يرفع قيمة سلة المشتريات.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 flex-row-reverse">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">2</div>
                            <div>
                                <h5 className="font-bold text-gray-900 mb-1">التوثيق (Verified Badge)</h5>
                                <p className="text-sm text-gray-500 leading-relaxed">تظهر منتجاتكم بعلامة التوثيق الزرقاء لزيادة ثقة العميل بأنها قطع أصلية.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 flex-row-reverse">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">3</div>
                            <div>
                                <h5 className="font-bold text-gray-900 mb-1">دليل المقاسات الذكي</h5>
                                <p className="text-sm text-gray-500 leading-relaxed">توفير عناء "الجدول المقاسات" التقليدي، الـ AI يختار المقاس الأنسب بناءً على صورة العميل.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 p-8 rounded-3xl border border-purple-100 flex flex-col justify-center items-center text-center">
                    <div className="bg-white p-4 rounded-2xl shadow-sm mb-6">
                         <ShoppingBagIcon className="w-10 h-10 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-xl text-purple-900 mb-2">جاهز لضم براند جديد؟</h4>
                    <p className="text-sm text-purple-700 mb-8 max-w-xs leading-relaxed">
                        استخدم الـ API المفتوح الخاص بنا لربط مخزون أي براند مع التطبيق في دقائق.
                    </p>
                    <button className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center justify-center gap-2">
                        إرسال دعوة تعاون (Partnership)
                    </button>
                    <p className="text-[10px] text-purple-400 mt-4 uppercase tracking-widest font-bold">StyleFit B2B Solutions</p>
                </div>
            </div>

            {/* Mock Verified Product Preview */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100">
                <h4 className="font-bold text-gray-400 text-xs mb-4 uppercase tracking-wider">مثال لظهور المنتجات الموثقة:</h4>
                <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100 w-fit">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden">
                        <img src="https://images.pexels.com/photos/428340/pexels-photo-428340.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Sample" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5 flex-row-reverse">
                             <h5 className="font-bold text-sm">تيشيرت أبيض كلاسيك</h5>
                             <CheckBadge />
                        </div>
                        <p className="text-xs text-gray-500">براند: زارا (شريك موثق)</p>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
