import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import StickyNote from './StickyNote';
import { LostFoundItem, FilterOptions } from '../types';

type Language = 'en' | 'cn';

interface StickyBoardProps {
  items: LostFoundItem[];
  filter: FilterOptions;
  onNoteClick: (item: LostFoundItem) => void;
  onAddClick: () => void;
  language: Language;
}

const StickyBoard: React.FC<StickyBoardProps> = ({
  items,
  filter,
  onNoteClick,
  onAddClick,
  language,
}) => {
  const text = language === 'cn'
    ? {
      noItems: '\u6682\u65e0\u7269\u54c1',
      hint: '\u8bf7\u8c03\u6574\u7b5b\u9009\u6761\u4ef6\uff0c\u6216\u53d1\u5e03\u4e00\u4e2a\u65b0\u7269\u54c1',
    }
    : {
      noItems: 'No items found',
      hint: 'Try adjusting your filters or add a new item',
    };

  const filteredItems = React.useMemo(() => {
    return items
      .filter((item) => {
        if (filter.status !== 'all' && item.status !== filter.status) {
          return false;
        }
        if (!filter.showClaimed && item.claimed) {
          return false;
        }
        if (filter.search) {
          const searchLower = filter.search.toLowerCase();
          return (
            item.title.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower) ||
            item.location.toLowerCase().includes(searchLower) ||
            item.contact.toLowerCase().includes(searchLower) ||
            (item.bonusPrice || '').toLowerCase().includes(searchLower)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (filter.sortBy === 'date') {
          const delta = new Date(a.date).getTime() - new Date(b.date).getTime();
          return filter.sortOrder === 'asc' ? delta : -delta;
        }

        if (filter.sortBy === 'title') {
          const delta = a.title.localeCompare(b.title);
          return filter.sortOrder === 'asc' ? delta : -delta;
        }
        return 0;
      });
  }, [items, filter]);

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddClick}
        className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-xl mb-2">{text.noItems}</p>
          <p className="text-sm">{text.hint}</p>
        </div>
      ) : (
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
                <StickyNote
                  item={item}
                  onClick={() => onNoteClick(item)}
                  language={language}
                  searchQuery={filter.search}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default StickyBoard;
