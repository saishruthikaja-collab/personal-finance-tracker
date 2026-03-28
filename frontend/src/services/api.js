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

// Budget endpoints
export const getBudgets = (month, year) => API.get(`/budgets?month=${month}&year=${year}`).then(res => res.data);
export const createBudget = (budgetData) => API.post('/budgets', budgetData).then(res => res.data);
export const deleteBudget = (id) => API.delete(`/budgets/${id}`).then(res => res.data);

// Savings endpoints
export const getSavings = () => API.get('/savings').then(res => res.data);
export const createSavings = (savingsData) => API.post('/savings', savingsData).then(res => res.data);
export const addToSavings = (id, amount) => API.put(`/savings/${id}/add`, { amount }).then(res => res.data);
export const deleteSavings = (id) => API.delete(`/savings/${id}`).then(res => res.data);

// Forum endpoints
export const getPosts = () => API.get('/forum/posts').then(res => res.data);
export const createPost = (postData) => API.post('/forum/posts', postData).then(res => res.data);
export const likePost = (postId) => API.post(`/forum/posts/${postId}/like`).then(res => res.data);
export const deletePost = (postId) => API.delete(`/forum/posts/${postId}`).then(res => res.data);

export const getComments = (postId) => API.get(`/forum/posts/${postId}/comments`).then(res => res.data);
export const createComment = (postId, content) => API.post(`/forum/posts/${postId}/comments`, { content }).then(res => res.data);
export const likeComment = (commentId) => API.post(`/forum/comments/${commentId}/like`).then(res => res.data);
export const deleteComment = (commentId) => API.delete(`/forum/comments/${commentId}`).then(res => res.data);
export default API;