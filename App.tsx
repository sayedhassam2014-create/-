
import React, { useState, useCallback, useEffect } from 'react';
import { SocialPost, AppView, SavedOutfit, UserClosetItem, Product, Outfit } from './types';
import { initialSocialPosts, topRatedProducts } from './constants';

import Header from './components/Header';
import TryOnModal from './components/TryOnModal';
import SocialFeed from './components/SocialFeed';
import BottomNav from './components/BottomNav';
import AiStylistView from './components/AiStylistView';
import ClosetAIView from './components/ClosetAIView';
import OnboardingTour from './components/OnboardingTour';
import ProfileView from './components/ProfileView';
import VirtualDressingRoom from './components/VirtualDressingRoom';
import HomeView from './components/HomeView';
import StyleIdeasModal from './components/StyleIdeasModal';
import VoiceoverGeneratorView from './components/VoiceoverGeneratorView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isTryOnModalOpen, setIsTryOnModalOpen] = useState<boolean>(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(initialSocialPosts);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [userClosetItems, setUserClosetItems] = useState<UserClosetItem[]>([]);
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [initialOutfit, setInitialOutfit] = useState<Outfit | null>(null);
  const [styleIdeasProduct, setStyleIdeasProduct] = useState<Product | null>(null);

  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    if (!hasCompletedOnboarding) {
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, []);

  const handleTourComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleRequestUserImage = useCallback(() => {
    setIsTryOnModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsTryOnModalOpen(false);
  }, []);

  const handleImageReady = useCallback((imageBase64: string) => {
    setUserImage(imageBase64);
    setIsTryOnModalOpen(false);
  }, []);

  const handleSaveOutfit = useCallback((outfit: Omit<SavedOutfit, 'id' | 'createdAt'>) => {
    const newOutfit: SavedOutfit = {
      ...outfit,
      id: `saved_${Date.now()}`,
      createdAt: Date.now(),
    };
    setSavedOutfits(prev => [newOutfit, ...prev]);
  }, []);

  const handleShareOutfit = useCallback((post: Omit<SocialPost, 'id' | 'likes' | 'comments'>) => {
    const newPost: SocialPost = {
      ...post,
      id: `post_${Date.now()}`,
      likes: 0,
      comments: [],
    };
    setSocialPosts(prev => [newPost, ...prev]);
    setCurrentView(AppView.SOCIAL_FEED);
  }, []);
  
  const handleAddClosetItem = useCallback((item: Omit<UserClosetItem, 'id'>) => {
    const newItem: UserClosetItem = {
      ...item,
      id: `closet_${Date.now()}`,
    };
    setUserClosetItems(prev => [newItem, ...prev]);
  }, []);

  const handleStartTryOn = useCallback((product: Product, outfit?: Outfit) => {
    if (!userImage) {
        handleRequestUserImage();
        return;
    }
    setSelectedProduct(product);
    setInitialOutfit(outfit || null);
    setCurrentView(AppView.VIRTUAL_DRESSING_ROOM);
  }, [userImage, handleRequestUserImage]);

  const handleGetStyleIdeas = useCallback((product: Product) => {
      setStyleIdeasProduct(product);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return <HomeView setCurrentView={setCurrentView} closetItems={userClosetItems} socialPosts={socialPosts} onAddClosetItem={handleAddClosetItem} products={topRatedProducts} onStartTryOn={handleStartTryOn} onGetStyleIdeas={handleGetStyleIdeas} onRequestUserImage={handleRequestUserImage} />;
      case AppView.SOCIAL_FEED:
        return <SocialFeed posts={socialPosts} onShareOutfit={handleShareOutfit} />;
      case AppView.AI_STYLIST:
        return <AiStylistView userImage={userImage} onImageReady={handleImageReady} onRequestUserImage={handleRequestUserImage} onSaveOutfit={handleSaveOutfit} onShareOutfit={handleShareOutfit} />;
      case AppView.CLOSET:
        return <ClosetAIView userImage={userImage} closetItems={userClosetItems} onAddClosetItem={handleAddClosetItem} onRequestUserImage={handleRequestUserImage} onSaveOutfit={handleSaveOutfit} onShareOutfit={handleShareOutfit}/>;
      case AppView.PROFILE:
        return <ProfileView savedOutfits={savedOutfits} onOpenVoGenerator={() => setCurrentView(AppView.VOICEOVER_GENERATOR)} />;
      case AppView.VOICEOVER_GENERATOR:
        return <VoiceoverGeneratorView />;
      case AppView.VIRTUAL_DRESSING_ROOM:
        if (!userImage || !selectedProduct) {
            setCurrentView(AppView.HOME);
            return null;
        }
        return <VirtualDressingRoom userImage={userImage} product={selectedProduct} onShareOutfit={handleShareOutfit} onSaveOutfit={handleSaveOutfit} initialOutfit={initialOutfit}/>;
      default:
        return <HomeView setCurrentView={setCurrentView} closetItems={userClosetItems} socialPosts={socialPosts} onAddClosetItem={handleAddClosetItem} products={topRatedProducts} onStartTryOn={handleStartTryOn} onGetStyleIdeas={handleGetStyleIdeas} onRequestUserImage={handleRequestUserImage} />;
    }
  };

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen font-sans">
      <Header setCurrentView={setCurrentView} />

      <main className="pt-28 pb-32 max-w-4xl mx-auto px-4">
        <div key={currentView} className="animate-slide-in-up">
          {renderContent()}
        </div>
      </main>

      {currentView !== AppView.VIRTUAL_DRESSING_ROOM && <BottomNav currentView={currentView} setCurrentView={setCurrentView} />}
      
      {isTryOnModalOpen && <TryOnModal onClose={handleModalClose} onImageReady={handleImageReady} />}

      {showOnboarding && <OnboardingTour onComplete={handleTourComplete} />}
      
      {styleIdeasProduct && (
            <StyleIdeasModal
                product={styleIdeasProduct}
                onClose={() => setStyleIdeasProduct(null)}
                onStartTryOn={handleStartTryOn}
                userImage={userImage}
                onRequestUserImage={handleRequestUserImage}
            />
        )}
    </div>
  );
};

export default App;
