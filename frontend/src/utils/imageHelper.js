export const resolveImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  // Remove duplicate slashes if any
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5012';
  return `${baseUrl}${cleanUrl}`;
};
