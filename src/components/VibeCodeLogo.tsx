import React from 'react';

interface VibeCodeLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

export function VibeCodeLogo({ size = 'medium', className = '', onClick }: VibeCodeLogoProps) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-10 h-10'
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''} ${className}`}
      onClick={handleClick}
      title={onClick ? 'Go to Home' : undefined}
    >
      <svg
        className={`${iconSizes[size]} text-white`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>
  );
}