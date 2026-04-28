// React import not required with new JSX runtime
import { useEffect, useState } from 'react';
import { X, Plus, ChevronDown, Loader2 } from 'lucide-react';
import api, { uploadMenuImage } from '../lib/api';

type Props = {
  item: any | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  imageSrc: string;
};

export default function EditItemModal({ item, open, onClose, onSaved, imageSrc }: Props) {
  const [form, setForm] = useState<any>({ name: '', price: '', category: 'pizza', description: '', isVeg: true, sizes: [] as any[], imageUrl: '' });
  const [newSize, setNewSize] = useState({ label: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        price: item.price || '',
        category: item.category || 'pizza',
        description: item.description || '',
        isVeg: item.isVeg ?? true,
        sizes: item.sizes || [],
        imageUrl: item.imageUrl || ''
      });
      setPreviewUrl(item.imageUrl || imageSrc || '');
      setImageFile(null);
    }
  }, [item]);

  if (!open || !item) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalImageUrl = form.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadMenuImage(imageFile);
      }
      await api.put(`/menu/${item.id}`, {
        ...form,
        imageUrl: finalImageUrl,
        price: parseFloat(form.price),
        sizes: form.sizes.map((s: any) => ({ ...s, price: parseFloat(s.price) }))
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error('Save failed', err);
    } finally {
      setSaving(false);
    }
  };

  const addSize = () => {
    if (newSize.label && newSize.price) {
      setForm({ ...form, sizes: [...form.sizes, newSize] });
      setNewSize({ label: '', price: '' });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      setForm({ ...form, imageUrl: result });
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setForm({ ...form, imageUrl: '' });
    setPreviewUrl('');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade">
      <div className="w-full sm:max-w-3xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl bg-bg-card border-x border-t sm:border border-white/5 flex flex-col relative overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-bg-card/80 backdrop-blur-md">
          <h3 className="font-black text-text-cream uppercase tracking-tight">Edit Menu Item</h3>
          <button onClick={onClose} className="p-2 rounded-xl bg-bg-accent text-text-muted hover:text-text-cream transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col gap-6">
            {/* Image Section */}
            <div className="space-y-3">
              <div className="w-full aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden bg-bg-accent border border-white/5 relative group">
                <img src={previewUrl || imageSrc} alt={form.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <label className="btn-primary !py-2 !px-4 cursor-pointer">
                    Change Image
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={saving} className="hidden" />
                  </label>
                  {previewUrl && (
                    <button onClick={clearImage} disabled={saving} className="btn-secondary !bg-error/20 !text-error !border-error/20 !py-2 !px-4">Remove</button>
                  )}
                </div>
              </div>
              <p className="text-[10px] text-text-muted text-center font-medium uppercase tracking-widest">Recommended size: 800x600px</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Item Name</label>
                <input 
                  value={form.name} 
                  onChange={(e)=>setForm({...form, name:e.target.value})} 
                  placeholder="e.g. Double Cheese Pizza"
                  className="w-full rounded-xl px-4 py-3 bg-bg-accent border border-white/5 text-text-cream focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Category</label>
                <div className="relative">
                  <select 
                    value={form.category} 
                    onChange={(e)=>setForm({...form, category:e.target.value})} 
                    className="w-full rounded-xl px-4 py-3 bg-bg-accent border border-white/5 text-text-cream appearance-none focus:border-primary/50 outline-none transition-all font-bold capitalize"
                  >
                    <option value="pizza">Pizza</option>
                    <option value="burgers">Burgers</option>
                    <option value="fries">Fries</option>
                    <option value="momos">Momos</option>
                    <option value="drinks">Drinks & Shakes</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Base Price (₹)</label>
                <input 
                  type="number" 
                  value={form.price} 
                  onChange={(e)=>setForm({...form, price:e.target.value})} 
                  className="w-full rounded-xl px-4 py-3 bg-bg-accent border border-white/5 text-text-cream focus:border-primary/50 outline-none transition-all font-black text-lg" 
                />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-12 h-7 rounded-full relative transition-all duration-300 ${form.isVeg ? 'bg-success' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${form.isVeg ? 'left-6' : 'left-1'}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-cream uppercase tracking-widest">Vegetarian</span>
                    <span className="text-[10px] text-text-muted font-medium uppercase tracking-tighter">Pure Veg Item</span>
                  </div>
                  <input type="checkbox" className="hidden" checked={form.isVeg} onChange={(e)=>setForm({...form, isVeg:e.target.checked})} />
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Description (Optional)</label>
              <textarea 
                value={form.description} 
                onChange={(e)=>setForm({...form, description:e.target.value})} 
                placeholder="Describe your dish..."
                className="w-full rounded-xl px-4 py-3 bg-bg-accent border border-white/5 text-text-cream focus:border-primary/50 outline-none transition-all min-h-[100px] resize-none" 
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">Custom Sizes & Pricing (Optional)</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  value={newSize.label} 
                  onChange={(e)=>setNewSize({...newSize, label:e.target.value})} 
                  className="flex-1 rounded-xl px-4 py-3 bg-bg-accent border border-white/5 text-text-cream focus:border-primary/50 outline-none transition-all text-sm" 
                  placeholder="Size (e.g. Regular)" 
                />
                <input 
                  type="number" 
                  value={newSize.price} 
                  onChange={(e)=>setNewSize({...newSize, price:e.target.value})} 
                  className="w-full sm:w-32 rounded-xl px-4 py-3 bg-bg-accent border border-white/5 text-text-cream focus:border-primary/50 outline-none transition-all text-sm font-bold" 
                  placeholder="Price (₹)" 
                />
                <button 
                  type="button" 
                  onClick={addSize} 
                  className="rounded-xl px-4 py-3 bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-primary/20 transition-all border border-primary/10"
                >
                  <Plus size={14} /> Add Variant
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {form.sizes.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 transition-all hover:border-primary/30">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">{s.label}</span>
                      <span className="text-xs text-text-cream font-bold">₹{s.price}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setForm({ ...form, sizes: form.sizes.filter((_: any, idx: number) => idx !== i) })} 
                      className="text-text-muted hover:text-error transition-colors p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-bg-accent/30 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose} 
            disabled={saving} 
            className="flex-1 px-6 py-3 rounded-xl bg-bg-accent border border-white/5 text-text-muted font-bold hover:bg-bg-accent/80 transition-all text-sm uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="flex-[2] px-6 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(255,118,34,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
