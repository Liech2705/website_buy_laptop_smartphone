import api from './api';

export const login = (dto) => api.post('/auth/login', dto);
export const register = (dto) => api.post('/auth/register', dto);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (dto) => api.post('/auth/reset-password', dto);
export const verifyAccount = (dto) => api.post('/auth/verify-account', dto);
export const resendVerification = (email) => api.post('/auth/resend-verification', { email });
