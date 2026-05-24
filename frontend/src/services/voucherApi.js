import api from './api';

export const voucherApi = {
  // Admin Endpoints
  getAllAdmin: () => api.get('/vouchers'),
  getByIdAdmin: (id) => api.get(`/vouchers/${id}`),
  createAdmin: (data) => api.post('/vouchers', data),
  updateAdmin: (id, data) => api.put(`/vouchers/${id}`, data),
  deleteAdmin: (id) => api.delete(`/vouchers/${id}`),

  // User Wallet Endpoints
  getMyVouchers: () => api.get('/vouchers/my-vouchers'),
  saveVoucher: (code) => api.post('/vouchers/save', { code }),

  // Checkout Validation
  validateVoucher: (code, amount) => api.get('/vouchers/validate', { params: { code, amount } })
};
