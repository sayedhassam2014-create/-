
import React, { useState } from 'react';
import { ProductSearchOutfit } from '../types';
import { getProductSearchRecommendations } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import CopyIcon from './icons/CopyIcon';
import LoadingSpinner from './LoadingSpinner';
import FilterSelector from './FilterSelector';

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
    
    if (storeUrlMap[sanitizedName]) {
        return storeUrlMap[sanitizedName];
    }
    
    return `https://www.google.com/search?q=${encodeURIComponent(storeName + ' Egypt online store')}`;
};

const KeywordsSection: React.FC<{ title: string, keywords: string[], lang: 'en' | 'ar' }> = ({ title, keywords, lang }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(keywords.join(', '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!Array.isArray(keywords) || keywords.length === 0) {
        return null;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-bold text-gray-700">{title}</h4>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-purple-600 font-semibold"
                >
                    <CopyIcon className="w-3.5 h-3.5" />
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                    <span key={index} className={`text-sm px-3 py-1 rounded-full ${lang === 'ar' ? 'bg-teal-100 text-teal-800' : 'bg-purple-100 text-purple-800'}`}>
                        {keyword}
                    </span>
                ))}
            </div>
        </div>
    );
};


const ProductFinderView: React.FC = () => {
    const [occasion, setOccasion] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priceRange, setPriceRange] = useState('');
    const [sortBy, setSortBy] = useState('relevance');
    const [result, setResult] = useState<ProductSearchOutfit[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!occasion || !description) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            // Fix: Removed extra arguments category/priceRange and sortBy to match getProductSearchRecommendations definition
            const response = await getProductSearchRecommendations(occasion, description);
            setResult(response);
        } catch (e) {
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const canGenerate = !isLoading && occasion.trim() && description.trim();

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="text-center">
                <h2 className="text-4xl font-extrabold tracking-tight text-gray-900">🛍️ Product Finder</h2>
                <p className="text-gray-500 mt-2 max-w-2xl mx-auto">Get AI-powered outfit ideas complete with precise search keywords and store recommendations to find real products in your region.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Input Section */}
                <div className="space-y-6 bg-[var(--card)] p-6 rounded-[var(--radius)] shadow-xl self-start sticky top-28 lg:col-span-1">
                    <div>
                        <label htmlFor="occasion" className="block text-sm font-bold text-gray-700 mb-2">Occasion</label>
                        <input
                            id="occasion"
                            type="text"
                            value={occasion}
                            onChange={(e) => setOccasion(e.target.value)}
                            placeholder="e.g., Wedding, Casual, Business"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Describe yourself & your style</label>
                        <textarea
                            id="description"
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g., Slim build male, modern but formal style"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        />
                    </div>
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <FilterSelector
                            title="Category"
                            options={['Tops', 'Bottoms', 'Dresses', 'Outerwear']}
                            selectedValue={category}
                            onSelect={setCategory}
                        />
                        <FilterSelector
                            title="Price Range (EGP)"
                            options={['< 500', '500-1500', '1500+']}
                            selectedValue={priceRange}
                            onSelect={setPriceRange}
                        />
                         <div>
                            <label htmlFor="sort-by" className="block text-sm font-bold text-gray-700 mb-2">Sort By</label>
                            <select
                                id="sort-by"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition bg-white"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="price_low_to_high">Price: Low to High</option>
                                <option value="price_high_to_low">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={!canGenerate}
                        className="w-full primary-gradient text-white font-bold py-3.5 px-6 rounded-xl hover:opacity-90 transition-transform transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {isLoading ? 'Finding...' : 'Find My Outfit'}
                    </button>
                </div>

                {/* Output Section */}
                <div className="lg:col-span-2">
                    <div className="bg-[var(--card)] rounded-[var(--radius)] shadow-xl min-h-[60vh] p-6">
                        {isLoading ? (
                            <LoadingSpinner text="Finding your perfect look..." />
                        ) : error ? (
                            <div className="h-full flex items-center justify-center">
                                <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
                                    <p className="font-bold text-lg">Generation Failed</p>
                                    <p className="text-sm mt-2">{error}</p>
                                </div>
                            </div>
                        ) : result && result.length > 0 ? (
                            <div className="space-y-6 animate-fade-in">
                                <h3 className="text-2xl font-bold text-gray-800 text-center">Outfit Ideas for: <span className="text-purple-600">{occasion}</span></h3>
                                {result.map((outfitResult, outfitIndex) => (
                                    <div key={outfitIndex} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 transition-shadow hover:shadow-lg">
                                        <h4 className="text-xl font-bold text-gray-900 mb-4">{outfitResult.outfitName}</h4>
                                        <div className="space-y-4">
                                            {outfitResult.outfit.map((item, itemIndex) => (
                                                <div key={itemIndex} className="bg-white p-4 rounded-xl border border-gray-200">
                                                    <h3 className="text-lg font-bold text-gray-900">{item.category}: <span className="font-semibold text-gray-700">{item.description}</span></h3>
                                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                                                        <KeywordsSection title="English Keywords" keywords={item.keywords_en} lang="en" />
                                                        <KeywordsSection title="Arabic Keywords (كلمات عربية)" keywords={item.keywords_ar} lang="ar" />
                                                    </div>
                                                    <div className="mt-4 border-t border-gray-200 pt-4">
                                                        <h4 className="text-sm font-bold text-gray-700 mb-2">Recommended Stores</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.recommended_stores.map((store, i) => (
                                                                <a 
                                                                    href={getStoreUrl(store)} 
                                                                    key={i} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900 transition-colors"
                                                                >
                                                                    {store}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-center text-gray-500 p-4">
                                <div>
                                    <p className="font-semibold">Your generated outfit will appear here.</p>
                                    <p className="text-sm mt-1">Fill in the details on the left to get started.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFinderView;
