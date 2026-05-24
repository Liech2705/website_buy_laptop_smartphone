import api from './api';

export const createGuestOrder = (dto) => api.post('/orders/guest', dto);
export const createOrder = (dto) => api.post('/orders', dto);
export const getMyOrders = () => api.get('/orders/my');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id, data) => api.post(`/orders/${id}/cancel`, data);
