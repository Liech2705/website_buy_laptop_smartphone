import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Package, ShoppingBag, LogOut, Menu, X,
  ChevronRight, Tag, ChevronDown, Store, Ticket
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const NAV_ITEMS = [
  { path: '/admin',            icon: LayoutDashboard, label: 'Tổng quan',      exact: true },
  { path: '/admin/orders',     icon: ShoppingBag,     label: 'Đơn hàng' },
  { path: '/admin/products',   icon: Package,         label: 'Sản phẩm' },
  { path: '/admin/categories', icon: Tag,             label: 'Danh mục' },
  { path: '/admin/users',      icon: Users,           label: 'Khách hàng' },
  { path: '/admin/vouchers',   icon: Ticket,          label: 'Mã giảm giá' },
];

const SidebarLink = ({ item, onClick }) => {
  const location = useLocation();
  const isActive = item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      end={item.exact}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${
        isActive
          ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-900/30'
          : 'text-surface-400 hover:bg-surface-200/50 hover:text-surface-100'
      }`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-surface-500 group-hover:text-primary-400'}`} />
      <span className="font-semibold text-sm">{item.label}</span>
      {isActive && <ChevronRight className="w-3 h-3 ml-auto text-white/70" />}
    </NavLink>
  );
};

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-surface-200/10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-surface-100 text-sm tracking-tight">Liechtop</p>
            <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest px-4 mb-3">Menu</p>
        {NAV_ITEMS.map(item => (
          <SidebarLink key={item.path} item={item} onClick={() => setIsMobileOpen(false)} />
        ))}
      </nav>

      {/* Admin User Info + Logout */}
      <div className="p-4 border-t border-surface-200/10 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0">
            {(user?.fullName || user?.email || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-surface-200 truncate">{user?.fullName || 'Admin'}</p>
            <p className="text-[10px] text-surface-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all font-semibold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-50 flex font-display" style={{ colorScheme: 'dark' }}>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-surface-100 border-r border-surface-200/30 hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-surface-100 h-full flex flex-col shadow-2xl">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-surface-200 rounded-xl text-surface-400"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="bg-surface-100 border-b border-surface-200/30 h-16 flex items-center justify-between px-4 md:hidden sticky top-0 z-10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-surface-100 text-sm">Admin</span>
          </Link>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 hover:bg-surface-200 rounded-xl text-surface-400"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
