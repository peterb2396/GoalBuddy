export const theme = {
  colors: {
    // Primary beige and whites
    background: '#F5F1E8',
    cardBackground: '#FFFFFF',
    secondaryBackground: '#FAF8F3',
    
    // Text colors
    text: '#2C2C2C',
    textSecondary: '#6B6B6B',
    textLight: '#9B9B9B',
    
    // Accent colors (pops of color)
    primary: '#E8B4B8', // Soft pink
    secondary: '#B8D4E8', // Soft blue
    accent1: '#E8D4B8', // Peach
    accent2: '#D4E8B8', // Mint green
    accent3: '#D8B8E8', // Lavender
    accent4: '#E8C4B8', // Coral
    
    // Status colors
    success: '#A8D5BA',
    warning: '#F4C47F',
    error: '#E89B9B',
    
    // UI elements
    border: '#E8E5DD',
    shadow: 'rgba(0, 0, 0, 0.08)',
    disabled: '#D4D1C8',
    
    // Progress colors
    progressBackground: '#E8E5DD',
    progressFill: '#E8B4B8'
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8
    }
  }
};

export const accentColors = [
  theme.colors.primary,
  theme.colors.secondary,
  theme.colors.accent1,
  theme.colors.accent2,
  theme.colors.accent3,
  theme.colors.accent4
];

export const getRandomAccentColor = () => {
  return accentColors[Math.floor(Math.random() * accentColors.length)];
};
