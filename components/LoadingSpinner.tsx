
import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  isQuotaWait?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ text, size = 'md', isQuotaWait = false }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  const textSizeClasses = {
    sm: 'text-sm mt-2',
    md: 'text-base mt-4',
    lg: 'text-lg mt-4',
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center w-full h-full animate-fade-in">
      <div className={`relative ${sizeClasses[size]}`}>
          <div className={`absolute inset-0 rounded-full border-b-2 border-purple-700 animate-spin ${sizeClasses[size]}`}></div>
          {isQuotaWait && (
              <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs">⏳</span>
              </div>
          )}
      </div>
      <div className="space-y-2">
          <p className={`text-gray-700 font-black ${textSizeClasses[size]} ${isQuotaWait ? 'text-purple-600' : ''}`}>
            {text}
          </p>
          {isQuotaWait && (
              <p className="text-xs text-gray-400 max-w-[200px] mx-auto leading-relaxed">
                  الذكاء الاصطناعي يأخذ استراحة قصيرة لتجديد الحصة المجانية. سيتم عرض النتائج فوراً عند الجاهزية.
              </p>
          )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
