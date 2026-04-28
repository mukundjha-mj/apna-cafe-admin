// React import not required with new JSX runtime
import { X } from 'lucide-react';

type Props = {
  item: any | null;
  open: boolean;
  onClose: () => void;
};

export default function ViewItemModal({ item, open, onClose }: Props) {
  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-w-2xl w-full rounded-2xl bg-bg-card border border-white/5 p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 p-2 rounded-md text-text-muted hover:text-text-cream">
          <X />
        </button>

        <div className="flex gap-6">
          <div className="w-40 h-40 rounded-lg overflow-hidden bg-bg-accent border border-white/5">
            <img src={item.imageUrl || '/assets/img-placeholder.svg'} alt={item.name} className="w-full h-full object-cover" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/assets/img-placeholder.svg'}} />
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-black text-text-cream mb-2">{item.name}</h3>
            <p className="text-sm text-text-muted mb-4">{item.category}</p>
            <p className="text-lg font-bold text-primary mb-4">₹{item.price}</p>
            <p className="text-sm text-text-cream/90">{item.description || 'No description available.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
