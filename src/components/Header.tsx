import React, { useState } from 'react';
import { Menu, X, Search, Filter } from 'lucide-react';
import { ItemStatus } from '../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  onFilter: (status: ItemStatus | 'all') => void;
  currentFilter: ItemStatus | 'all';
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onFilter, 
  currentFilter 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L&F</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Lost & Found
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onFilter('all')}
              className={`text-sm font-medium transition-colors ${
                currentFilter === 'all' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => onFilter('lost')}
              className={`text-sm font-medium transition-colors ${
                currentFilter === 'lost' ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lost
            </button>
            <button
              onClick={() => onFilter('found')}
              className={`text-sm font-medium transition-colors ${
                currentFilter === 'found' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Found
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search items..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pt-4">
              <button
                onClick={() => {
                  onFilter('all');
                  setIsMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-colors ${
                  currentFilter === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Items
              </button>
              <button
                onClick={() => {
                  onFilter('lost');
                  setIsMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-colors ${
                  currentFilter === 'lost' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Lost
              </button>
              <button
                onClick={() => {
                  onFilter('found');
                  setIsMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-colors ${
                  currentFilter === 'found' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Found
              </button>

              {/* Mobile Search */}
              <div className="relative px-4">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
