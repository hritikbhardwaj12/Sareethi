import React from 'react';

interface SareethiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light';
  className?: string;
}

export function SareethiLogo({
  size = 'md',
  showText = true,
  textColor = 'dark',
  className = '',
}: SareethiLogoProps) {
  // Dimension mapping
  const iconSizeMap = {
    sm: 'w-8 h-8 text-base rounded-xl',
    md: 'w-10 h-10 text-xl rounded-2xl',
    lg: 'w-12 h-12 text-2xl rounded-2xl',
    xl: 'w-16 h-16 text-3xl rounded-3xl',
  };

  const textSizeMap = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-2.5 inline-flex ${className}`}>
      {/* Plum & Gold Logo Icon Badge */}
      <div
        className={`${iconSizeMap[size]} bg-[#2E0229] border border-[#4A0A43] shadow-md flex items-center justify-center font-serif font-bold text-[#F59E0B] shrink-0 select-none transition-transform hover:scale-105`}
        style={{
          boxShadow: '0 4px 12px rgba(46, 2, 41, 0.25)',
        }}
      >
        <span className="leading-none transform -translate-y-[0.5px]">S</span>
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <span
          className={`font-serif font-bold tracking-tight ${textSizeMap[size]} ${
            textColor === 'light' ? 'text-white' : 'text-[#2E0229]'
          }`}
        >
          Sareethi
        </span>
      )}
    </div>
  );
}
