import { useState } from 'react';
import { X, Plus, ChevronDown, Loader2 } from 'lucide-react';
import { uploadMenuImage } from '../lib/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: any) => void;
}

export default function AddItemModal({ isOpen, onClose, onAdd }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'pizza',
    price: '',
    description: '',
    isVeg: true,
    isAvailable: true,
    sizes: [] as any[],
    imageUrl: ''
  });

  const [newSize, setNewSize] = useState({ label: '', price: '' });
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalImageUrl = formData.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadMenuImage(imageFile);
      }
      onAdd({
        ...formData,
        imageUrl: finalImageUrl,
        price: parseFloat(formData.price),
        sizes: formData.sizes.map(s => ({ ...s, price: parseFloat(s.price) }))
      });
      onClose();
    } catch (error) {
      console.error('Save failed', error);
    } finally {
      setLoading(false);
    }
  };

  const addSize = () => {
    if (newSize.label && newSize.price) {
      setFormData({ ...formData, sizes: [...formData.sizes, newSize] });
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
      setFormData({ ...formData, imageUrl: result });
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setFormData({ ...formData, imageUrl: '' });
    setPreviewUrl('');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade">
      <div className="w-full sm:max-w-3xl h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl bg-bg-card border-x border-t sm:border border-white/5 flex flex-col relative overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b border-white/5 bg-bg-card/80 backdrop-blur-md">
          <div className="flex flex-col">
            <h3 className="font-black text-text-cream uppercase tracking-tight">Add New Dish</h3>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Create fresh item</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-bg-accent text-text-muted hover:text-text-cream transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <form id="add-item-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Image Section */}
            <div className="space-y-3">
              <div className="w-full aspect-video sm:aspect-[4/3] rounded-2xl overflow-hidden bg-bg-accent border border-white/5 relative group">
                <img src={previewUrl || '/assets/img-placeholder.svg'} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <label className="btn-primary !py-2 !px-4 cursor-pointer">
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} className="hidden" />
                  </label>
                  {previewUrl && (
                    <button type="button" onClick={clearImage} disabled={loading} className="btn-secondary !bg-error/20 !text-error !border-error/20 !py-2 !px-4">Remove</button>
                  )}
                </div>
              </div>
              {!previewUrl && (
                <div className="flex justify-center sm:hidden">
                  <label className="text-xs text-primary font-bold cursor-pointer">
                    Tap to upload image
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={loading} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Item Name</label>
                <input 
                  required
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  placeholder="e.g. Farmhouse Pizza"
                  className="w-full rounded-xl px-4 py-3 bg-bg-accent border border-white/5 text-text-cream focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Category</label>
                <div className="relative">
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({ ...formData, category: e.target.value })} 
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
                  required
                  type="number" 
                  value={formData.price} 
                  onChange={e => setFormData({ ...formData, price: e.target.value })} 
                  placeholder="99"
                  className="w-full rounded-xl px-4 py-3 bg-bg-accent border border-white/5 text-text-cream focus:border-primary/50 outline-none transition-all font-black text-lg" 
                />
              </div>
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className={`w-12 h-7 rounded-full relative transition-all duration-300 ${formData.isVeg ? 'bg-success' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${formData.isVeg ? 'left-6' : 'left-1'}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-text-cream uppercase tracking-widest">Vegetarian</span>
                    <span className="text-[10px] text-text-muted font-medium uppercase tracking-tighter">Pure Veg Item</span>
                  </div>
                  <input type="checkbox" className="hidden" checked={formData.isVeg} onChange={e => setFormData({ ...formData, isVeg: e.target.checked })} />
                </label>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2 block">Description (Optional)</label>
              <textarea 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Briefly describe your dish..."
                className="w-full rounded-xl px-4 py-3 bg-bg-accent border border-white/5 text-text-cream focus:border-primary/50 outline-none transition-all min-h-[100px] resize-none" 
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-muted block">Custom Sizes & Pricing (Optional)</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  value={newSize.label} 
                  onChange={e => setNewSize({ ...newSize, label: e.target.value })} 
                  className="flex-1 rounded-xl px-4 py-3 bg-bg-accent border border-white/5 text-text-cream focus:border-primary/50 outline-none transition-all text-sm" 
                  placeholder="Size (e.g. Regular)" 
                />
                <input 
                  type="number" 
                  value={newSize.price} 
                  onChange={e => setNewSize({ ...newSize, price: e.target.value })} 
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
                {formData.sizes.map((s: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 transition-all hover:border-primary/30">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">{s.label}</span>
                      <span className="text-xs text-text-cream font-bold">₹{s.price}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter((_, idx) => idx !== i) })} 
                      className="text-text-muted hover:text-error transition-colors p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-bg-accent/30 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose} 
            disabled={loading} 
            className="flex-1 px-6 py-3 rounded-xl bg-bg-accent border border-white/5 text-text-muted font-bold hover:bg-bg-accent/80 transition-all text-sm uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="add-item-form"
            disabled={loading} 
            className="flex-[2] px-6 py-3 rounded-xl bg-primary text-white font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(255,118,34,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Item'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
