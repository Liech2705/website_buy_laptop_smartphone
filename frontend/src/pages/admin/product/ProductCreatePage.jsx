import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct, uploadProductImage, getAttributeNames } from '../../../services/adminApi';
import { getCategories } from '../../../services/categoryApi';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Plus, X, Upload, Package, Info, DollarSign, Layers, Image as ImageIcon, Loader2, Sparkles, PlusCircle, Settings2, FileText, Cpu, Trash2 } from 'lucide-react';
import { resolveImageUrl } from '../../../utils/imageHelper';

export default function ProductCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [existingAttributes, setExistingAttributes] = useState([]);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    brandName: '',
    imageUrls: [],
    variants: [{ sku: '', price: '', stock: '' }],
    attributes: [
        { name: 'CPU', value: '' },
        { name: 'RAM', value: '' },
        { name: 'VGA', value: '' },
        { name: 'Màn hình', value: '' }
    ]
  });

  useEffect(() => {
    Promise.all([getCategories(), getAttributeNames()])
      .then(([cats, attrs]) => {
        setCategories(cats);
        setExistingAttributes(attrs || []);
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const addVariant = () => setForm(p => ({ ...p, variants: [...p.variants, { sku: '', price: '', stock: '' }] }));
  const removeVariant = (index) => setForm(p => ({ ...p, variants: p.variants.filter((_, i) => i !== index) }));
  const updateVariant = (index, field, value) => {
    const newVariants = [...form.variants];
    newVariants[index][field] = value;
    setForm(p => ({ ...p, variants: newVariants }));
  };

  const addAttribute = () => setForm(p => ({ ...p, attributes: [...p.attributes, { name: '', value: '' }] }));
  const removeAttribute = (index) => setForm(p => ({ ...p, attributes: p.attributes.filter((_, i) => i !== index) }));
  const updateAttribute = (index, field, value) => {
    const newAttrs = [...form.attributes];
    newAttrs[index][field] = value;
    setForm(p => ({ ...p, attributes: newAttrs }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadProductImage(file);
      setForm(p => ({ ...p, imageUrls: [...p.imageUrls, res.imageUrl] }));
      toast.success('Đã tải ảnh lên!');
    } catch {
      toast.error('Lỗi tải ảnh');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.variants.length === 0) return toast.error('Vui lòng thêm ít nhất 1 biến thể');
    setLoading(true);
    try {
      const dto = {
        ...form,
        basePrice: parseFloat(form.basePrice) || 0,
        variants: form.variants.map(v => ({ ...v, price: parseFloat(v.price), stock: parseInt(v.stock) })),
        attributes: form.attributes
          .filter(a => a.name.trim() !== '' && a.value.trim() !== '')
          .map(a => ({ name: a.name.trim(), value: a.value.trim() }))
      };
      await createProduct(dto);
      toast.success('Tạo sản phẩm thành công!');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* HEADER - HIGH CONTRAST */}
      <div className="flex items-center justify-between bg-surface-200 p-8 rounded-[32px] border border-white/10 shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin/products')} className="p-4 bg-slate-800 hover:bg-primary-600 text-white rounded-2xl transition-all shadow-lg active:scale-90 border border-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-primary-400" />
                <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Hệ thống quản trị kho</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Thêm Sản phẩm Mới</h1>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
            <Package className="w-5 h-5 text-surface-500" />
            <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Chế độ Admin</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* MAIN INFO */}
          <div className="admin-card space-y-8 bg-surface-200/60">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                <Info className="w-5 h-5 text-primary-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Thông tin cơ bản</h3>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="admin-form-label">Tên sản phẩm (Hiển thị tiêu đề) *</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                        placeholder="VD: Laptop Gaming MSI Katana 15 B13V..."
                        className="admin-form-input !text-white !bg-slate-900/50" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="admin-form-label">Giá niêm yết (Cơ bản - VNĐ)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" />
                            <input type="number" name="basePrice" value={form.basePrice} onChange={handleChange}
                                placeholder="0" className="admin-form-input pl-12 font-bold text-primary-400 !bg-slate-900/50" />
                        </div>
                    </div>
                    <div>
                        <label className="admin-form-label">Thương hiệu (Hãng sản xuất)</label>
                        <input name="brandName" value={form.brandName} onChange={handleChange}
                            placeholder="VD: Dell, HP, ASUS..." className="admin-form-input !bg-slate-900/50" />
                    </div>
                </div>

                <div>
                    <label className="admin-form-label">Phân loại Danh mục</label>
                    <select name="categoryId" value={form.categoryId} onChange={handleChange}
                        className="admin-form-select !bg-slate-900/50">
                        <option value="" className="bg-slate-900">-- Chọn danh mục --</option>
                        {categories.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                    </select>
                </div>
            </div>
          </div>

          {/* ATTRIBUTES SECTION - RAM, CPU, VGA... */}
          <div className="admin-card space-y-8 bg-surface-200/60 border-l-4 border-l-indigo-500">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Thông số kỹ thuật (RAM, CPU...)</h3>
                </div>
                <button type="button" onClick={addAttribute} className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white flex items-center gap-2 transition-colors">
                    <PlusCircle className="w-4 h-4" /> Thêm thông số mới
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {form.attributes.map((attr, idx) => {
                    const isCustom = attr.isCustom || (attr.name !== '' && !existingAttributes.includes(attr.name));
                    const selectValue = isCustom ? '__custom__' : (existingAttributes.includes(attr.name) ? attr.name : '');
                    
                    return (
                        <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-slate-900/40 rounded-2xl border border-white/5 group">
                            <div className="w-full md:w-1/3 space-y-2">
                                <select 
                                    value={selectValue}
                                    onChange={e => {
                                        const val = e.target.value;
                                        if (val === '__custom__') {
                                            updateAttribute(idx, 'isCustom', true);
                                            updateAttribute(idx, 'name', '');
                                        } else {
                                            updateAttribute(idx, 'isCustom', false);
                                            updateAttribute(idx, 'name', val);
                                        }
                                    }}
                                    className="admin-form-select !py-3 !text-xs font-black uppercase tracking-widest !bg-slate-800 text-white w-full"
                                >
                                    <option value="" className="bg-slate-900">-- Chọn thông số --</option>
                                    {existingAttributes.map(a => (
                                        <option key={a} value={a} className="bg-slate-900">{a}</option>
                                    ))}
                                    <option value="__custom__" className="bg-slate-900 text-indigo-400 font-bold">+ Khác (Nhập thủ công...)</option>
                                </select>
                                
                                {isCustom && (
                                    <input 
                                        type="text"
                                        value={attr.name}
                                        onChange={e => updateAttribute(idx, 'name', e.target.value)}
                                        placeholder="Nhập thông số mới..."
                                        className="admin-form-input !py-3 !text-xs font-black uppercase tracking-widest !bg-slate-850 animate-in slide-in-from-top duration-200"
                                        required
                                    />
                                )}
                            </div>
                            <div className="w-full md:w-2/3 flex items-center gap-4 align-self-stretch">
                                <input value={attr.value} onChange={e => updateAttribute(idx, 'value', e.target.value)}
                                    placeholder="Giá trị: Core i9 13900H, 32GB LPDDR5..." 
                                    className="admin-form-input !py-3 !text-white font-bold italic !bg-slate-800 w-full" />
                                <button type="button" onClick={() => removeAttribute(idx)} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex gap-3">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <p className="text-[10px] text-indigo-300 font-bold italic leading-relaxed">
                    Hệ thống sẽ tự động lưu tên thuộc tính mới nếu bạn nhập từ bàn phím. Hãy nhập đầy đủ RAM, CPU để khách hàng dễ chọn lựa.
                </p>
            </div>
          </div>

          {/* VARIANTS (SKUs) */}
          <div className="admin-card space-y-8 bg-surface-200/60">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <Layers className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Cấu hình biến thể (SKU)</h3>
                </div>
                <button type="button" onClick={addVariant} className="text-[10px] font-black text-amber-400 uppercase tracking-widest hover:text-white flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Thêm cấu hình
                </button>
            </div>

            <div className="space-y-4">
                {form.variants.map((v, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-slate-900/40 rounded-[24px] border border-white/5">
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-[9px] font-black text-surface-500 uppercase tracking-widest ml-2">Mã SKU định danh</label>
                            <input value={v.sku} onChange={e => updateVariant(idx, 'sku', e.target.value)} required
                                placeholder="VD: MS-KT15-BLACK" className="admin-form-input !py-3 !bg-slate-800" />
                        </div>
                        <div className="md:col-span-4 space-y-2">
                            <label className="text-[9px] font-black text-surface-500 uppercase tracking-widest ml-2">Giá bán thực tế</label>
                            <input type="number" value={v.price} onChange={e => updateVariant(idx, 'price', e.target.value)} required
                                placeholder="0" className="admin-form-input !py-3 font-bold text-primary-400 !bg-slate-800" />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                            <label className="text-[9px] font-black text-surface-500 uppercase tracking-widest ml-2">Số lượng tồn</label>
                            <input type="number" value={v.stock} onChange={e => updateVariant(idx, 'stock', e.target.value)} required
                                placeholder="0" className="admin-form-input !py-3 text-center !bg-slate-800" />
                        </div>
                        <div className="md:col-span-1 flex items-end">
                            <button type="button" onClick={() => removeVariant(idx)} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-8">
            <div className="admin-card bg-surface-200/60 sticky top-8 space-y-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <ImageIcon className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Hình ảnh đại diện</h3>
                    </div>

                    <label className="relative block group cursor-pointer">
                        <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-white/10 rounded-[24px] bg-slate-900/50 hover:bg-primary-600/5 hover:border-primary-500/50 transition-all">
                            <Upload className="w-8 h-8 text-surface-500 mb-3 group-hover:scale-110 transition-transform" />
                            <p className="text-[9px] font-black text-white uppercase tracking-widest">Tải ảnh lên</p>
                        </div>
                        <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                        {form.imageUrls.map((url, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group">
                                <img src={resolveImageUrl(url)} alt="" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setForm(p => ({ ...p, imageUrls: p.imageUrls.filter((_, i) => i !== idx) }))}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 ml-2">
                            <FileText className="w-4 h-4 text-surface-500" />
                            <label className="admin-form-label !mb-0">Mô tả sản phẩm</label>
                        </div>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={6}
                            placeholder="Bài giới thiệu chi tiết về sản phẩm..."
                            className="admin-form-input !bg-slate-900/50 resize-none !text-sm leading-relaxed" />
                    </div>
                </div>

                <div className="pt-4 space-y-4">
                    <button type="submit" disabled={loading}
                        className="admin-form-btn-primary w-full flex items-center justify-center gap-3 py-5 shadow-2xl">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span className="text-sm">{loading ? 'Đang lưu...' : 'Xác nhận Thêm mới'}</span>
                    </button>
                    <button type="button" onClick={() => navigate('/admin/products')}
                        className="admin-form-btn-secondary w-full py-4 text-[10px] !bg-transparent border border-white/10 hover:border-white/30">
                        Hủy bỏ
                    </button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}
