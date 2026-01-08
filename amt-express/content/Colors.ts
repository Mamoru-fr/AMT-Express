export const colors = {
  // Client Theme - Orange/Warm
  client: {
    gradientStart: '#FFC837',
    gradientEnd: '#FF8008',
    text: '#1a1a1a',
    textSecondary: 'rgba(26, 26, 26, 0.8)',
    textTertiary: 'rgba(26, 26, 26, 0.7)',
    shadow: 'rgba(255, 200, 55, 0.4)',
  },
  
  // Driver Theme - Purple/Indigo
  driver: {
    gradientStart: '#4F46E5',
    gradientEnd: '#7C3AED',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    textTertiary: 'rgba(255, 255, 255, 0.8)',
    shadow: 'rgba(79, 70, 229, 0.4)',
  },
  
  // Admin Theme - Dark Slate/Purple/Indigo
  admin: {
    gradientStart: '#1e293b', // slate-800
    gradientMid: '#581c87',    // purple-900
    gradientEnd: '#312e81',    // indigo-900
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.9)',
    textTertiary: 'rgba(255, 255, 255, 0.8)',
    shadow: 'rgba(88, 28, 135, 0.5)',
  },
  
  // Common Colors
  common: {
    white: '#ffffff',
    black: '#000000',
    blurOverlay: 'rgba(255, 255, 255, 0.15)',
  },

  default: {
    
  }
} as const;

// Helper function to get gradient CSS string
export const getGradient = (role: 'client' | 'driver' | 'admin') => {
  const theme = colors[role];
  if (role === 'admin' && 'gradientMid' in theme) {
    return `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.gradientMid} 50%, ${theme.gradientEnd} 100%)`;
  }
  return `linear-gradient(135deg, ${theme.gradientStart} 0%, ${theme.gradientEnd} 100%)`;
};

// Helper function to get box shadow CSS string
export const getBoxShadow = (role: 'client' | 'driver' | 'admin') => {
  const theme = colors[role];
  return `0 6px 20px ${theme.shadow}`;
};
