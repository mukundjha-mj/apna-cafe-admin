import { useEffect, useState } from 'react';
import { getMenuItems, getCafes } from '../lib/api';
import api from '../lib/api';
import {
  Search,
  Plus,
  Filter,
  Edit3,
  Leaf,
  ChevronDown
} from 'lucide-react';
import EditItemModal from '../components/EditItemModal';
import AddItemModal from '../components/AddItemModal';

export default function MenuManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [cafeId, setCafeId] = useState<string | null>(null);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const cafes = await getCafes();
      if (cafes && cafes.length > 0) {
        const id = cafes[0].id;
        setCafeId(id);
        const data = await getMenuItems(id);
        // Filter by current cafe if needed, though getMenuItems might already be doing it or need a param
        const cafeItems = data.filter((item: any) => item.cafeId === id);
        setItems(cafeItems);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const categories = ['all', ...new Set(items.map(item => item.category))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getItemImage = (item: any) => {
    return item?.imageUrl || '/assets/img-placeholder.svg';
  };

  const handleAddItem = async (newItem: any) => {
    try {
      setLoading(true);
      await api.post('/menu', { ...newItem, cafeId });
      await fetchMenu();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Add item failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade pb-20">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 flex-1 w-full">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary/60 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search dishes..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-text-cream focus:border-primary/40 outline-none transition-all shadow-lg font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative group min-w-[160px] w-full md:w-auto">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-hover:text-primary/60 transition-colors" size={16} />
            <select
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-11 pr-10 text-xs text-text-cream focus:border-primary/40 outline-none transition-all shadow-lg appearance-none capitalize cursor-pointer font-black uppercase tracking-widest"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-bg-card">{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={16} />
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary/10 hover:bg-primary/20 text-primary/80 border border-primary/20 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 w-full md:w-auto justify-center"
        >
          <Plus size={16} />
          Add Dish
        </button>
      </div>

      {/* Categories Bar */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border ${filterCategory === category
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                : 'bg-white/5 text-text-muted border-white/5 hover:bg-white/10 hover:text-text-cream'
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Dishes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton-loading h-48 border border-white/5 rounded-[2.5rem]"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`card-premium relative transition-all duration-300 p-2.5 sm:p-5 cursor-pointer ${!item.isAvailable ? 'grayscale opacity-80' : 'hover:shadow-2xl hover:border-primary/20'}`}
              onClick={() => { setEditItem(item); setIsEditOpen(true); }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') { setEditItem(item); setIsEditOpen(true); } }}
            >
              <div className="flex flex-col gap-2 sm:gap-3">
                {/* Image */}
                <div className="w-full aspect-square sm:aspect-[4/3] rounded-lg sm:rounded-2xl overflow-hidden bg-bg-accent border border-white/5">
                  <img
                    src={getItemImage(item)}
                    alt={item.name}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/assets/img-placeholder.svg'; }}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name + Edit */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold sm:font-black text-text-cream text-xs sm:text-lg leading-tight tracking-tight line-clamp-2">
                    {item.name}
                  </h3>
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditItem(item); setIsEditOpen(true); }}
                    className="p-1.5 sm:p-2 rounded-md border border-white/5 text-text-muted hover:text-primary hover:bg-primary/10"
                    aria-label="Edit item"
                  >
                    <Edit3 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {item.isVeg && (
                <div className="absolute left-2.5 sm:left-4 top-2.5 sm:top-4 p-0.5 sm:p-1 bg-white/10 backdrop-blur-md rounded-md sm:rounded-lg">
                  <Leaf size={10} className="sm:w-3 sm:h-3 text-success fill-success/20" />
                </div>
              )}
              {!item.isAvailable && (
                <div className="absolute right-2.5 sm:right-4 top-2.5 sm:top-4">
                  <span className="bg-red-500 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg">Sold Out</span>
                </div>
              )}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-full card-premium py-20 text-center">
              <Search size={48} className="text-text-muted opacity-20 mx-auto mb-4" />
              <p className="text-text-muted font-bold uppercase text-[10px] tracking-widest">No dishes found matching your search</p>
              <button onClick={() => { setSearchTerm(''); setFilterCategory('all'); }} className="mt-4 text-primary text-xs font-black uppercase tracking-widest hover:underline">Reset Filters</button>
            </div>
          )}
        </div>
      )}

      <EditItemModal 
        item={editItem} 
        open={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        onSaved={() => fetchMenu()} 
        imageSrc={editItem ? getItemImage(editItem) : '/assets/img-placeholder.svg'} 
      />

      <AddItemModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddItem}
      />
    </div>
  );
}
