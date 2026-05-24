import api from './api';

export const getReviewsByProduct = (productId) => api.get(`/reviews/product/${productId}`);

export const createReview = (dto) => api.post('/reviews', dto);

export const canReviewProduct = (productId) => api.get(`/reviews/can-review/${productId}`);

export const uploadReviewImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};
