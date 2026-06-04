import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * API BASE URL GUIDE:
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ iOS Simulator     → localhost:5000 works fine                   │
 * │ Android Emulator  → 10.0.2.2:5000 (emulator's alias for host)  │
 * │ Physical Device   → Your PC's LAN IP, e.g. 192.168.1.5:5000    │
 * │                     Set EXPO_PUBLIC_API_URL in mobile-app/.env  │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * To find your LAN IP on Windows, run: ipconfig
 * Look for "IPv4 Address" under your Wi-Fi adapter.
 * Then set in mobile-app/.env:
 *   EXPO_PUBLIC_API_URL=http://192.168.X.X:5000
 */

const getBaseUrl = (): string => {
    // Highest priority: explicit env var (works for physical devices)
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    if (__DEV__) {
        // Android emulator: 10.0.2.2 is the host machine loopback
        if (Platform.OS === 'android') return 'http://10.0.2.2:5000';
        // iOS simulator: localhost works
        return 'http://localhost:5000';
    }

    return 'https://dharohar-api.example.com';
};

export const API_BASE_URL = getBaseUrl();
console.log('[apiClient] Connecting to:', API_BASE_URL);

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// Automatically attach auth token to every request
apiClient.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // Ignored
    }
    return config;
}, (error) => Promise.reject(error));

// Handle session expiry globally
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.multiRemove(['userToken', 'userRole', 'userData']);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
