import { useEffect, useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, ShoppingBag, IndianRupee } from 'lucide-react';
import { getDashboardStats, getSalesChartData, getCafes } from '../lib/api';

const COLORS = ['#FF7622', '#F59E0B', '#22C55E', '#3b82f6', '#8b5cf6'];

export default function Stats() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const cafes = await getCafes();
      if (cafes && cafes.length > 0) {
        const cafeId = cafes[0].id;
        const [statsData, salesData] = await Promise.all([
          getDashboardStats(cafeId),
          getSalesChartData(cafeId)
        ]);
        setStats(statsData);
        setChartData(salesData);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !stats) return (
    <div className="space-y-8 animate-fade">
      {/* Metrics Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-loading h-40 border border-white/5 rounded-[2.5rem]"></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Skeleton */}
        <div className="lg:col-span-8 skeleton-loading h-[450px] border border-white/5 rounded-[3rem]"></div>
        
        {/* Pie Chart Skeleton */}
        <div className="lg:col-span-4 skeleton-loading h-[450px] border border-white/5 rounded-[3rem]"></div>
      </div>
    </div>
  );

  const categoryPieData = stats.popularItems.map((item: any) => ({
    name: item.name,
    value: item.count
  }));

  return (
    <div className="space-y-8 pb-20 animate-fade">
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-emerald-500/80', bg: 'bg-emerald-500/5' },
          { label: 'Orders Today', value: stats.ordersToday, icon: ShoppingBag, color: 'text-primary/80', bg: 'bg-primary/5' },
          { label: 'Active Kitchen', value: stats.activeOrders, icon: Users, color: 'text-amber-500/80', bg: 'bg-amber-500/5' },
          { label: 'Avg Sale', value: stats.ordersToday > 0 ? `₹${Math.round(stats.totalRevenue / stats.ordersToday)}` : '₹0', icon: TrendingUp, color: 'text-text-cream/80', bg: 'bg-white/5' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex flex-col justify-between h-full group hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between">
              <div className={`p-3 ${stat.bg} rounded-xl ${stat.color} border border-current/10 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="mt-6">
              <p className="text-text-muted text-[9px] font-black uppercase tracking-[0.2em] mb-1 group-hover:text-primary/60 transition-colors">{stat.label}</p>
              <h3 className="text-2xl font-black text-text-cream tracking-tighter">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xs font-black text-text-cream uppercase tracking-[0.4em]">Revenue Growth</h3>
            <div className="px-3 py-1 bg-white/5 text-[8px] font-black text-primary/60 border border-white/5 rounded-full uppercase tracking-widest">
              Last 7 Days
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7622" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF7622" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="name" stroke="#A0938C" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#A0938C" fontSize={9} fontWeight={900} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(28, 18, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#FF7622', padding: 0 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#FF7622" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 h-auto xl:h-[400px] flex flex-col">
          <h3 className="text-xs font-black text-text-cream uppercase tracking-[0.4em] mb-10">Product Velocity</h3>
          <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-10">
            <div className="w-full sm:w-1/2 aspect-square">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {categoryPieData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.6} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(28, 18, 15, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', backdropFilter: 'blur(10px)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
              {categoryPieData.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 group cursor-default">
                  <div className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(255,255,255,0.1)]" style={{ backgroundColor: COLORS[i % COLORS.length], opacity: 0.8 }}></div>
                  <span className="text-[10px] font-black text-text-muted group-hover:text-text-cream transition-colors truncate flex-1 uppercase tracking-widest">{item.name}</span>
                  <span className="text-[10px] font-black text-text-cream/90">{item.value} Sold</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
