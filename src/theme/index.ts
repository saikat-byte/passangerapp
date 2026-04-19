export const TOITOI_THEME = {
  colors: {
    primary: '#FFD700',    
    primaryLight: '#FFFBEB', 
    secondary: '#BBA8FF', 
    success: '#4ADE80',    
    danger: '#FF6B6B',    
    background: '#FDFBF7', 
    white: '#FFFFFF',
    black: '#000000',
    gray: { light: '#E5E7EB', medium: '#9CA3AF', text: '#4B5563' }
  },
  borders: {
    thin: 1,
    medium: 2,
    thick: 4, // Signature Neubrutalism thick border
    radius: { sm: 4, md: 8, lg: 12, xl: 16, full: 999 }
  },
  shadows: {
    brutal: {
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 }, // Solid shadow, no blur
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 5, 
    },
    brutalActive: { // When button is pressed
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 0,
    }
  },
  typography: { 
    fontBlack: '900' as const, 
    fontBold: '700' as const, 
    fontMedium: '500' as const 
  }
};