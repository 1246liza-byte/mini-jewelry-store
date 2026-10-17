import axios from 'axios';

// On Vercel, the client and server share the same domain. The client uses a
// relative '/api' path so Vercel's rewrite routes it to the server service.
// For local development, VITE_API_URL can be set to the backend URL.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle 401 responses (token expired)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response && error.response.status;
        const url = error.config && error.config.url ? error.config.url : '';
        // Don't hijack the login/register requests themselves — the auth pages
        // need to display their own error messages instead of an auto-redirect.
        const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');

        if (status === 401 && !isAuthRequest) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;