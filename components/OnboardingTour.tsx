import React, { useState, useLayoutEffect } from 'react';
import { AppView } from '../types';

interface OnboardingTourProps {
  onComplete: () => void;
}

interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom';
}

const tourSteps: TourStep[] = [
  {
    targetId: `nav-button-${AppView.AI_STYLIST}`,
    title: 'Welcome to StyleFit!',
    content: 'This is your personal AI Stylist. Describe any style, and our AI will generate unique outfits for you to try on.',
    position: 'top',
  },
  {
    targetId: `nav-button-${AppView.CLOSET}`,
    title: 'Closet AI',
    content: 'Upload photos of your own clothes! Mix and match them with new items to create fresh looks.',
    position: 'top',
  },
  {
    targetId: `nav-button-${AppView.PROFILE}`,
    title: 'Your Saved Outfits',
    content: 'All the amazing looks you save from the AI Stylist and Closet AI will be stored here in your personal profile.',
    position: 'top',
  },
  {
    targetId: `nav-button-${AppView.SOCIAL_FEED}`,
    title: 'Social Feed',
    content: 'Share your amazing AI-generated looks with the community and get inspired by others.',
    position: 'top',
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep = tourSteps[stepIndex];
  const isLastStep = stepIndex === tourSteps.length - 1;

  useLayoutEffect(() => {
    function updatePosition() {
        if (!currentStep) return;
        const element = document.getElementById(currentStep.targetId);
        if (element) {
            setTargetRect(element.getBoundingClientRect());
        }
    }

    // Delay to allow UI to render before getting rect
    const timeoutId = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    
    return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', updatePosition);
    };
  }, [stepIndex, currentStep]);

  const handleNext = () => {
    if (!isLastStep) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete();
    }
  };
  
  if (!currentStep) {
    return null;
  }

  const tooltipStyle: React.CSSProperties = targetRect ? {
      position: 'fixed',
      left: targetRect.left + targetRect.width / 2,
      bottom: window.innerHeight - targetRect.top + 12,
      transform: 'translateX(-50%)',
      transition: 'all 0.3s ease-in-out',
      opacity: 1,
  } : { opacity: 0 };
  
  const highlighterStyle: React.CSSProperties = targetRect ? {
      position: 'fixed',
      left: targetRect.left - 4,
      top: targetRect.top - 4,
      width: targetRect.width + 8,
      height: targetRect.height + 8,
      transition: 'all 0.3s ease-in-out',
  } : {};

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in" aria-live="polite">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onComplete}></div>
      
      {/* Highlighter */}
      {targetRect && (
        <div 
          style={highlighterStyle}
          className="bg-white/10 rounded-lg border-2 border-white pointer-events-none"
        ></div>
      )}

      {/* Tooltip */}
      <div 
        style={tooltipStyle}
        className="bg-white rounded-xl shadow-2xl p-5 max-w-xs w-full text-center z-10"
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-content"
      >
        <h3 id="tour-title" className="text-lg font-bold text-gray-800 mb-2">{currentStep.title}</h3>
        <p id="tour-content" className="text-gray-600 text-sm mb-4">{currentStep.content}</p>
        
        <div className="flex items-center justify-between gap-4">
            <button onClick={onComplete} className="text-gray-500 text-sm font-semibold hover:text-gray-700">
                Skip
            </button>
            <div className="flex-1 text-center">
                {tourSteps.map((_, index) => (
                    <span
                        key={index}
                        className={`inline-block w-2 h-2 rounded-full mx-1 ${index === stepIndex ? 'bg-purple-500' : 'bg-gray-300'}`}
                    ></span>
                ))}
            </div>
            <button 
                onClick={handleNext} 
                className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
                {isLastStep ? 'Finish' : 'Next'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;