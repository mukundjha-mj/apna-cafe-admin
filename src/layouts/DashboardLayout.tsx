import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { logout } from '../lib/auth';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Menu as MenuIcon, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Bell,
  X,
  Check,
  Clock,
  ExternalLink
} from 'lucide-react';
import { getCafes, getOrders, updateOrderStatus } from '../lib/api';

const SidebarLink = ({ to, icon: Icon, label, collapsed, onClick }: any) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={({ isActive }) => 
      `flex items-center gap-4 px-4 py-3 rounded-custom transition-all whitespace-nowrap
       ${isActive 
         ? 'bg-primary/10 text-primary' 
         : 'text-text-muted hover:bg-bg-accent hover:text-text-cream'}`
    }
  >
    <Icon size={20} className="shrink-0" />
    <span className={`font-medium transition-all duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'}`}>
      {label}
    </span>
  </NavLink>
);

const NOTIFICATION_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeToast, setActiveToast] = useState<any>(null);
  const [isCafeOpen, setIsCafeOpen] = useState(true);
  const [cafe, setCafe] = useState<any>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const fetchCafeData = async () => {
    try {
      const cafes = await getCafes();
      if (cafes && cafes.length > 0) {
        setCafe(cafes[0]);
        setIsCafeOpen(cafes[0].isOpen);
        
        // Fetch initial pending orders for notification bell
        const orders = await getOrders(cafes[0].id);
        const pending = orders.filter((o: any) => o.status === 'PENDING');
        setNotifications(pending);
      }
    } catch (error) {
      console.error('Failed to fetch cafe data:', error);
    }
  };

  useEffect(() => {
    fetchCafeData();
    const interval = setInterval(fetchCafeData, 30000);

    const handleStatusUpdate = () => fetchCafeData();
    window.addEventListener('cafeStatusUpdated', handleStatusUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cafeStatusUpdated', handleStatusUpdate);
    };
  }, [location.pathname]);

  // Socket setup
  useEffect(() => {
    if (!cafe) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_URL);

    socket.on('connect', () => {
      socket.emit('joinCafe', cafe.id);
    });

    socket.on('newOrder', (order) => {
      playSound();
      setNotifications(prev => [order, ...prev]);
      setActiveToast(order);
      // Auto-hide toast after 10 seconds
      setTimeout(() => setActiveToast((current: any) => current?.id === order.id ? null : current), 10000);
    });

    return () => {
      socket.disconnect();
    };
  }, [cafe?.id]);

  const handleAction = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus(orderId, status);
      setNotifications(prev => prev.filter(o => o.id !== orderId));
      if (activeToast?.id === orderId) setActiveToast(null);
      // Reload orders if on orders page
      if (location.pathname === '/orders') {
        window.dispatchEvent(new CustomEvent('refreshOrders'));
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-dark font-sans selection:bg-primary/30">
      {/* Toast Notification */}
      {activeToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4 animate-soft-fade-up">
          <div className="bg-bg-card/90 backdrop-blur-2xl border border-primary/30 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(255,118,34,0.2)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <ShoppingBag className="text-primary animate-bounce" size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-text-cream uppercase tracking-widest">New Order #{activeToast.orderNumber}</h4>
                  <button onClick={() => setActiveToast(null)} className="text-text-muted hover:text-text-cream"><X size={16}/></button>
                </div>
                <p className="text-[10px] text-text-muted mt-1 uppercase font-bold tracking-widest">
                  {activeToast.type} • ₹{activeToast.totalAmount}
                </p>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleAction(activeToast.id, 'ACCEPTED')}
                    className="flex-1 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleAction(activeToast.id, 'REJECTED')}
                    className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex sticky top-0 h-screen bg-bg-card border-r border-white/5 flex-col transition-all duration-300 z-50 
        ${collapsed ? 'w-20' : 'w-64'}`}>
        
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary/80">
            <Coffee size={28} className="shrink-0" />
            {!collapsed && <span className="text-xl font-black tracking-tighter whitespace-nowrap uppercase">Apna Cafe</span>}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" collapsed={collapsed} />
          <SidebarLink to="/orders" icon={ShoppingBag} label="Live Orders" collapsed={collapsed} />
          <SidebarLink to="/menu" icon={MenuIcon} label="Menu Manager" collapsed={collapsed} />
          <SidebarLink to="/stats" icon={BarChart3} label="Analytics" collapsed={collapsed} />
          <SidebarLink to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
        </nav>

        <div className="p-4 border-t border-white/5 relative">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-custom text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-all cursor-pointer border-none bg-transparent outline-none font-black uppercase text-[10px] tracking-widest"
          >
            <LogOut size={20} />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
          
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-[-12px] w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-[60] border border-primary/20"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <div className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        <aside className={`absolute left-0 top-0 bottom-0 w-72 bg-bg-card border-r border-white/5 flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary/80">
              <Coffee size={28} className="shrink-0" />
              <span className="text-xl font-black tracking-tighter uppercase">Apna Cafe</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-text-muted hover:text-text-cream">
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4">
            <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarLink to="/orders" icon={ShoppingBag} label="Live Orders" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarLink to="/menu" icon={MenuIcon} label="Menu Manager" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarLink to="/stats" icon={BarChart3} label="Analytics" onClick={() => setIsMobileMenuOpen(false)} />
            <SidebarLink to="/settings" icon={Settings} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
          </nav>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="sticky top-0 h-[80px] px-4 md:px-8 flex items-center justify-between border-b border-white/5 bg-bg-dark/40 backdrop-blur-2xl z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-text-muted hover:text-text-cream transition-colors"
            >
              <MenuIcon size={24} />
            </button>
            <div className="flex flex-col">
              <h1 className="text-sm md:text-base font-black text-text-cream uppercase tracking-tighter">
                {location.pathname === '/' && 'Intelligence Dashboard'}
                {location.pathname === '/orders' && 'Live Kitchen Terminal'}
                {location.pathname === '/menu' && 'Inventory Control'}
                {location.pathname === '/stats' && 'Business Analytics'}
                {location.pathname === '/settings' && 'Cafe Configurations'}
              </h1>
              <p className="text-[8px] text-text-muted font-black uppercase tracking-[0.4em] hidden sm:block">
                {location.pathname === '/' && 'Real-time Metrics & Insights'}
                {location.pathname === '/orders' && 'Streamlining Kitchen Operations'}
                {location.pathname === '/menu' && 'Managing Your Digital Menu'}
                {location.pathname === '/stats' && 'Growth & Performance Analysis'}
                {location.pathname === '/settings' && 'Personalize Your Store Profile'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-8">
            <div className="relative">
              <button 
                onClick={() => setIsBellOpen(!isBellOpen)}
                className={`relative p-3 rounded-2xl transition-all hover:scale-110 cursor-pointer ${isBellOpen ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text-cream bg-white/5'}`}
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-[8px] font-black flex items-center justify-center rounded-full border-2 border-bg-dark animate-bounce">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Bell Dropdown */}
              {isBellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsBellOpen(false)}></div>
                  <div className="absolute right-0 mt-4 w-80 bg-bg-card border border-white/10 rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-soft-fade-up">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-text-cream uppercase tracking-widest">Pending Orders</h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[8px] font-black rounded-md">{notifications.length} New</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center space-y-3 opacity-30">
                          <Check className="mx-auto" size={32} />
                          <p className="text-[8px] font-black uppercase tracking-widest">All caught up!</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => { navigate('/orders'); setIsBellOpen(false); }}
                            className="p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-text-cream uppercase tracking-tight italic">#{notif.orderNumber}</span>
                              <span className="text-[8px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1">
                                <Clock size={10} /> Just now
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-[9px] text-text-muted font-black uppercase">{notif.type}</p>
                              <p className="text-[10px] text-primary font-black">₹{notif.totalAmount}</p>
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleAction(notif.id, 'ACCEPTED'); }}
                                className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); navigate('/orders'); setIsBellOpen(false); }}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-text-muted rounded-lg border border-white/10"
                              >
                                <ExternalLink size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <button 
                      onClick={() => { navigate('/orders'); setIsBellOpen(false); }}
                      className="w-full py-4 text-[9px] font-black text-primary uppercase tracking-[0.3em] bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      View All Orders
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <div className={`hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-full border backdrop-blur-md transition-all duration-500 ${isCafeOpen ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500/80' : 'bg-red-500/5 border-red-500/20 text-red-500/80'}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isCafeOpen ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isCafeOpen ? 'Cafe Active' : 'Cafe Closed'}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
