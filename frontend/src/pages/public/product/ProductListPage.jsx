import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, setBuyNow, toggleCartDrawer } from '../../../contexts/cartSlice';
import { toggleWishlist } from '../../../contexts/wishlistSlice';
import { getProducts } from '../../../services/productApi';
import { getCategories } from '../../../services/categoryApi';
import { 
  Search, SlidersHorizontal, ShoppingCart, Star, 
  ChevronLeft, ChevronRight, Filter, Laptop, 
  Smartphone, Box, Home, CreditCard, Heart 
} from 'lucide-react';
import { resolveImageUrl } from '../../../utils/imageHelper';

const CATEGORY_ICONS = {
  'Laptop': Laptop,
  'Phone': Smartphone,
  'Smartphone': Smartphone,
  'Phụ kiện': Box,
  'default': Box
};

const ProductCard = ({ product, onAddToCart, onBuyNow, isWishlisted, onToggleWishlist }) => {
  const variant = product.variants?.[0];
  const price = variant?.price ?? product.basePrice ?? 0;
  const stock = variant?.stock ?? 0;
  const rawImage = variant?.imageUrl || product.imageUrls?.[0];
  const image = rawImage ? resolveImageUrl(rawImage) : `https://placehold.co/300x300/0f172a/f8fafc?text=${encodeURIComponent(product.name?.charAt(0) ?? 'P')}`;

  return (
    <div className="bg-surface-100 border border-surface-200/50 hover:border-primary-500/50 rounded-3xl p-4 transition-all duration-500 group flex flex-col relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-600/10 transition-colors" />
      
      {/* Wishlist Button */}
      <button 
        onClick={(e) => { e.preventDefault(); onToggleWishlist(product); }}
        className="absolute top-4 right-4 z-20 w-8 h-8 bg-surface-100/80 backdrop-blur border border-surface-200 rounded-full flex items-center justify-center text-surface-400 hover:text-accent-500 hover:bg-surface-200 transition-all"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-accent-500 text-accent-500' : ''}`} />
      </button>

      <Link to={`/product/${product.id}`} className="relative z-10 flex-1 flex flex-col">
        <div className="aspect-square bg-surface-200/30 rounded-2xl mb-5 flex items-center justify-center overflow-hidden">
          <img
            src={image}
            alt={product.name}
            className="object-contain w-full h-full mix-blend-screen group-hover:scale-110 transition-all duration-700"
            onError={e => { e.target.src = `https://placehold.co/300x300/0f172a/f8fafc?text=IMG`; }}
          />
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-black px-2.5 py-1 bg-primary-900/50 text-primary-400 rounded-lg border border-primary-500/20 uppercase tracking-widest">
            {product.brandName || 'Liechtop'}
          </span>
          {product.isNew && (
             <span className="text-[10px] font-black px-2.5 py-1 bg-accent-950/50 text-accent-400 rounded-lg border border-accent-500/20 uppercase tracking-widest">
               HOT
             </span>
          )}
          {stock <= 0 && (
            <span className="text-[10px] font-black px-2.5 py-1 bg-red-950/50 text-red-500 rounded-lg border border-red-500/20 uppercase tracking-widest">
              HẾT HÀNG
            </span>
          )}
        </div>

        <h3 className="font-bold text-surface-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary-400 transition-colors text-sm h-10">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-1 mb-3">
          {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-yellow-500 text-yellow-500" />)}
          <span className="text-[10px] font-bold text-surface-500 ml-1 uppercase tracking-tighter">100+ Đã bán</span>
        </div>
        
        <div className="text-accent-500 font-black text-xl mb-5 flex items-baseline gap-1">
          {price.toLocaleString('vi-VN')}
          <span className="text-xs">₫</span>
        </div>
      </Link>

      <div className="flex items-center gap-2 relative z-10 w-full mt-auto">
        <button
          onClick={() => onAddToCart(product)}
          disabled={stock <= 0}
          className="bg-surface-200 hover:bg-surface-300 disabled:opacity-30 disabled:cursor-not-allowed text-surface-900 w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95"
          title={stock <= 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
        <button
          onClick={() => onBuyNow(product)}
          disabled={stock <= 0}
          className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 disabled:text-surface-500 disabled:shadow-none text-white font-black py-3.5 rounded-2xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-primary-900/20 active:scale-95"
        >
          <CreditCard className="w-4 h-4" /> {stock <= 0 ? 'Hết hàng' : 'Mua ngay'}
        </button>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-surface-100 rounded-3xl p-5 border border-surface-200/50 animate-pulse flex flex-col h-[400px]">
    <div className="aspect-square bg-surface-200/50 rounded-2xl mb-6" />
    <div className="h-4 bg-surface-200/50 rounded-lg mb-3 w-4/5" />
    <div className="h-4 bg-surface-200/30 rounded-lg mb-6 w-2/5" />
    <div className="h-12 bg-surface-200/50 rounded-2xl mt-auto" />
  </div>
);

const SORT_OPTIONS = [
    { value: '', label: 'Mặc định' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' },
    { value: 'newest', label: 'Mới nhất' },
];

const ProductListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const wishlistItems = useSelector(state => state.wishlist?.items || []);
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const PAGE_SIZE = 9;

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        setCategories(res);
      } catch (e) {}
    };
    fetchCats();
  }, []);

  const isValidGuid = (str) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rawCategory = searchParams.get('category') || '';
      const query = {
        search: searchParams.get('search') || '',
        categoryId: isValidGuid(rawCategory) ? rawCategory : '',
        sort: searchParams.get('sort') || '',
        page: searchParams.get('page') || 1,
        pageSize: PAGE_SIZE
      };
      
      const res = await getProducts(query);
      if (res?.data) {
        setProducts(res.data);
      } else if (Array.isArray(res)) {
        setProducts(res);
      }
    } catch (err) {
      setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilters = (newFilters) => {
    const current = Object.fromEntries(searchParams.entries());
    const updated = { ...current, ...newFilters, page: 1 };
    Object.keys(updated).forEach(key => { if (!updated[key]) delete updated[key]; });
    setSearchParams(updated);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handleAddToCart = (product) => {
    const variant = product.variants?.[0];
    const stock = variant?.stock ?? 0;
    
    if (stock <= 0) return;

    dispatch(addToCart({
      id:    variant?.id ?? product.id,
      name:  product.name,
      price: variant?.price ?? product.basePrice ?? 0,
      image: resolveImageUrl(variant?.imageUrl || product.imageUrls?.[0]) || '',
      variantId: variant?.id,
      stock: stock,
    }));
    dispatch(toggleCartDrawer(true));
  };

  const handleBuyNow = (product) => {
    const variant = product.variants?.[0];
    const stock = variant?.stock ?? 0;

    if (stock <= 0) return;

    dispatch(setBuyNow({
      id:        variant?.id ?? product.id,
      name:      product.name,
      price:     variant?.price ?? product.basePrice ?? 0,
      image:     resolveImageUrl(variant?.imageUrl || product.imageUrls?.[0]) || '',
      variantId: variant?.id,
      quantity:  1,
      stock:     stock,
    }));
    navigate('/checkout?mode=buynow');
  };

  const handleToggleWishlist = (product) => {
    const variant = product.variants?.[0];
    dispatch(toggleWishlist({
      id: product.id,
      name: product.name,
      price: variant?.price ?? product.basePrice ?? 0,
      image: resolveImageUrl(variant?.imageUrl || product.imageUrls?.[0]) || ''
    }));
  };

  const activeCategory = searchParams.get('category');
  const activeSort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page')) || 1;

  return (
    <div className="min-h-screen bg-surface-50 pb-20">
      {/* Header */}
      <div className="bg-surface-100 border-b border-surface-200 pt-16 pb-12 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-black text-surface-900 uppercase tracking-tighter mb-4">
                CHINH PHỤC CÔNG NGHỆ
            </h1>
            <p className="text-surface-500 font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                <Home className="w-3 h-3" /> Trang chủ <ChevronRight className="w-3 h-3" /> Cửa hàng
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0 space-y-8">
            {/* Search */}
            <div className="bg-surface-100 rounded-[40px] border border-surface-200 p-8">
               <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-6">Tìm kiếm</h3>
               <form onSubmit={handleSearch} className="relative group">
                  <input 
                    type="text" 
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Tên sản phẩm..."
                    className="w-full pl-12 pr-4 py-4 bg-surface-200 border border-surface-300 rounded-[20px] outline-none focus:ring-2 focus:ring-primary-500 transition-all font-bold" 
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400 group-hover:text-primary-400 transition-colors" />
               </form>
            </div>

            {/* Category Filter */}
            <div className="bg-surface-100 rounded-[40px] border border-surface-200 p-8">
              <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-6">Danh mục</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => updateFilters({ category: '' })}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${!activeCategory ? 'bg-primary-600 text-white shadow-xl shadow-primary-900/20' : 'text-surface-500 hover:bg-surface-200'}`}
                >
                  <div className="flex items-center gap-3"><Box className="w-4 h-4" /> Tất cả</div>
                  {!activeCategory && <div className="w-2 h-2 bg-white rounded-full" />}
                </button>
                {categories.map(cat => {
                    const Icon = CATEGORY_ICONS[cat.name] || CATEGORY_ICONS.default;
                    const isActive = activeCategory === cat.id;
                    return (
                        <button 
                          key={cat.id}
                          onClick={() => updateFilters({ category: cat.id })}
                          className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${isActive ? 'bg-primary-600 text-white shadow-xl shadow-primary-900/20' : 'text-surface-500 hover:bg-surface-200'}`}
                        >
                          <div className="flex items-center gap-3"><Icon className="w-4 h-4" /> {cat.name}</div>
                          {isActive && <div className="w-2 h-2 bg-white rounded-full" />}
                        </button>
                    );
                })}
              </div>
            </div>

            {/* Sorting */}
            <div className="bg-surface-100 rounded-[40px] border border-surface-200 p-8">
              <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-6">Sắp xếp</h3>
              <div className="space-y-2">
                {SORT_OPTIONS.map(opt => (
                    <button 
                        key={opt.value}
                        onClick={() => updateFilters({ sort: opt.value })}
                        className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-sm transition-all ${activeSort === opt.value ? 'bg-accent-500/10 text-accent-500 border border-accent-500/20' : 'text-surface-500 hover:text-surface-900'}`}
                    >
                        {opt.label}
                    </button>
                ))}
              </div>
            </div>

            {/* Banner */}
            <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[40px] p-8 text-white relative overflow-hidden group shadow-2xl shadow-primary-950/50">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full -mr-24 -mt-24 blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-700" />
              <div className="relative z-10">
                <CreditCard className="w-10 h-10 mb-6 text-white" />
                <h4 className="font-black text-2xl leading-tight mb-3">TRẢ GÓP 0%<br/>LÃI SUẤT</h4>
                <p className="text-sm text-white/70 font-medium leading-relaxed mb-8">Nâng cấp thiết bị ngay hôm nay, thanh toán từ từ trong 12 tháng.</p>
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:w-full group-hover:rounded-2xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest overflow-hidden">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">Tìm hiểu thêm</span>
                    <ChevronRight className="w-5 h-5 group-hover:hidden" />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : error ? (
              <div className="text-center py-24 bg-surface-100 rounded-[50px] border border-surface-200">
                <p className="text-red-400 font-bold mb-6">{error}</p>
                <button onClick={fetchProducts} className="px-10 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Thử lại ngay</button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24 bg-surface-100 rounded-[50px] border-2 border-dashed border-surface-200">
                 <div className="w-24 h-24 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Search className="w-10 h-10 text-surface-400 opacity-20" />
                 </div>
                 <h2 className="text-2xl font-black text-surface-900 uppercase tracking-tight">Kỹ thuật viên đang tìm...</h2>
                 <p className="text-surface-500 mt-3 mb-10">Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
                 <button onClick={() => updateFilters({ search: '', category: '', sort: '' })} className="px-10 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Xóa toàn bộ bộ lọc</button>
              </div>
            ) : (
              <div className="space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} isWishlisted={wishlistItems.some(i => i.id === p.id)} onToggleWishlist={handleToggleWishlist} />)}
                </div>

                {/* Simplified Pagination */}
                <div className="flex items-center justify-center gap-6">
                    <button 
                        disabled={page === 1}
                        onClick={() => updateFilters({ page: page - 1 })}
                        className="flex items-center gap-3 px-6 py-4 bg-surface-100 rounded-[20px] font-black text-[10px] uppercase tracking-widest text-surface-500 hover:text-primary-400 disabled:opacity-20 transition-all border border-surface-200"
                    >
                        <ChevronLeft className="w-4 h-4" /> Trang trước
                    </button>
                    <span className="font-black text-lg text-surface-900 tracking-tighter">PHẦN {page}</span>
                    <button 
                        disabled={products.length < PAGE_SIZE}
                        onClick={() => updateFilters({ page: page + 1 })}
                        className="flex items-center gap-3 px-6 py-4 bg-surface-100 rounded-[20px] font-black text-[10px] uppercase tracking-widest text-surface-500 hover:text-primary-400 disabled:opacity-20 transition-all border border-surface-200"
                    >
                        Trang kế <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
