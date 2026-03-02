import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import StickyBoard from '../components/StickyBoard';
import AddNoteForm from '../components/AddNoteForm';
import ItemDetailModal from '../components/ItemDetailModal';
import { LostFoundItem, FilterOptions, ItemStatus } from '../types';

const API_ENDPOINT = '/api/items';

const Home: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filter, setFilter] = useState<FilterOptions>({
    status: 'all',
    search: '',
    sortBy: 'date',
  });
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoadError(null);
    try {
      const response = await fetch(API_ENDPOINT, { method: 'GET' });
      if (!response.ok) {
        throw new Error(`Failed to load items (${response.status})`);
      }
      const data = await response.json() as { items: LostFoundItem[] };
      setItems(data.items);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setLoadError('Failed to load latest items from server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchItems();
  }, []);

  const handleAddItem = async (newItem: Omit<LostFoundItem, 'id' | 'createdAt'>) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });
      const data = await response.json() as { item?: LostFoundItem; error?: string };
      if (!response.ok || !data.item) {
        throw new Error(data.error || `Failed to submit item (${response.status})`);
      }
      setItems((prev) => [data.item!, ...prev]);
      setIsAddFormOpen(false);
    } catch (error) {
      console.error('Failed to submit item:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit item.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
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
          {isLoading && (
            <p className="mt-2 text-sm text-gray-500">Loading items...</p>
          )}
          {loadError && (
            <p className="mt-2 text-sm text-red-600">{loadError}</p>
          )}
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
        isSubmitting={isSubmitting}
        submitError={submitError}
      />

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default Home;
