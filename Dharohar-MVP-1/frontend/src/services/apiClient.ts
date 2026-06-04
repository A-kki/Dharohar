import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Automatically attach auth token to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('dharohar_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

// Handle session expiry globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('dharohar_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
