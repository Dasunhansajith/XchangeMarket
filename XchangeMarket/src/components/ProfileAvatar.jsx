import React from 'react';

/**
 * ProfileAvatar Component
 * 
 * Displays a user profile image if available, otherwise shows 
 * an avatar with the user's name initials
 * 
 * Props:
 * - profilePhotoUrl: URL of the user's profile photo (optional)
 * - name: User's full name for generating initials
 * - size: Size variant - 'sm' (40px), 'md' (48px), 'lg' (80px), 'xl' (100px)
 * - className: Additional Tailwind classes
 * - ringClass: Ring styling (optional)
 */
export const ProfileAvatar = ({ 
  profilePhotoUrl, 
  name = 'User',
  size = 'md',
  className = '',
  ringClass = '',
  showBorder = false
}) => {
  
  // Generate initials from name
  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const initials = getInitials(name);

  // Size configurations
  const sizeConfigs = {
    sm: {
      container: 'w-10 h-10',
      text: 'text-sm',
      default: 'w-10 h-10',
      rounded: 'rounded-full',
    },
    md: {
      container: 'w-12 h-12',
      text: 'text-base',
      default: 'w-12 h-12',
      rounded: 'rounded-full',
    },
    lg: {
      container: 'w-16 h-16',
      text: 'text-lg',
      default: 'w-16 h-16',
      rounded: 'rounded-full',
    },
    xl: {
      container: 'w-20 h-20',
      text: 'text-2xl',
      default: 'w-20 h-20',
      rounded: 'rounded-full',
    },
  };

  const config = sizeConfigs[size] || sizeConfigs.md;

  // If profile photo exists and is not empty, show the image
  if (profilePhotoUrl && profilePhotoUrl.trim() !== '') {
    return (
      <div className={`${config.container} flex-shrink-0 overflow-hidden ${config.rounded} ${ringClass} ${className}`}>
        <img
          src={profilePhotoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, show the avatar with initials
            e.target.style.display = 'none';
            e.target.nextElementSibling.style.display = 'flex';
          }}
        />
        <div
          className={`hidden w-full h-full flex items-center justify-center ${config.text} font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white`}
        >
          {initials}
        </div>
      </div>
    );
  }

  // Show avatar with initials
  return (
    <div
      className={`${config.container} flex-shrink-0 flex items-center justify-center ${config.text} font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white ${config.rounded} ${ringClass} ${showBorder ? 'border-2 border-white shadow-sm' : ''} ${className}`}
    >
      {initials}
    </div>
  );
};

export default ProfileAvatar;
