
import React from 'react';
import { Outfit, ProductItem, BodyProfile, SizeRecommendation, Product } from '../types';
import ShopLinkIcon from './icons/ShopLinkIcon';
import CopyIcon from './icons/CopyIcon';
import { getRecommendedSize } from '../services/geminiService';

const getStoreUrl = (storeName: string): string => {
    const sanitizedName = storeName.toLowerCase().replace(/\s+/g, '').replace('&', '');
    const storeUrlMap: { [key: string]: string } = {
        'zara': 'https://www.zara.com/eg/',
        'hm': 'https://eg.hm.com/',
        'adidas': 'https://www.adidas.com.eg/',
        'nike': 'https://www.nike.com/eg/',
        'noon': 'https://www.noon.com/egypt-en/',
        'namshi': 'https://en-egypt.namshi.com/',
        'ounass': 'https://www.ounass.eg/',
        'americaneagle': 'https://www.americaneagle.com.eg/',
        'defacto': 'https://eg.defactofashion.com/',
        'lcwaikiki': 'https://www.lcwaikiki.eg/',
    };
    if (storeUrlMap[sanitizedName]) return storeUrlMap[sanitizedName];
    return `https://www.google.com/search?q=${encodeURIComponent(storeName + ' Egypt online store')}`;
};

const KeywordsSection: React.FC<{ title: string, keywords: string[], lang: 'en' | 'ar' }> = ({ title, keywords, lang }) => {
    const [copied, setCopied] = React.useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(keywords.join(', '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    if (!keywords || keywords.length === 0) return null;
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center flex-row-reverse">
                <h5 className="text-[10px] font-black text-gray-400 uppercase">{title}</h5>
                <button onClick={handleCopy} className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                    <CopyIcon className="w-3 h-3" /> {copied ? 'تم!' : 'نسخ'}
                </button>
            </div>
            <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="flex flex-wrap gap-1">
                {keywords.map((keyword, index) => (
                    <span key={index} className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${lang === 'ar' ? 'bg-teal-50 text-teal-700' : 'bg-purple-50 text-purple-700'}`}>
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
    );
};

interface ShopThisLookProps {
    outfit: Outfit;
    bodyProfile: BodyProfile | null;
}

const ShopThisLook: React.FC<ShopThisLookProps> = ({ outfit, bodyProfile }) => {
    const [sizeData, setSizeData] = React.useState<Record<string, { rec: SizeRecommendation | null; loading: boolean }>>({});
    
    // تأكد من وجود مصفوفة العناصر لتجنب الانهيار
    const items = outfit.items || [];

    const handleGetSize = async (item: ProductItem) => {
        if (!bodyProfile) return;
        const key = item.name + item.brand;
        setSizeData(p => ({ ...p, [key]: { rec: null, loading: true } }));
        try {
            const dummyProd: Product = { id: 'temp', name: item.name, price: item.price, imageUrl: '' };
            const rec = await getRecommendedSize(dummyProd, bodyProfile);
            setSizeData(p => ({ ...p, [key]: { rec, loading: false } }));
        } catch (e) {
            setSizeData(p => ({ ...p, [key]: { rec: null, loading: false } }));
        }
    };
    
    if (items.length === 0) return null;

    return (
        <div className="space-y-3" dir="rtl">
            {items.map((item, idx) => {
                const key = item.name + item.brand;
                const state = sizeData[key];
                return (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 text-right">
                                <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                <p className="text-[10px] text-gray-400">{item.brand} • {item.price}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                {bodyProfile && !item.isFromCloset && (
                                    state?.loading ? (
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center animate-pulse"><div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
                                    ) : state?.rec ? (
                                        <div className="bg-white px-3 py-1 rounded-xl border border-purple-100 text-center shadow-sm">
                                            <p className="text-[8px] font-black text-gray-400 uppercase">المقاس</p>
                                            <p className="text-sm font-black text-purple-700">{state.rec.size}</p>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleGetSize(item)} className="text-[10px] font-black text-purple-600 bg-white px-3 py-2 rounded-xl shadow-sm border border-purple-50">احسب مقاسك</button>
                                    )
                                )}
                                {item.url && (
                                    <button onClick={() => window.open(item.url, '_blank')} className="p-2.5 bg-slate-900 text-white rounded-xl shadow-md"><ShopLinkIcon className="w-4 h-4"/></button>
                                )}
                            </div>
                        </div>
                        
                        {!item.isFromCloset && item.keywords_en && (
                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                                <KeywordsSection title="كلمات البحث" keywords={item.keywords_ar || []} lang="ar" />
                                <div className="flex flex-wrap gap-1 pt-1">
                                    {(item.recommended_stores || []).map((s, i) => (
                                        <a key={i} href={getStoreUrl(s)} target="_blank" className="text-[9px] bg-white border border-gray-200 px-2 py-0.5 rounded-md font-bold text-gray-600">{s}</a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ShopThisLook;
