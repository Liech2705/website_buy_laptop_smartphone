import api from './api';

export const getProfile = () => api.get('/users/profile');
export const updateProfile = (data) => api.put('/users/profile', data);
export const changePassword = (data) => api.put('/users/change-password', data);
export const getAllUsers = (params) => api.get('/admin/users', { params });
export const assignRole = (userId, roleName) => api.put(`/admin/users/${userId}/role`, roleName);
