import api from './api';

export const getProducts    = (query = {}) => api.get('/products', { params: query });
export const getProductById = (id)         => api.get(`/products/${id}`);

// --- Admin Product CRUD ---
export const createProduct  = (dto) => api.post('/products', dto);
export const updateProduct  = (id, dto) => api.put(`/products/${id}`, dto);
export const deleteProduct  = (id) => api.delete(`/products/${id}`);

export const uploadProductImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
