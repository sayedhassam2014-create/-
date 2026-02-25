
import React from 'react';
import { AppView } from '../types';
import HomeIcon from './icons/HomeIcon';
import UsersIcon from './icons/UsersIcon';
import ClosetIcon from './icons/ClosetIcon';
import SparklesIcon from './icons/SparklesIcon';

interface BottomNavProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, setCurrentView }) => {
  const navItems = [
    { view: AppView.HOME, label: 'الرئيسية', Icon: HomeIcon },
    { view: AppView.AI_STYLIST, label: 'المنسق', Icon: SparklesIcon },
    { view: AppView.CLOSET, label: 'خزانتي', Icon: ClosetIcon },
    { view: AppView.SOCIAL_FEED, label: 'المجتمع', Icon: UsersIcon },
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[90%] max-w-sm mx-auto bg-white/70 backdrop-blur-xl shadow-2xl z-40 rounded-full border border-gray-200/80">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map(({ view, label, Icon }) => {
          const isActive = currentView === view;
          return (
            <button
              key={view}
              id={`nav-button-${view}`} 
              onClick={() => setCurrentView(view)}
              className="flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-full transition-colors"
              aria-label={label}
            >
              <div className={`relative p-3 rounded-full transition-all duration-300 ${isActive ? 'bg-black/5' : ''}`}>
                 <Icon
                    className={`w-7 h-7 transition-all duration-300 transform ${isActive ? 'scale-110' : 'scale-100'}`}
                    stroke={isActive ? '#8A42F4' : '#64748b'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
              </div>
              <span className={`text-[11px] transition-colors ${isActive ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
