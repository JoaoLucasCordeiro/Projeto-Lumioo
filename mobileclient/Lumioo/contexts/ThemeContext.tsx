import React, { createContext, useContext } from 'react';

// Cores fixas do Lumioo (sem light/dark mode)
interface ThemeColors {
  background: string;        // #0F172A
  backgroundSecondary: string; // #000000
  container: string;         // #1E293B
  containerLight: string;    // #334155
  textPrimary: string;       // #F1F5F9
  textSecondary: string;     // #CBD5E1
  textTertiary: string;      // #94A3B8
  textMuted: string;         // #64748B
  border: string;            // #334155
  borderDark: string;        // #1E293B
  primary: string;           // #ff3131
  primaryDark: string;       // #DC2626
  error: string;             // #EF4444
}

const colors: ThemeColors = {
  background: '#0F172A',
  backgroundSecondary: '#000000',
  container: '#1E293B',
  containerLight: '#334155',
  textPrimary: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textMuted: '#64748B',
  border: '#334155',
  borderDark: '#1E293B',
  primary: '#ff3131',
  primaryDark: '#DC2626',
  error: '#EF4444',
};

interface ThemeContextType {
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider value={{ colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return context;
};
