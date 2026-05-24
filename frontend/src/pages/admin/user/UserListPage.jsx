import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllUsers } from '../../../services/adminApi';
import { Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ROLE_MAP = {
  owner: { label: 'Owner', color: 'text-pink-400 font-extrabold border-pink-500/30', bg: 'bg-pink-500/10' },
  admin: { label: 'Admin', color: 'text-primary-400', bg: 'bg-primary-500/10' },
  user:  { label: 'Người dùng', color: 'text-surface-400', bg: 'bg-surface-500/10' },
};

export default function AdminUserListPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const pageSize = 15;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers(page, pageSize, roleFilter || null);
      setUsers(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch { toast.error('Lỗi tải danh sách người dùng'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Thành viên hệ thống</h1>
          <p className="text-surface-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">{total} tài khoản đã được xác thực</p>
        </div>
      </div>

      {/* Role Filter */}
      <div className="flex gap-2 bg-surface-200/30 p-2 rounded-3xl border border-surface-200/20 w-fit">
        {[['', 'Tất cả'], ['User', 'Người dùng'], ['Admin', 'Admin'], ['Owner', 'Owner']].map(([val, label]) => (
          <button key={val} onClick={() => { setRoleFilter(val); setPage(1); }}
            className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              roleFilter === val ? 'bg-primary-600 text-white shadow-lg shadow-primary-950/40' : 'text-surface-400 hover:text-white'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="bg-surface-100/40 backdrop-blur-xl rounded-[40px] border border-surface-200/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200/10 bg-surface-200/20">
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Danh tính</th>
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Liên hệ</th>
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Cấp bậc</th>
                <th className="text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Ngày tham gia</th>
                <th className="text-right text-[10px] font-black text-surface-400 uppercase tracking-[0.2em] px-8 py-6">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200/10">
              {loading
                ? [1,2,3,4,5,6].map(i => (
                    <tr key={i}>
                      <td colSpan={5} className="px-8 py-6"><div className="h-6 bg-surface-200/20 rounded-full animate-pulse" /></td>
                    </tr>
                  ))
                : users.map(user => {
                    const roleKey = user.roleName?.toLowerCase() || 'user';
                    const role = ROLE_MAP[roleKey] ?? ROLE_MAP.user;
                    return (
                      <tr key={user.id} className="group hover:bg-primary-500/5 transition-all">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 p-[2px] shadow-lg group-hover:scale-110 transition-transform">
                              <div className="w-full h-full bg-surface-100 rounded-[14px] flex items-center justify-center font-black text-primary-400 text-base">
                                {(user.fullName || user.email || 'U')[0].toUpperCase()}
                              </div>
                            </div>
                            <span className="font-black text-white text-sm uppercase tracking-tight group-hover:text-primary-400 transition-colors">{user.fullName || '—'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-surface-800 font-bold italic">{user.email}</td>
                        <td className="px-8 py-5">
                          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-current/10 ${role.bg} ${role.color}`}>{role.label}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-surface-700 uppercase tracking-widest">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '—'}
                            </span>
                            <span className="text-[9px] font-bold text-surface-600 uppercase tracking-widest">Gia nhập</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Link to={`/admin/users/${user.id}`}
                            className="inline-flex items-center px-4 py-2 bg-surface-200/50 hover:bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                            Chi tiết
                          </Link>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
          {!loading && users.length === 0 && (
            <div className="text-center py-24 text-surface-600">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-black uppercase tracking-widest text-xs">Dữ liệu người dùng trống</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-8 py-6 bg-surface-200/10 border-t border-surface-200/10">
            <p className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Trang {page} / {totalPages}</p>
            <div className="flex gap-3">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                className="p-3 bg-surface-200/50 hover:bg-surface-200 rounded-2xl text-surface-400 disabled:opacity-20 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}
                className="p-3 bg-surface-200/50 hover:bg-surface-200 rounded-2xl text-surface-400 disabled:opacity-20 transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
