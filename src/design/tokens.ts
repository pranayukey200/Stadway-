/**
 * StandWay Theme & Styling Design Tokens
 * 
 * Defines central theme color tokens, border styles, shadows, border radii,
 * and standard animation configurations. Avoid using scattered magic hex codes or strings.
 */

export interface DesignTokens {
  colors: {
    bgBase: string;
    bgPanel: string;
    bgInput: string;
    textBase: string;
    textMuted: string;
    borderBase: string;
    borderHighlight: string;
    gold: string;
    pitch: string;
    magenta: string;
    orange: string;
  };
  shadows: {
    neobrutalismSmall: string;
    neobrutalismMedium: string;
    neobrutalismLarge: string;
  };
  radii: {
    card: string;
    button: string;
    input: string;
  };
  motion: {
    float: string;
    fadeIn: string;
  };
}

export const TOKENS: DesignTokens = {
  colors: {
    bgBase: '#070D1E',
    bgPanel: '#121E36',
    bgInput: '#0B1120',
    textBase: '#FFFFFF',
    textMuted: 'rgba(255, 255, 255, 0.7)',
    borderBase: '#0B1120',
    borderHighlight: '#0E7C3A',
    gold: '#D4A017',
    pitch: '#16A34A',
    magenta: '#E5399A',
    orange: '#FB6B1E',
  },
  shadows: {
    neobrutalismSmall: '2px 2px 0px 0px #0B1120',
    neobrutalismMedium: '4px 4px 0px 0px #0B1120',
    neobrutalismLarge: '6px 6px 0px 0px #0B1120',
  },
  radii: {
    card: '24px', // rounded-3xl
    button: '9999px', // rounded-full
    input: '12px', // rounded-xl
  },
  motion: {
    float: 'float 6s ease-in-out infinite',
    fadeIn: 'fadeIn 0.5s ease-out forwards',
  }
};
