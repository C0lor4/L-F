import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import StickyNote from './StickyNote';
import { LostFoundItem, FilterOptions } from '../types';

interface StickyBoardProps {
  items: LostFoundItem[];
  filter: FilterOptions;
  onNoteClick: (item: LostFoundItem) => void;
  onAddClick: () => void;
}

const StickyBoard: React.FC<StickyBoardProps> = ({ 
  items, 
  filter, 
  onNoteClick, 
  onAddClick 
}) => {
  const filteredItems = React.useMemo(() => {
    return items
      .filter(item => {
        if (filter.status !== 'all' && item.status !== filter.status) {
          return false;
        }
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          return (
            item.title.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower) ||
            item.location.toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'date') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return a.title.localeCompare(b.title);
      });
  }, [items, filter]);

  return (
    <div className="relative">
      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddClick}
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-xl mb-2">No items found</p>
          <p className="text-sm">Try adjusting your filters or add a new item</p>
        </div>
      ) : (
        /* Masonry Grid */
        <div className="masonry-grid px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="masonry-item"
              >
                <StickyNote item={item} onClick={() => onNoteClick(item)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default StickyBoard;
