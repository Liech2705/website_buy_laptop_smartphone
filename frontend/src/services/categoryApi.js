import api from './api';

export const getCategories  = ()         => api.get('/categories');
export const getCategoryById= (id)       => api.get(`/categories/${id}`);
export const createCategory = (dto)      => api.post('/categories', dto);
export const updateCategory = (id, dto)  => api.put(`/categories/${id}`, dto);
export const deleteCategory = (id)       => api.delete(`/categories/${id}`);
