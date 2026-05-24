import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCategories } from '../../../services/categoryApi';

/**
 * /category/:slug  — legacy route.
 * Looks up the category by slug/name match and redirects to /products?category={id}.
 * Falls back to /products if not found.
 */
const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const resolve = async () => {
      try {
        const cats = await getCategories();
        // match slug (case-insensitive, slug = lower-kebab of name)
        const match = cats.find(c =>
          c.name.toLowerCase().replace(/\s+/g, '-') === slug?.toLowerCase()
          || c.name.toLowerCase() === slug?.toLowerCase()
        );
        if (match) {
          navigate(`/products?category=${match.id}`, { replace: true });
        } else {
          navigate('/products', { replace: true });
        }
      } catch {
        navigate('/products', { replace: true });
      }
    };
    resolve();
  }, [slug, navigate]);

  return null; // redirect in-flight
};

export default CategoryPage;
