import { useEffect, useState } from 'react';
import { getCafes } from '../lib/api';
import api from '../lib/api';
import { 
  Store, 
  Clock, 
  MapPin, 
  Phone, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Power,
  ChevronRight
} from 'lucide-react';

export default function Settings() {
  const [cafe, setCafe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchCafe = async () => {
    try {
      const cafes = await getCafes();
      if (cafes && cafes.length > 0) {
        setCafe(cafes[0]);
      }
    } catch (error) {
      console.error('Error fetching cafe:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCafe();
  }, []);

  const handleToggleOpen = async () => {
    if (!cafe) return;
    try {
      setSaving(true);
      const newStatus = !cafe.isOpen;
      await api.patch(`/cafe/${cafe.id}`, { isOpen: newStatus });
      setCafe({ ...cafe, isOpen: newStatus });
      setMessage({ text: `Cafe is now ${newStatus ? 'OPEN' : 'CLOSED'}`, type: 'success' });
      // Dispatch event to update layout header immediately
      window.dispatchEvent(new CustomEvent('cafeStatusUpdated', { detail: { isOpen: newStatus } }));
    } catch (error) {
      setMessage({ text: 'Failed to update cafe status', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <Loader2 className="text-primary/60 animate-spin" size={32} />
      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Loading Settings...</p>
    </div>
  );

  if (!cafe) return (
    <div className="text-center py-20 text-text-muted font-black uppercase tracking-widest">
      No cafe configuration found
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade pb-20">
      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade backdrop-blur-md ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500/80 border border-emerald-500/20' : 'bg-red-500/10 text-red-500/80 border border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Availability Bento Cell */}
        <div className="lg:col-span-4 h-full">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 h-full flex flex-col items-center justify-center text-center space-y-8 group transition-all hover:border-primary/20">
            <div className={`relative w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 ${cafe.isOpen ? 'bg-emerald-500/5 text-emerald-500/80' : 'bg-red-500/5 text-red-500/80'}`}>
              <div className={`absolute inset-0 rounded-[2.5rem] animate-pulse opacity-20 ${cafe.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <Power size={48} className="relative z-10" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-text-cream uppercase tracking-tighter">
                {cafe.isOpen ? 'Active' : 'Offline'}
              </h3>
              <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.3em] leading-relaxed max-w-[150px]">
                Controls store visibility on Customer App
              </p>
            </div>

            <button 
              onClick={handleToggleOpen}
              disabled={saving}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl border ${cafe.isOpen ? 'bg-red-500/10 text-red-500/80 border-red-500/20 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500/80 border-emerald-500/20 hover:bg-emerald-500/20'}`}
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : (cafe.isOpen ? 'Close Cafe Now' : 'Open Cafe Now')}
            </button>
          </div>
        </div>

        {/* Info Bento Cell */}
        <div className="lg:col-span-8">
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 sm:p-10 space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-text-cream uppercase tracking-[0.4em] flex items-center gap-3">
                <Store size={16} className="text-primary/60" /> Store Information
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted ml-1">Official Name</label>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-text-cream/90 font-black tracking-tight text-lg">
                  {cafe.name}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted ml-1">Location Address</label>
                <div className="flex gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <MapPin className="text-primary/40 shrink-0" size={20} />
                  <p className="text-xs font-bold text-text-cream/80 leading-relaxed uppercase tracking-tight italic">
                    {cafe.address}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted ml-1">Support Hotline</label>
                  <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <Phone className="text-primary/40" size={18} />
                    <p className="text-sm font-black text-text-cream/90 tracking-widest">{cafe.phone || 'Not set'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted ml-1">Operating Hours</label>
                  <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <Clock className="text-primary/40" size={18} />
                    <p className="text-sm font-black text-text-cream/90 tracking-tighter italic">
                      {cafe.openTime || '08:00 AM'} - {cafe.closeTime || '10:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <AlertCircle size={20} className="text-primary/60 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest">Read Only Mode</p>
                <p className="text-[9px] font-bold text-primary/50 uppercase tracking-wider leading-relaxed">
                  To modify static profile details (Name, Address, Hours), please contact the technical support team. Only operational status can be toggled manually.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
