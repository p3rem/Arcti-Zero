import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token
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

export const auth = {
    register: (userData: any) => api.post('/auth/register', userData),
    login: (credentials: any) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
};

export const users = {
    getAll: () => api.get('/auth/users'),
    add: (userData: any) => api.post('/auth/users', userData),
    delete: (id: number) => api.delete(`/auth/users/${id}`),
};

export const emissions = {
    create: (data: any) => api.post('/emissions', data),
    getAll: () => api.get('/emissions'),
    getSummary: (params?: any) => api.get('/emissions/summary', { params }),
    getComparison: () => api.get('/emissions/comparison'),
    getPublicStats: () => api.get('/emissions/public/stats'),
};

export const reports = {
    getHistory: () => api.get('/reports'),
    downloadPDF: (year: number) => api.get('/reports/pdf', { params: { year }, responseType: 'blob' }),
    downloadExcel: (year: number) => api.get('/reports/excel', { params: { year }, responseType: 'blob' }),
};

export default api;
