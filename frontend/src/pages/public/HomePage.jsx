import React, { useState, useEffect } from 'react';
import { ChevronRight, ArrowRight, ShieldCheck, Clock, CreditCard, Star, Zap, ShoppingBag, Laptop, Smartphone, Headphones, Watch, Loader2, Heart, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/productApi';
import { getCategories } from '../../services/categoryApi';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../contexts/cartSlice';
import { toggleWishlist } from '../../contexts/wishlistSlice';
import { toast } from 'react-hot-toast';
import { resolveImageUrl } from '../../utils/imageHelper';
import ParticleSphere3D from '../../components/ParticleSphere3D';
import ScrollReveal from '../../components/ScrollReveal';
import InteractiveShowcase3D from '../../components/InteractiveShowcase3D';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCats, setLoadingCats] = useState(true);
  const dispatch = useDispatch();
  const wishlistItems = useSelector(state => state.wishlist?.items || []);

  const handleToggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.variants?.[0] || product;
    dispatch(toggleWishlist({
      id: product.id,
      name: product.name,
      price: variant.price || 0,
      image: resolveImageUrl(product.imageUrls?.[0] || product.image) || ''
    }));
  };

  useEffect(() => {
    // Fetch products
    getProducts({ pageSize: 8 }).then(res => {
      const data = res?.data || res?.products || res;
      setProducts(Array.isArray(data) ? data : []);
    }).catch(err => {
      console.error("Home Products Error:", err);
      setProducts([]);
    }).finally(() => setLoading(false));

    // Fetch categories
    getCategories().then(data => {
      // Filter root categories
      const rootCats = data.filter(c => !c.parentId);
      setCategories(rootCats.length > 0 ? rootCats : [
        { id: 'laptop', name: 'Laptops' },
        { id: 'phone', name: 'Smartphones' },
        { id: 'watch', name: 'Smartwatches' },
        { id: 'accessory', name: 'Accessories' }
      ]);
    }).catch(err => {
      console.error("Fetch categories failed, using fallback:", err);
      setCategories([
        { id: 'laptop', name: 'Laptops' },
        { id: 'phone', name: 'Smartphones' },
        { id: 'watch', name: 'Smartwatches' },
        { id: 'accessory', name: 'Accessories' }
      ]);
    }).finally(() => setLoadingCats(false));
  }, []);

  const handleAddToCart = (product) => {
    const variant = product.variants?.[0] || product;
    dispatch(addToCart({
      id: product.id,
      variantId: variant.id,
      name: product.name,
      price: variant.price,
      image: resolveImageUrl(product.imageUrls?.[0] || product.image) || '',
      quantity: 1,
      stock: variant.stockQuantity || 10
    }));
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  // 3D Parallax Tilt Card and Shine effect mouse listeners
  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const tiltX = -(y - yc) / yc * 12; // Max 12deg tilt
    const tiltY = (x - xc) / xc * 12;
    
    card.style.setProperty('--tilt-x', `${tiltX}deg`);
    card.style.setProperty('--tilt-y', `${tiltY}deg`);
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleCardMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
  };

  // Helper mapping categories to respective premium design styles
  const getCategoryMeta = (name) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes('laptop') || lowercaseName.includes('máy tính')) {
      return { icon: Laptop, color: 'text-cyan-400', desc: 'Hiệu năng siêu cấp & Linh hoạt', path: '/products?category=Laptop', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]' };
    }
    if (lowercaseName.includes('phone') || lowercaseName.includes('điện thoại')) {
      return { icon: Smartphone, color: 'text-indigo-400', desc: 'Kết nối tương lai trong tầm tay', path: '/products?category=Smartphone', glow: 'shadow-[0_0_20px_rgba(129,140,248,0.15)]' };
    }
    if (lowercaseName.includes('watch') || lowercaseName.includes('đồng hồ')) {
      return { icon: Watch, color: 'text-purple-400', desc: 'Thời thượng, sang trọng & Sức khỏe', path: '/products?category=Smartwatch', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.15)]' };
    }
    if (lowercaseName.includes('accessory') || lowercaseName.includes('phụ kiện') || lowercaseName.includes('headphones') || lowercaseName.includes('tai nghe')) {
      return { icon: Headphones, color: 'text-pink-400', desc: 'Âm thanh chân thực, sống động', path: '/products?category=Accessory', glow: 'shadow-[0_0_20px_rgba(244,114,182,0.15)]' };
    }
    return { icon: Box, color: 'text-slate-400', desc: 'Trải nghiệm đỉnh cao công nghệ', path: `/products?category=${name}`, glow: 'shadow-[0_0_20px_rgba(255,255,255,0.05)]' };
  };

  return (
    <div className="bg-[#020617] min-h-screen text-slate-200 overflow-hidden relative">
      {/* Dynamic Ambient background glows */}
      <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-primary-600/5 rounded-full blur-[160px] pointer-events-none z-0"></div>
      <div className="absolute top-[60%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[160px] pointer-events-none z-0"></div>

      {/* 1. HERO SECTION - ULTRA PREMIUM 3D */}
      <section className="relative min-h-[95vh] flex items-center overflow-visible isolate">
        <div className="absolute top-0 right-0 -z-10 w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-[140px] animate-pulse"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16 py-20">
          
          {/* Left Text with Scroll Reveal */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <ScrollReveal type="fade-in" delay={100} duration={1000}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-900/40 border border-primary-500/30 rounded-full text-primary-400 text-xs font-black uppercase tracking-[0.3em] mb-4">
                <Zap className="w-4 h-4 fill-primary-400 animate-pulse" /> Future Is Now
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase italic text-white mb-6">
                LIECHTOP <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-400 to-purple-400 filter drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">PREMIUM</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 font-bold leading-relaxed italic mb-8">
                Định nghĩa lại trải nghiệm mua sắm đồ công nghệ. Nhanh hơn, mượt hơn, đẳng cấp hơn.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start">
                <Link to="/products" className="group w-full sm:w-auto px-12 py-6 bg-white text-black font-black rounded-3xl hover:bg-primary-500 hover:text-white hover:scale-105 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-widest shadow-[0_15px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_30px_rgba(99,102,241,0.4)]">
                  Mua ngay <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
          
          {/* Right 3D Interactive Devices Showcase */}
          <div className="flex-1 relative flex justify-center z-10 w-full">
            <ScrollReveal type="3d-slide" delay={300} duration={1200}>
              <InteractiveShowcase3D />
            </ScrollReveal>
          </div>

        </div>
      </section>

      {/* 2. CATEGORIES SECTION - 3D FLIPPING CUBES */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01] relative z-10">
        <div className="container mx-auto px-4">
          <ScrollReveal type="3d-flip" delay={100}>
            <div className="text-center mb-16">
              <h3 className="text-xs font-black text-primary-400 uppercase tracking-[0.3em] mb-3">Next-Gen Categories</h3>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">Hộp danh mục 3D</h2>
              <div className="w-16 h-1 bg-gradient-to-r from-primary-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </div>
          </ScrollReveal>

          {loadingCats ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {categories.map((c, index) => {
                const meta = getCategoryMeta(c.name);
                return (
                  <ScrollReveal key={c.id || c.name} type="3d-flip" delay={150 + index * 100}>
                    <div className="h-56 w-full group perspective-1000 cursor-pointer">
                      <div className="relative w-full h-full duration-700 cube-inner">
                        
                        {/* Front Face of the 3D Cube */}
                        <div className={`absolute inset-0 w-full h-full rounded-[40px] bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center justify-center gap-4 backface-hidden shadow-[0_15px_35px_rgba(0,0,0,0.4)] hover:border-white/15 transition-colors ${meta.glow}`}>
                          <div className={`p-5 rounded-3xl bg-slate-950/80 ${meta.color} border border-white/5 shadow-[0_10px_20px_rgba(0,0,0,0.5)]`}>
                            <meta.icon className="w-8 h-8" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{c.name}</span>
                        </div>

                        {/* Back Face of the 3D Cube (flipped rotX 180) */}
                        <div className="absolute inset-0 w-full h-full rounded-[40px] bg-gradient-to-br from-slate-950 via-primary-950/20 to-purple-950/20 border border-primary-500/30 p-8 flex flex-col items-center justify-center gap-4 backface-hidden rotate-x-180 text-center shadow-[0_20px_50px_rgba(99,102,241,0.25)]">
                          <h4 className={`text-sm font-black uppercase tracking-widest ${meta.color}`}>{c.name}</h4>
                          <p className="text-[11px] text-slate-400 font-bold italic max-w-[150px]">{meta.desc}</p>
                          <Link 
                            to={meta.path}
                            className="mt-2 inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-wider rounded-2xl hover:bg-primary-500 hover:text-white transition-all shadow-[0_10px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_10px_25px_rgba(99,102,241,0.4)]"
                          >
                            Khám phá <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. PRODUCTS - FEATURED 3D PARALLAX CARDS */}
      <section className="py-32 container mx-auto px-4 md:px-8 relative z-10">
        <ScrollReveal type="3d-flip" delay={100}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-16 gap-6">
            <div>
              <h3 className="text-xs font-black text-primary-400 uppercase tracking-[0.3em] mb-3">Premium Collection</h3>
              <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Siêu phẩm nổi bật</h2>
              <div className="w-24 h-2 bg-gradient-to-r from-primary-500 to-purple-500 mt-4 rounded-full"></div>
            </div>
            <Link to="/products" className="group flex items-center gap-3 text-xs font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all">
              Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loading catalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {products.map((p, index) => (
              <ScrollReveal key={p.id} type="3d-flip" delay={150 + index * 80}>
                <div 
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  className="group bg-white/[0.02] border border-white/5 rounded-[48px] p-6 hover:bg-white/[0.05] hover:border-primary-500/30 transition-all duration-300 flex flex-col relative overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)] cursor-pointer"
                  style={{
                    transform: 'perspective(1000px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Dynamic glow reflections */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
                    style={{
                      background: 'radial-gradient(circle 180px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255, 255, 255, 0.08), transparent 80%)'
                    }}
                  />

                  {/* Glass reflective overlay */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-20"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)',
                      mixBlendMode: 'overlay'
                    }}
                  />

                  {/* Scan line shine animation on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full rotate-[35deg] group-hover:animate-shine pointer-events-none z-20" />

                  {/* Product image with 3D Pop Out */}
                  <Link 
                    to={`/product/${p.id}`} 
                    className="aspect-square bg-slate-950/60 border border-white/5 rounded-[40px] mb-8 p-8 flex items-center justify-center overflow-hidden relative"
                    style={{ transform: 'translateZ(25px)' }}
                  >
                    <img 
                      src={resolveImageUrl(p.imageUrls?.[0] || p.image)} 
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110 pointer-events-none" 
                      alt={p.name} 
                      onError={e => { e.target.src = `https://placehold.co/300x300/0f172a/f8fafc?text=IMG`; }} 
                    />
                    
                    {/* Wishlist Button */}
                    <button 
                      onClick={(e) => handleToggleWishlist(e, p)}
                      className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/50 backdrop-blur border border-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-accent-500 hover:bg-black/80 transition-all active:scale-95"
                    >
                      <Heart className={`w-5 h-5 ${wishlistItems.some(item => item.id === p.id) ? 'fill-accent-500 text-accent-500' : ''}`} />
                    </button>

                    <div className="absolute inset-0 bg-primary-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
                      <div className="bg-white text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Chi tiết</div>
                    </div>
                  </Link>

                  {/* Card Content with translateZ */}
                  <div className="flex-1 space-y-4 relative z-10" style={{ transform: 'translateZ(15px)' }}>
                    <div>
                      <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">{p.categoryName || 'Tech'}</p>
                      <h3 className="text-lg font-black text-white tracking-tight uppercase leading-none line-clamp-2">{p.name}</h3>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <p className="text-2xl font-black text-white italic tracking-tighter">{(p.variants?.[0]?.price || 0).toLocaleString()}₫</p>
                      <button 
                        onClick={() => handleAddToCart(p)} 
                        className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all shadow-[0_5px_15px_rgba(255,255,255,0.05)] hover:shadow-[0_8px_20px_rgba(99,102,241,0.4)] active:scale-90 z-20"
                      >
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* 4. NEWSLETTER - 3D GLASS CARD */}
      <section className="py-24 container mx-auto px-4 mb-20 relative z-10">
        <ScrollReveal type="tilt" delay={150}>
          <div 
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            className="bg-gradient-to-br from-white/[0.02] to-white/[0.04] rounded-[60px] p-16 border border-white/10 backdrop-blur-3xl relative overflow-hidden text-center md:text-left transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
            style={{
              transform: 'perspective(1200px) rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg))',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Hologram lights */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Radial Shine reflections */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
              style={{
                background: 'radial-gradient(circle 350px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06), transparent 80%)'
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12" style={{ transform: 'translateZ(25px)' }}>
              <div className="max-w-xl">
                <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">Đăng ký nhận <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400">Đặc quyền</span></h2>
                <p className="text-slate-400 font-bold italic tracking-tight">Trở thành thành viên để nhận Voucher giảm giá 10% cho đơn hàng đầu tiên.</p>
              </div>
              <div className="flex-1 w-full max-w-md">
                <div className="flex flex-col sm:flex-row gap-4 p-2 bg-slate-950/70 rounded-[32px] border border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                  <input placeholder="Email của bạn..." className="flex-1 bg-transparent px-6 py-4 text-white outline-none font-bold placeholder:text-slate-700" />
                  <button className="px-10 py-4 bg-white text-black font-black rounded-3xl uppercase tracking-widest text-xs hover:bg-primary-500 hover:text-white transition-all shadow-[0_5px_15px_rgba(255,255,255,0.1)] active:scale-95">Gửi</button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Global CSS animations and custom helpers */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { 
          backface-visibility: hidden; 
          -webkit-backface-visibility: hidden; 
        }
        .rotate-x-180 { transform: rotateX(180deg); }
        
        .cube-inner {
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          transform-style: preserve-3d;
        }
        
        /* 3D Cube flip triggering */
        .group:hover .cube-inner {
          transform: rotateX(180deg);
        }

        /* 3D product translation helpers */
        .translate-z-10 { transform: translateZ(10px); }
        .translate-z-20 { transform: translateZ(20px); }
        .translate-z-30 { transform: translateZ(30px); }

        /* Light beam shine scan animation */
        @keyframes light-shine {
          0% { transform: translateX(-150%) rotate(35deg); }
          100% { transform: translateX(150%) rotate(35deg); }
        }
        .group-hover\\:animate-shine {
          animation: light-shine 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default HomePage;
