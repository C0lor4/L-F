import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import StickyBoard from '../components/StickyBoard';
import AddNoteForm from '../components/AddNoteForm';
import ItemDetailModal from '../components/ItemDetailModal';
import { LostFoundItem, FilterOptions, ItemStatus } from '../types';

// Sample initial data
const initialItems: LostFoundItem[] = [
  {
    id: '1',
    title: 'Blue Backpack with Books',
    description: 'A blue Jansport backpack containing several textbooks and a laptop. Found near the library entrance.',
    location: 'Library, Main Entrance',
    date: '2024-01-15',
    contact: 'email@example.com',
    status: 'found',
    color: 'blue',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Black Water Bottle',
    description: 'Lost my black Hydro Flask water bottle with stickers on it. Last seen in the cafeteria.',
    location: 'Cafeteria',
    date: '2024-01-14',
    contact: '555-1234',
    status: 'lost',
    color: 'black',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'iPhone 13 Case',
    description: 'Found a clear iPhone 13 case with a pop socket. It has some wear and tear but is in good condition.',
    location: 'Gym Locker Room',
    date: '2024-01-13',
    contact: 'found-items@school.edu',
    status: 'found',
    color: 'pink',
    createdAt: new Date().toISOString(),
  },
];

const Home: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filter, setFilter] = useState<FilterOptions>({
    status: 'all',
    search: '',
    sortBy: 'date',
  });
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);

  // Load items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('lostFoundItems');
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (error) {
        console.error('Failed to parse saved items:', error);
        setItems(initialItems);
      }
    } else {
      setItems(initialItems);
    }
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lostFoundItems', JSON.stringify(items));
  }, [items]);

  const handleAddItem = (newItem: Omit<LostFoundItem, 'id' | 'createdAt'>) => {
    const item: LostFoundItem = {
      ...newItem,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setItems([item, ...items]);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    setSelectedItem(null);
  };

  const handleSearch = (query: string) => {
    setFilter(prev => ({ ...prev, search: query }));
  };

  const handleFilter = (status: ItemStatus | 'all') => {
    setFilter(prev => ({ ...prev, status }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        onSearch={handleSearch} 
        onFilter={handleFilter} 
        currentFilter={filter.status}
      />

      {/* Hero Section */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Lost & Found Board
          </h1>
          <p className="text-lg text-gray-600">
            Browse through lost and found items or add your own
          </p>
        </motion.div>
      </div>

      {/* Sticky Notes Board */}
      <StickyBoard
        items={items}
        filter={filter}
        onNoteClick={setSelectedItem}
        onAddClick={() => setIsAddFormOpen(true)}
      />

      {/* Add Item Modal */}
      <AddNoteForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSubmit={handleAddItem}
      />

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};

export default Home;
