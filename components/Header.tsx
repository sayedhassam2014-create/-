
import React from 'react';
import { AppView } from '../types';
import LogoIcon from './icons/LogoIcon';
import UserIcon from './icons/UserIcon';

const Header: React.FC<{ setCurrentView: (view: AppView) => void }> = ({ setCurrentView }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-900/5 z-40">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-24">
          <button onClick={() => setCurrentView(AppView.HOME)} className="flex items-center gap-3" aria-label="Go to homepage">
            <LogoIcon className="w-10 h-10" />
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">StyleFit</span>
          </button>
          <button
            id={`nav-button-${AppView.PROFILE}`}
            onClick={() => setCurrentView(AppView.PROFILE)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go to profile"
          >
            <UserIcon className="w-7 h-7 text-gray-700" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;