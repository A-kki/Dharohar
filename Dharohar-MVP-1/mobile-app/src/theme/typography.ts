// src/theme/typography.ts
import { Platform } from 'react-native';

export const typography = {
    // We use serif/sans-serif fallbacks depending on OS, until custom fonts are loaded in Expo
    serif: Platform.OS === 'ios' ? 'Palatino' : 'serif',
    sans: Platform.OS === 'ios' ? 'System' : 'sans-serif',

    // Preset sizes matching web styling
    h1: {
        fontSize: 28,
        fontWeight: '700' as const,
        color: '#6E3B2E', // burntUmber
    },
    h2: {
        fontSize: 24,
        fontWeight: '600' as const,
        color: '#6E3B2E',
    },
    h3: {
        fontSize: 20,
        fontWeight: '600' as const,
        color: '#6E3B2E',
    },
    body: {
        fontSize: 16,
        color: '#2C2A29', // textMain
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        color: '#5A5654', // textLight
        lineHeight: 20,
    },
    button: {
        fontSize: 16,
        fontWeight: '600' as const,
    },
};
