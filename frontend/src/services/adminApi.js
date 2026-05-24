import api from './api';

// --- Admin Stats ---
export const getAdminStats = () => api.get('/orders/stats');

// --- Admin Orders ---
export const getAllOrders = (page = 1, pageSize = 10, status = null) => {
  const params = { page, pageSize };
  if (status) params.status = status;
  return api.get('/orders/all', { params });
};
export const getAdminOrderDetail = (id) => api.get(`/orders/admin/${id}`);
export const updateOrderStatus = (id, dto) => api.put(`/orders/${id}/status`, dto);
export const confirmRestock = (id) => api.post(`/orders/${id}/restock`);
export const confirmRefund = (id) => api.post(`/orders/${id}/refund-confirm`);

// --- Admin Users ---
export const getAllUsers = (page = 1, pageSize = 10, role = null) => {
  const params = { page, pageSize };
  if (role) params.role = role;
  return api.get('/users', { params });
};
export const getUserById = (id) => api.get(`/users/${id}`);
export const assignRole = (id, roleName) => api.put(`/users/${id}/role`, roleName, {
  headers: { 'Content-Type': 'application/json' }
});

// --- Admin Products ---
export const getAllProducts = (query) => api.get('/products', { params: query });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (dto) => api.post('/products', dto);
export const updateProduct = (id, dto) => api.put(`/products/${id}`, dto);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const uploadProductImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/products/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res;
};
export const getAttributeNames = async () => {
    const res = await api.get('/products/attributes');
    return res;
};

// --- Admin Categories ---
export const createCategory = (dto) => api.post('/categories', dto);
export const updateCategory = (id, dto) => api.put(`/categories/${id}`, dto);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// --- Admin Vouchers ---
export const getAllVouchers = () => api.get('/vouchers');
export const getVoucherById = (id) => api.get(`/vouchers/${id}`);
export const createVoucher = (dto) => api.post('/vouchers', dto);
export const updateVoucher = (id, dto) => api.put(`/vouchers/${id}`, dto);
export const deleteVoucher = (id) => api.delete(`/vouchers/${id}`);

// --- Admin Reviews ---
export const getAllReviews = () => api.get('/reviews/admin/all');
export const deleteReview = (id) => api.delete(`/reviews/admin/${id}`);
