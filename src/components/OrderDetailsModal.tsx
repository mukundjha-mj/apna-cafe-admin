import { X, User, Phone, MapPin, CreditCard, ShoppingBag, Utensils, IndianRupee, ArrowRight } from 'lucide-react';

interface OrderDetailsModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  PENDING: { bg: 'bg-orange-500/5', text: 'text-orange-500/80', dot: 'bg-orange-500/80' },
  ACCEPTED: { bg: 'bg-blue-500/5', text: 'text-blue-500/80', dot: 'bg-blue-500/80' },
  PREPARING: { bg: 'bg-amber-500/5', text: 'text-amber-500/80', dot: 'bg-amber-500/80' },
  READY: { bg: 'bg-emerald-500/5', text: 'text-emerald-500/80', dot: 'bg-emerald-500/80' },
  COMPLETED: { bg: 'bg-white/5', text: 'text-text-muted', dot: 'bg-text-muted' },
  CANCELLED: { bg: 'bg-red-500/5', text: 'text-red-500/80', dot: 'bg-red-500/80' },
};

export default function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen || !order) return null;

  const sc = statusColors[order.status] || statusColors.PENDING;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 animate-fade">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-bg-card/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Compact Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary/70 border border-primary/10">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-text-cream tracking-tight uppercase">Order #{order.orderNumber}</h3>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${sc.bg} ${sc.text} border border-current/10`}>
                  <span className={`w-1 h-1 rounded-full ${sc.dot} animate-pulse`} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{order.status}</span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-text-muted hover:text-text-cream transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Bento Grid Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Bento Cell: Customer */}
            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
              <h4 className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-2">
                <User size={12} className="text-primary/60" /> Customer
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary/70 font-bold text-xs">
                    {order.user?.name?.[0] || 'G'}
                  </div>
                  <div>
                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">Name</p>
                    <p className="text-sm font-bold text-text-cream">{order.user?.name || 'Guest User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-text-muted">
                    <Phone size={14} />
                  </div>
                  <div>
                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">Mobile</p>
                    <p className="text-sm font-bold text-text-cream">{order.user?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Cell: Fulfilment */}
            <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
              <h4 className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-2">
                <MapPin size={12} className="text-primary/60" /> Fulfilment
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">Type</p>
                    <p className="text-sm font-bold text-text-cream uppercase tracking-tighter">{order.type}</p>
                  </div>
                  {order.tableNumber && (
                    <div className="text-right">
                      <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">Table</p>
                      <p className="text-sm font-bold text-primary/80 italic">#{order.tableNumber}</p>
                    </div>
                  )}
                </div>
                {order.type === 'DELIVERY' && order.address && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mb-1">Address</p>
                    <p className="text-[10px] font-medium text-text-cream/80 leading-relaxed line-clamp-1">{order.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bento Cell: Order Items (Full width) */}
            <div className="md:col-span-2 p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
              <h4 className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-2">
                <Utensils size={12} className="text-primary/60" /> Items
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto scrollbar-hide">
                {order.orderItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary/60 border border-primary/10">
                        {item.quantity}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-text-cream tracking-tight">{item.itemName}</p>
                        {item.size && (
                          <span className="text-[8px] font-black uppercase tracking-widest text-primary/50">{item.size}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs font-bold text-text-cream/80">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bento Cell: Payment (Full width) */}
            <div className="md:col-span-2 p-5 rounded-3xl bg-primary/[0.02] border border-primary/10 flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary/60">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">Method</p>
                  <p className="text-xs font-bold text-text-cream uppercase">{order.paymentMethod}</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">Subtotal</p>
                  <p className="text-xs font-bold text-text-cream/60">₹{order.subtotal}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-primary/60 font-black uppercase tracking-widest">Total Amount</p>
                  <div className="flex items-center gap-1 text-2xl font-black text-primary/80 tracking-tighter">
                    <IndianRupee size={16} />
                    {order.totalAmount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-6 border-t border-white/5 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-cream text-[10px] font-black uppercase tracking-[0.3em] transition-all border border-white/10"
          >
            Close Details
          </button>
          {order.status === 'PENDING' && (
            <button 
              className="flex-[2] py-4 rounded-2xl bg-primary/80 hover:bg-primary text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group"
            >
              Take Action
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
