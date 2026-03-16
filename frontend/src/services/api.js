import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

// Auth endpoints
export const signUp = (userData) => API.post('/auth/signup', userData);
export const signIn = (userData) => API.post('/auth/signin', userData);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (profileData) => API.put('/auth/profile', profileData);

// Transaction endpoints
export const getTransactions = () => API.get('/transactions').then(res => res.data);
export const createTransaction = (transactionData) => API.post('/transactions', transactionData);
export const updateTransaction = (id, transactionData) => API.put(`/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => API.delete(`/transactions/${id}`);
export const getSummary = (month, year) => API.get(`/transactions/summary/overview?month=${month}&year=${year}`).then(res => res.data);

export default API;