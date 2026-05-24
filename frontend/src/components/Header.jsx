import { useState, useRef, useEffect } from 'react';
import { 
  Search, ShoppingCart, User, MapPin, Grid, Phone, Tag, 
  Smartphone, Laptop, Headphones, LogOut, Package, 
  ChevronDown, Zap, Search as SearchIcon, Box, Heart 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCartDrawer } from '../contexts/cartSlice';
import { useAuth } from '../contexts/AuthContext';
import { getCategories } from '../services/categoryApi';

const Header = () => {
  const totalQuantity  = useSelector((state) => state.cart.totalQuantity);
  const wishlistItems  = useSelector((state) => state.wishlist?.items || []);
  const dispatch       = useDispatch();
  const navigate       = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen]   = useState(false);
  const [categories, setCategories]     = useState([]);
  const [searchQuery, setSearchQuery]   = useState('');
  
  const dropdownRef    = useRef(null);
  const catMenuRef     = useRef(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {}
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) {
        setCatMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-surface-50/80 backdrop-blur-xl border-b border-surface-200 sticky top-0 z-50 transition-all duration-300">
      {/* Top bar */}
      <div className="bg-[#020617] text-surface-400 text-[10px] py-1.5 hidden sm:block border-b border-white/5">
        <div className="container mx-auto px-4 flex justify-between items-center font-black uppercase tracking-[0.2em]">
          <span className="flex items-center gap-2 italic">
            <Zap className="w-3 h-3 text-primary-400 fill-primary-400" /> 
            Liechtop Exclusive: Miễn phí vận chuyển cho đơn hàng từ 20Tr
          </span>
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><Phone className="w-3 h-3"/> Hotline: 1800.1000</span>
            <Link to="/support" className="hover:text-primary-400">Hỗ trợ</Link>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 lg:gap-10">
        {/* 1. Logo */}
        <Link to="/" className="flex items-center flex-shrink-0 group">
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-primary-400 via-white to-primary-400 bg-clip-text text-transparent uppercase italic tracking-tighter leading-none group-hover:tracking-normal transition-all duration-500">
              Liechtop
            </span>
            <span className="text-[9px] font-black tracking-[0.4em] text-primary-500 uppercase ml-1">Next Gen Store</span>
          </div>
        </Link>

        {/* 2. Category Dropdown */}
        <div className="relative" ref={catMenuRef}>
          <button 
            onClick={() => setCatMenuOpen(!catMenuOpen)}
            className="hidden lg:flex items-center gap-3 bg-surface-100 hover:bg-surface-200 text-surface-900 px-5 py-3 rounded-2xl border border-surface-200 transition-all flex-shrink-0 group"
          >
            <Grid className="w-5 h-5 text-primary-400 group-hover:rotate-90 transition-transform" />
            <span className="font-black text-xs uppercase tracking-widest">Danh mục</span>
            <ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {catMenuOpen && (
             <div className="absolute left-0 top-full mt-4 w-80 bg-surface-100 rounded-[30px] shadow-2xl border border-surface-200 p-3 z-[60] max-h-[480px] overflow-y-auto custom-scrollbar animate-[fadeIn_0.2s_ease-out]">
                <div className="p-4 mb-2">
                   <h3 className="text-[10px] font-black text-surface-500 uppercase tracking-widest mb-4">Các dòng sản phẩm</h3>
                   <div className="grid grid-cols-1 gap-2">
                      <Link 
                        to="/products" 
                        onClick={() => setCatMenuOpen(false)}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-200 transition-all group/all"
                      >
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-900/20 rounded-lg flex items-center justify-center text-primary-400"><Box className="w-4 h-4" /></div>
                            <span className="text-xs font-black text-surface-900 uppercase tracking-tight">Tất cả sản phẩm</span>
                         </div>
                         <ChevronDown className="w-4 h-4 -rotate-90 text-surface-400 group-hover/all:text-primary-400 transition-colors" />
                      </Link>

                      {categories.filter(c => !c.parentId).map(root => {
                        const subCats = categories.filter(sub => sub.parentId === root.id);
                        return (
                          <div key={root.id} className="space-y-1">
                            <Link 
                              to={`/products?category=${root.id}`}
                              onClick={() => setCatMenuOpen(false)}
                              className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-200 transition-all group/root"
                            >
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-surface-200 rounded-lg flex items-center justify-center text-surface-500 group-hover/root:text-primary-400 transition-colors"><Tag className="w-4 h-4" /></div>
                                  <span className="text-xs font-black text-surface-900 uppercase tracking-wider">{root.name}</span>
                               </div>
                               <ChevronDown className="w-4 h-4 -rotate-90 text-surface-400 group-hover/root:text-primary-400 transition-colors" />
                            </Link>
                            {subCats.length > 0 && (
                              <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-surface-200/50 ml-7 animate-in fade-in slide-in-from-top-1 duration-200">
                                {subCats.map(sub => (
                                  <Link
                                    key={sub.id}
                                    to={`/products?category=${sub.id}`}
                                    onClick={() => setCatMenuOpen(false)}
                                    className="flex items-center justify-between p-2 rounded-xl hover:bg-surface-200 hover:text-primary-400 text-surface-600 transition-all group/sub"
                                  >
                                    <span className="text-[11px] font-bold tracking-wide uppercase">{sub.name}</span>
                                    <ChevronDown className="w-3 h-3 -rotate-90 opacity-0 group-hover/sub:opacity-100 text-primary-400 transition-all" />
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* 3. Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl relative hidden sm:block">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm siêu phẩm..."
            className="w-full pl-12 pr-6 py-3.5 bg-surface-100 border border-surface-200 rounded-2xl text-sm text-surface-900 placeholder-surface-500 font-bold focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-surface-200 transition-all"
          />
        </form>

        {/* 4. Actions */}
        <div className="flex items-center gap-4 md:gap-8 flex-shrink-0">
          {/* Account */}
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-3 group"
              >
                <div className="w-11 h-11 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center text-white font-black text-sm border-2 border-primary-400/20 shadow-lg shadow-primary-900/40 group-hover:scale-105 transition-transform">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[9px] font-black text-surface-400 uppercase tracking-widest leading-none">Xin chào</span>
                  <span className="text-xs font-black text-surface-900 uppercase tracking-tight mt-1 max-w-[100px] truncate">
                    {user?.fullName || 'User'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-4 w-60 bg-surface-100 rounded-3xl shadow-2xl border border-surface-200 p-2 z-[60] overflow-hidden animate-[fadeIn_0.2s_ease-out]">
                  <div className="px-5 py-4 border-b border-surface-200 mb-2">
                    <p className="text-[9px] font-black text-surface-500 uppercase tracking-widest">Tài khoản</p>
                    <p className="text-xs font-black text-surface-900 truncate mt-1 italic">{user?.email}</p>
                  </div>
                  
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-xs font-black text-surface-600 uppercase tracking-widest hover:bg-surface-200 rounded-2xl transition-all hover:text-primary-400">
                    <User className="w-4 h-4" /> Thông tin cá nhân
                  </Link>
                  <Link to="/profile/addresses" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-xs font-black text-surface-600 uppercase tracking-widest hover:bg-surface-200 rounded-2xl transition-all hover:text-primary-400">
                    <MapPin className="w-4 h-4" /> Sổ địa chỉ
                  </Link>
                  <Link to="/profile/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-xs font-black text-surface-600 uppercase tracking-widest hover:bg-surface-200 rounded-2xl transition-all hover:text-primary-400">
                    <Package className="w-4 h-4" /> Đơn hàng của tôi
                  </Link>
                  
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-5 py-3 text-xs font-black text-primary-400 uppercase tracking-widest hover:bg-primary-900/20 rounded-2xl border border-primary-500/10 mt-1">
                      <Grid className="w-4 h-4" /> Quản trị viên
                    </Link>
                  )}
                  
                  <div className="mt-2 pt-2 border-t border-surface-200">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 text-xs font-black text-red-400 uppercase tracking-widest hover:bg-red-950/30 rounded-2xl transition-all">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-surface-100 rounded-2xl border border-surface-200 flex items-center justify-center group-hover:bg-primary-900/20 group-hover:border-primary-500/50 transition-all">
                <User className="w-5 h-5 text-surface-500 group-hover:text-primary-400" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-[9px] font-black text-surface-400 uppercase tracking-widest italic leading-none">Tham gia</span>
                <span className="text-xs font-black text-surface-900 uppercase tracking-tight mt-1">Đăng nhập</span>
              </div>
            </Link>
          )}

          {/* Wishlist */}
          <Link to="/wishlist" className="relative group p-1 outline-none hidden sm:block">
            <div className="w-12 h-12 bg-surface-100 rounded-3xl flex items-center justify-center text-surface-400 group-hover:bg-accent-500/10 group-hover:text-accent-500 transition-all border border-surface-200 group-hover:border-accent-500/50 shadow-inner">
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-xl border-2 border-surface-50 shadow-lg">
                  {wishlistItems.length}
                </span>
              )}
            </div>
          </Link>

          {/* Cart */}
          <button onClick={() => dispatch(toggleCartDrawer(true))} className="relative group p-1 outline-none">
            <div className="w-12 h-12 bg-[#020617] rounded-3xl flex items-center justify-center text-primary-400 transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.3)] shadow-inner">
               <ShoppingCart className="w-6 h-6" />
               {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-xl border-2 border-surface-50 shadow-lg animate-bounce">
                  {totalQuantity}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>
      <nav className="border-t border-surface-200 bg-surface-50/50 hidden md:block">
        <div className="container mx-auto px-4 flex items-center gap-10 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-surface-500">
          <Link to="/products" className="hover:text-primary-400 transition-colors flex items-center gap-2">TẤT CẢ SẢN PHẨM</Link>
          {categories.filter(cat => !cat.parentId).map(cat => {
            const IconMap = { 'Smartphone': Smartphone, 'Phone': Smartphone, 'Điện thoại': Smartphone, 'Laptop': Laptop, 'Máy tính xách tay': Laptop };
            const Icon = IconMap[cat.name] || Tag;
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.id}`}
                className="flex items-center gap-2 hover:text-white transition-colors group"
              >
                <Icon className="w-4 h-4 text-surface-300 group-hover:text-primary-400" /> {cat.name}
              </Link>
            );
          })}
          <Link to="/sale" className="flex items-center gap-2 text-accent-500 hover:text-white transition-all bg-accent-950/20 px-4 py-1.5 rounded-full border border-accent-500/20">
            <Tag className="w-3.5 h-3.5 fill-accent-500" /> SIÊU ƯU ĐÃI
          </Link>
        </div>
      </nav>
      {/* Mobile Search Overlay */}
      <form onSubmit={handleSearch} className="sm:hidden px-4 pb-4 pt-1">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-100 border border-surface-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 font-bold"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
        </div>
      </form>
    </header>
  );
};

export default Header;
