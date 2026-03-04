import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import StickyBoard from '../components/StickyBoard';
import AddNoteForm from '../components/AddNoteForm';
import ItemDetailModal from '../components/ItemDetailModal';
import { LostFoundItem, FilterOptions, ItemStatus } from '../types';

const API_ENDPOINT = '/api/items';
const CLAIM_API_ENDPOINT = '/api/claims';

type Language = 'en' | 'cn';

const Home: React.FC = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [filter, setFilter] = useState<FilterOptions>({
    status: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc',
    showClaimed: true,
  });
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');

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
    setFilter((prev) => ({ ...prev, search: query }));
  };

  const handleFilter = (status: ItemStatus | 'all') => {
    setFilter((prev) => ({ ...prev, status }));
  };

  const handleSortBy = (sortBy: FilterOptions['sortBy']) => {
    setFilter((prev) => ({ ...prev, sortBy }));
  };

  const handleSortOrder = (sortOrder: FilterOptions['sortOrder']) => {
    setFilter((prev) => ({ ...prev, sortOrder }));
  };

  const heroCopy = filter.status === 'lost'
    ? {
      description: language === 'cn'
        ? '\u805a\u7126\u5931\u7269\u4fe1\u606f\uff0c\u5e2e\u52a9\u5931\u4e3b\u66f4\u5feb\u627e\u56de\u7269\u54c1\u3002'
        : 'Focus on items that people lost and help them recover quickly.',
    }
    : filter.status === 'found'
      ? {
        description: language === 'cn'
          ? '\u67e5\u770b\u62db\u9886\u4fe1\u606f\uff0c\u628a\u7269\u54c1\u5c3d\u5feb\u5f52\u8fd8\u7ed9\u5931\u4e3b\u3002'
          : 'Review found items and connect them back to their owners.',
      }
      : {
        description: language === 'cn'
          ? '\u6d4f\u89c8\u5931\u7269\u4e0e\u62db\u9886\u4fe1\u606f\uff0c\u6216\u53d1\u5e03\u4f60\u7684\u7269\u54c1\u3002'
          : 'Browse through lost and found items or add your own.',
      };

  const sortText = language === 'cn'
    ? {
      label: '\u6392\u5e8f',
      time: '\u65f6\u95f4',
      name: '\u540d\u79f0',
      bonus: '\u8d4f\u91d1\u4f18\u5148',
      ascending: '\u5347\u5e8f',
      descending: '\u964d\u5e8f',
      showClaimed: '\u663e\u793a\u5df2\u8ba4\u9886',
    }
    : {
      label: 'Sort by',
      time: 'Time',
      name: 'Name',
      bonus: 'Bonus first',
      ascending: 'Ascending',
      descending: 'Descending',
      showClaimed: 'Show Claimed',
    };

  const handleClaimItem = async (payload: { itemId: string; claimDate: string; claimerNickname?: string }) => {
    const response = await fetch(CLAIM_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json() as { success?: boolean; error?: string };
    if (!response.ok || !data.success) {
      throw new Error(data.error || `Failed to claim item (${response.status})`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header
        onSearch={handleSearch}
        onFilter={handleFilter}
        currentFilter={filter.status}
        language={language}
        onLanguageToggle={() => setLanguage((prev) => (prev === 'en' ? 'cn' : 'en'))}
      />

      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            <span className={filter.status === 'lost' ? 'text-red-600' : 'text-gray-900'}>
              {language === 'cn' ? '\u5931\u7269' : 'Lost'}
            </span>
            <span className="text-gray-900"> & </span>
            <span className={filter.status === 'found' ? 'text-green-600' : 'text-gray-900'}>
              {language === 'cn' ? '\u62db\u9886' : 'Found'}
            </span>
            <span className="text-gray-900">
              {language === 'cn' ? ' \u516c\u544a\u677f' : ' Board'}
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            {heroCopy.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <label className="text-sm font-medium text-gray-700">
              {sortText.label}
            </label>
            <select
              value={filter.sortBy}
              onChange={(e) => handleSortBy(e.target.value as FilterOptions['sortBy'])}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">{sortText.time}</option>
              <option value="title">{sortText.name}</option>
              <option value="bonus">{sortText.bonus}</option>
            </select>
            <button
              type="button"
              onClick={() => handleSortOrder(filter.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
            >
              {filter.sortOrder === 'asc' ? sortText.ascending : sortText.descending}
            </button>
            <button
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, showClaimed: !prev.showClaimed }))}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
              title={sortText.showClaimed}
            >
              <span>{sortText.showClaimed}</span>
              <span
                className={`relative inline-flex w-11 h-6 rounded-full transition-colors overflow-hidden ${
                  filter.showClaimed ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    filter.showClaimed ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </div>
          {isLoading && (
            <p className="mt-2 text-sm text-gray-500">
              {language === 'cn' ? '\u6b63\u5728\u52a0\u8f7d\u7269\u54c1...' : 'Loading items...'}
            </p>
          )}
          {loadError && (
            <p className="mt-2 text-sm text-red-600">
              {language === 'cn' ? '\u52a0\u8f7d\u6700\u65b0\u7269\u54c1\u5931\u8d25\u3002' : loadError}
            </p>
          )}
        </motion.div>
      </div>

      <StickyBoard
        items={items}
        filter={filter}
        onNoteClick={setSelectedItem}
        onAddClick={() => setIsAddFormOpen(true)}
        language={language}
      />

      <AddNoteForm
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSubmit={handleAddItem}
        isSubmitting={isSubmitting}
        submitError={submitError}
        language={language}
      />

      <ItemDetailModal
        item={selectedItem}
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onClaim={handleClaimItem}
        language={language}
      />
    </div>
  );
};

export default Home;
