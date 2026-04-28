import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Orders from './pages/Orders';
import MenuManager from './pages/Menu';
import Stats from './pages/Stats';
import Login from './pages/Login';
import { getDashboardStats, getCafes } from './lib/api';
import { useAuth } from './lib/auth';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const cafes = await getCafes();
      if (cafes && cafes.length > 0) {
        const data = await getDashboardStats(cafes[0].id);
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) return (
    <div className="space-y-8 animate-fade">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-loading h-32 md:h-40 border border-white/5 rounded-[2rem]"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Activity Skeleton */}
        <div className="lg:col-span-8 skeleton-loading h-[500px] border border-white/5 rounded-[2.5rem]"></div>
        
        {/* Top Sellers Skeleton */}
        <div className="lg:col-span-4 skeleton-loading h-[500px] border border-white/5 rounded-[2.5rem]"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'text-emerald-500/80', bg: 'bg-emerald-500/5' },
          { label: 'Orders Today', value: stats.ordersToday, color: 'text-primary/80', bg: 'bg-primary/5' },
          { label: 'Active Kitchen', value: stats.activeOrders, color: 'text-amber-500/80', bg: 'bg-amber-500/5' },
          { label: 'Avg Sale', value: stats.ordersToday > 0 ? `₹${Math.round(stats.totalRevenue / stats.ordersToday)}` : '₹0', color: 'text-text-cream/80', bg: 'bg-white/5' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:border-primary/20 transition-all group">
            <p className="text-text-muted text-[9px] font-black uppercase tracking-[0.2em] mb-3 group-hover:text-primary/60 transition-colors">{stat.label}</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-black text-text-cream tracking-tighter">{stat.value}</h3>
              <span className={`text-[7px] font-black px-2 py-0.5 rounded-full border border-current/10 ${stat.color} ${stat.bg} uppercase tracking-widest`}>Live</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xs font-black text-text-cream uppercase tracking-[0.4em]">Recent Activity</h3>
            <button 
              className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all border border-white/5" 
              onClick={fetchStats}
            >
              <Loader2 size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
            {stats.recentActivity.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <p className="text-text-muted text-[10px] font-black uppercase tracking-widest">No activity reported</p>
              </div>
            ) : (
              stats.recentActivity.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-primary/20 transition-all group/item">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary/60 font-black text-[10px] border border-primary/10 group-hover/item:bg-primary/10 transition-colors">
                      #{order.orderNumber}
                    </div>
                    <div>
                      <p className="font-black text-base text-text-cream/90 tracking-tight">₹{order.totalAmount}</p>
                      <p className="text-[9px] text-text-muted uppercase tracking-widest font-black mt-1">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.orderItems.length} items
                      </p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border
                    ${order.status === 'COMPLETED' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500/70' : 'bg-amber-500/5 border-amber-500/20 text-amber-500/70'}`}>
                    {order.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="lg:col-span-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
          <h3 className="text-xs font-black text-text-cream uppercase tracking-[0.4em] mb-10 text-center">Top Sellers</h3>
          <div className="space-y-8">
            {stats.popularItems.length === 0 ? (
              <p className="text-text-muted text-[10px] font-black uppercase tracking-widest py-20 text-center italic">Awaiting data...</p>
            ) : (
              stats.popularItems.map((item: any, i: number) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-text-cream/80 uppercase tracking-tight">{item.name}</span>
                    <span className="text-[9px] font-black text-primary/60 uppercase">{item.count} Sold</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-primary/40 h-full transition-all duration-1000" 
                      style={{ width: `${(item.count / stats.popularItems[0].count) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import Settings from './pages/Settings';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        
        <Route path="/" element={user ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="stats" element={<Stats />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
