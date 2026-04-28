import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getOrders, updateOrderStatus, getCafes } from '../lib/api';
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Package, 
  XCircle,
  ChevronRight,
  Maximize2,
  Utensils,
  MapPin,
  Loader2,
  Inbox
} from 'lucide-react';
import OrderDetailsModal from '../components/OrderDetailsModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any; next: string | null; nextLabel: string }> = {
  PENDING: { label: 'Pending', color: 'text-orange-500/80', bg: 'bg-orange-500/5', icon: Clock, next: 'ACCEPTED', nextLabel: 'Accept Order' },
  ACCEPTED: { label: 'Accepted', color: 'text-blue-500/80', bg: 'bg-blue-500/5', icon: CheckCircle, next: 'PREPARING', nextLabel: 'Start Preparing' },
  PREPARING: { label: 'Preparing', color: 'text-amber-500/80', bg: 'bg-amber-500/5', icon: ChefHat, next: 'READY', nextLabel: 'Mark Ready' },
  READY: { label: 'Ready', color: 'text-emerald-500/80', bg: 'bg-emerald-500/5', icon: Package, next: 'COMPLETED', nextLabel: 'Complete Order' },
  COMPLETED: { label: 'Completed', color: 'text-text-muted', bg: 'bg-white/5', icon: CheckCircle, next: null, nextLabel: '' },
  CANCELLED: { label: 'Cancelled', color: 'text-red-500/80', bg: 'bg-red-500/5', icon: XCircle, next: null, nextLabel: '' },
};

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAllOrders = async () => {
    try {
      const cafes = await getCafes();
      if (cafes && cafes.length > 0) {
        const data = await getOrders(cafes[0].id);
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let socket: any;
    fetchAllOrders();

    const initSocket = async () => {
      const cafes = await getCafes();
      if (cafes && cafes.length > 0) {
        socket = io(API_URL);
        socket.on('connect', () => {
          socket.emit('join-cafe-room', cafes[0].id); 
        });
        socket.on('new-order', () => fetchAllOrders());
        socket.on('order-updated', () => fetchAllOrders());
      }
    };
    initSocket();

    return () => { if (socket) socket.disconnect(); };
  }, []);

  const handleStatusUpdate = async (e: React.MouseEvent, orderId: string, status: string) => {
    e.stopPropagation();
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const liveOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
  const historyOrders = orders.filter(o => o.status === 'COMPLETED' || o.status === 'CANCELLED');
  const displayOrders = activeTab === 'live' ? liveOrders : historyOrders;

  return (
    <div className="space-y-6 animate-fade pb-20 sm:pb-8">
      <div className="flex justify-end">
        <div className="flex bg-white/[0.02] p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setActiveTab('live')}
            className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'live' ? 'bg-primary/20 text-primary shadow-lg border border-primary/20' : 'text-text-muted hover:text-text-cream'}`}
          >
            Live ({liveOrders.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-primary/20 text-primary shadow-lg border border-primary/20' : 'text-text-muted hover:text-text-cream'}`}
          >
            History
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-loading h-64 border border-white/5 rounded-[2rem]"></div>
          ))}
        </div>
      ) : displayOrders.length === 0 ? (
        <div className="bg-white/[0.02] rounded-3xl p-16 text-center border border-dashed border-white/5">
          <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mx-auto mb-6 text-text-muted/20">
            <Inbox size={32} />
          </div>
          <h3 className="text-lg font-bold text-text-cream/80">No orders here</h3>
          <p className="text-xs text-text-muted mt-2">New orders will pop up automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayOrders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.PENDING;
            const StatusIcon = config.icon;

            return (
              <div 
                key={order.id} 
                onClick={() => openOrderDetails(order)}
                className="group relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                <div className="p-5 space-y-5">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.color} flex items-center justify-center border border-current/10`}>
                        <StatusIcon size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-text-cream tracking-tight">#{order.orderNumber}</h3>
                          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${config.bg} border border-current/10 ${config.color}`}>
                            <span className="w-1 h-1 rounded-full bg-current animate-pulse" />
                            <span className="text-[7px] font-black uppercase tracking-widest">{order.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[8px] font-black text-text-muted uppercase tracking-widest mt-0.5">
                          <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="w-1 h-1 rounded-full bg-white/10" />
                          <span className={order.type === 'DELIVERY' ? 'text-blue-500/60' : 'text-primary/60'}>{order.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] text-text-muted font-black uppercase tracking-widest mb-1">Bill</p>
                      <p className="text-xl font-black text-text-cream/90">₹{order.totalAmount}</p>
                    </div>
                  </div>

                  {/* Customer Preview */}
                  <div className="px-4 py-2.5 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-primary/5 flex items-center justify-center text-primary/60 font-bold text-[10px]">
                        {order.user?.name?.[0] || 'G'}
                      </div>
                      <span className="text-[11px] font-bold text-text-cream/80 truncate max-w-[100px]">{order.user?.name || 'Guest User'}</span>
                    </div>
                    {order.tableNumber && (
                      <span className="text-[8px] font-black uppercase text-primary/50">Table {order.tableNumber}</span>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[8px] font-black text-text-muted uppercase tracking-widest">Summary</h4>
                      <span className="text-[8px] font-black text-primary/40 uppercase">{order.orderItems.length} Items</span>
                    </div>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto scrollbar-hide">
                      {order.orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded bg-white/5 flex items-center justify-center text-[9px] font-black text-text-muted/60 border border-white/5">
                              {item.quantity}
                            </span>
                            <span className="text-[11px] font-bold text-text-cream/70 line-clamp-1">{item.itemName}</span>
                          </div>
                          {item.size && <span className="text-[8px] font-black uppercase text-primary/30">{item.size}</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="pt-2 flex items-center gap-2">
                    {config.next && (
                      <button 
                        onClick={(e) => handleStatusUpdate(e, order.id, config.next!)}
                        className="flex-1 py-3.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary/80 text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-primary/20 flex items-center justify-center gap-2 group/btn"
                      >
                        {config.nextLabel}
                        <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); openOrderDetails(order); }}
                      className="w-11 h-11 rounded-xl bg-white/[0.02] hover:bg-white/5 text-text-muted hover:text-text-cream transition-all border border-white/5 flex items-center justify-center shrink-0"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      <OrderDetailsModal 
        isOpen={isModalOpen} 
        order={selectedOrder} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
