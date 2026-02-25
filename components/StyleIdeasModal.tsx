
import React, { useState, useEffect } from 'react';
// Fix: Import BodyProfile for type safety
import { Product, Outfit, UserProfile, ProductItem, BodyProfile } from '../types';
// Fix: Import getAiBodyMeasurements to fetch body profile data
import { getOutfitRecommendations, virtualTryOn, getAiUserProfile, getAiBodyMeasurements } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import CameraIcon from './icons/CameraIcon';
import FilterSelector from './FilterSelector';
import ShopLinkIcon from './icons/ShopLinkIcon';
import LoadingSpinner from './LoadingSpinner';
import SkeletonLoader from './SkeletonLoader';
import CopyIcon from './icons/CopyIcon';
import ShopThisLook from './ShopThisLook';

interface StyleIdeasModalProps {
  product: Product;
  onClose: () => void;
  onStartTryOn: (product: Product, outfit?: Outfit) => void;
  userImage: string | null;
  onRequestUserImage: () => void;
}

const OutfitImageError: React.FC<{ message: string }> = ({ message }) => (
    <div className="w-full h-full bg-red-100 text-red-700 flex flex-col items-center justify-center rounded-lg p-4 text-center">
        <p className="font-bold text-sm mb-1">Oops!</p>
        <p className="text-xs">{message}</p>
    </div>
);

const StyleIdeasModal: React.FC<StyleIdeasModalProps> = ({ product, onClose, onStartTryOn, userImage, onRequestUserImage }) => {
    const [outfits, setOutfits] = useState<Outfit[]>([]);
    const [isTextLoading, setIsTextLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [occasion, setOccasion] = useState<string>('');
    const [season, setSeason] = useState<string>('');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    // Fix: Add state for bodyProfile to pass to child components for proper sizing analysis
    const [bodyProfile, setBodyProfile] = useState<BodyProfile | null>(null);

    // Effect 1: Fetch user profile if userImage is available
    useEffect(() => {
        if (userImage) {
            // Fix: Fetch both user profile and body measurements in parallel
            Promise.all([
                getAiUserProfile(userImage),
                getAiBodyMeasurements(userImage)
            ])
            .then(([profile, bodyMeasurements]) => {
                setUserProfile(profile);
                setBodyProfile(bodyMeasurements);
            })
            .catch(err => {
                console.error("Failed to get profile for style ideas:", err);
                setUserProfile(null);
                setBodyProfile(null);
            });
        } else {
            setUserProfile(null);
            // Fix: Reset bodyProfile when user image is removed
            setBodyProfile(null);
        }
    }, [userImage]);

    // Effect 2: Fetch text-based outfit recommendations when component mounts, filters change, or profile is identified.
    useEffect(() => {
        // If a user image exists but profile isn't loaded yet, wait.
        if (userImage && !userProfile) {
            setIsTextLoading(true); // Ensure loading state while waiting
            return;
        }

        const fetchOutfits = async () => {
            setIsTextLoading(true);
            setError(null);
            // Gender is a required parameter, so we use a fallback if not available
            const profileForApi = userProfile || { gender: 'Female', ageCategory: 'Adult' }; 

            try {
                // Fix: Removed the extra third argument that was causing a type error
                const recommendedOutfits = await getOutfitRecommendations(product, profileForApi);
                // Reset image generation status when re-fetching
                const outfitsWithoutImages = recommendedOutfits.map(o => ({...o, imageUrl: undefined, error: undefined}));
                setOutfits(outfitsWithoutImages);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Could not fetch style ideas.');
            } finally {
                setIsTextLoading(false);
            }
        };
        fetchOutfits();
    }, [product, occasion, season, userProfile, userImage]);

    // Effect 3: Generate images for outfits in parallel once user image and text are ready.
    useEffect(() => {
        if (!userImage || outfits.length === 0 || !userProfile) {
            return;
        }

        const needsProcessing = outfits.some(o => !o.imageUrl && !o.error);
        if (!needsProcessing) {
            return;
        }

        const generateAllOutfitImages = async () => {
            const processedOutfits = await Promise.all(
                outfits.map(async (outfit) => {
                    if (outfit.imageUrl || outfit.error) {
                        return outfit;
                    }
                    try {
                        const imageGenPrompt = `A person wearing the following outfit. Name: "${outfit.name}". Items: ${outfit.items.map(item => item.name).join(', ')}. Style: ${outfit.description}.`;
                        const outfitImage = await virtualTryOn(userImage, outfit, product, userProfile, imageGenPrompt);
                        return { ...outfit, imageUrl: outfitImage };
                    } catch (e) {
                        const errorMessage = e instanceof Error ? e.message : "Could not generate this look.";
                        return { ...outfit, error: errorMessage };
                    }
                })
            );
            
            setOutfits(processedOutfits);
        };
        
        generateAllOutfitImages();
    }, [userImage, product, outfits, userProfile]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="style-ideas-title">
            <div className="bg-white rounded-2xl shadow-2xl p-6 m-4 max-w-4xl w-full text-left transform transition-all animate-fade-in-up flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6 flex-shrink-0">
                    <h2 id="style-ideas-title" className="text-2xl font-bold text-gray-800 pr-4">Style Ideas for <span className="text-purple-600">{product.name}</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none p-1 -m-1" aria-label="Close modal">&times;</button>
                </div>

                <div className="flex flex-col md:flex-row gap-6 flex-grow min-h-0">
                    {/* Left Column */}
                    <div className="w-full md:w-1/3 flex-shrink-0">
                        <div className="sticky top-6">
                            <img src={product.imageUrl} alt={product.name} className="w-full object-cover rounded-lg aspect-[3/4]" />
                            <div className="mt-4 space-y-2">
                                <button
                                    onClick={() => onStartTryOn(product)}
                                    className="w-full primary-gradient text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    <CameraIcon className="w-5 h-5"/>
                                    Try On This Item
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Right Column */}
                    <div className="w-full md:w-2/3 overflow-y-auto pr-2">
                        <div className="space-y-4 mb-6 bg-gray-50 p-4 rounded-lg">
                            <FilterSelector
                                title="Filter by Occasion"
                                options={['Casual', 'Office', 'Party', 'Travel']}
                                selectedValue={occasion}
                                onSelect={setOccasion}
                            />
                            <FilterSelector
                                title="Filter by Season"
                                options={['Summer', 'Winter']}
                                selectedValue={season}
                                onSelect={setSeason}
                            />
                        </div>
                        {isTextLoading ? (
                            <LoadingSpinner text="Generating style ideas..." />
                        ) : error ? (
                             <div className="h-full flex items-center justify-center">
                                <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
                                    <p className="font-bold">Could not get ideas</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {!userImage && (
                                    <div className="p-4 bg-purple-50 rounded-lg text-center border border-purple-200">
                                        <h3 className="font-bold text-purple-800">See these looks on you!</h3>
                                        <p className="text-sm text-purple-700 mt-1 mb-3">Add a photo of yourself to virtually try on these generated outfits.</p>
                                        <button 
                                            onClick={onRequestUserImage}
                                            className="bg-purple-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                                        >
                                            Add Your Photo
                                        </button>
                                    </div>
                                )}
                                {outfits.map((outfit, index) => (
                                    <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-fade-in-up" style={{ animationDelay: `${index * 150}ms`, opacity: 0 }}>
                                       {userImage && (
                                           <div className="w-full aspect-[3/4] bg-gray-100">
                                                {outfit.imageUrl ? (
                                                    <img src={outfit.imageUrl} alt={outfit.name} className="w-full h-full object-cover" />
                                                ) : outfit.error ? (
                                                    <OutfitImageError message={outfit.error} />
                                                ) : (
                                                    <SkeletonLoader className="w-full h-full" />
                                                )}
                                           </div>
                                       )}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-800">{outfit.name}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">{outfit.description}</p>
                                                </div>
                                                <button 
                                                    onClick={() => onStartTryOn(product, outfit)}
                                                    disabled={!userImage || !outfit.imageUrl}
                                                    className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2 flex-shrink-0 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    aria-label={`Try on ${outfit.name}`}
                                                >
                                                    <CameraIcon className="w-4 h-4" />
                                                    Try On
                                                </button>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                               <ShopThisLook outfit={outfit} bodyProfile={bodyProfile} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StyleIdeasModal;
