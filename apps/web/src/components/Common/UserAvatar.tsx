import React, { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'Rohan V.',
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const avatarSrc = src && !src.includes('lh3.googleusercontent.com') ? src : '/assets/avatar.png';

  if (hasError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center font-headline font-bold text-white shadow-[0_0_10px_rgba(99,102,241,0.4)] ring-2 ring-primary/60 shrink-0 ${className}`}
        aria-label={name}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarSrc}
      alt={name}
      onError={() => setHasError(true)}
      className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-primary/60 shadow-[0_0_10px_rgba(99,102,241,0.4)] shrink-0 ${className}`}
    />
  );
};
