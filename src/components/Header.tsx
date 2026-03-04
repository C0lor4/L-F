import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { ItemStatus } from '../types';

type Language = 'en' | 'cn';

interface HeaderProps {
  onSearch: (query: string) => void;
  onFilter: (status: ItemStatus | 'all') => void;
  currentFilter: ItemStatus | 'all';
  language: Language;
  onLanguageToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  onFilter,
  currentFilter,
  language,
  onLanguageToggle,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const desktopSearchWrapRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchPanelRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchTriggerRef = useRef<HTMLButtonElement | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);

  const text = language === 'cn'
    ? {
      brand: 'Lost & Found',
      allItems: '\u5168\u90e8',
      lost: '\u5931\u7269',
      found: '\u62db\u9886',
      search: '\u641c\u7d22\u7269\u54c1...',
    }
    : {
      brand: 'Lost & Found',
      allItems: 'All Items',
      lost: 'Lost',
      found: 'Found',
      search: 'Search items...',
    };

  useEffect(() => {
    if (isSearchOpen) {
      requestAnimationFrame(() => {
        const desktopInput = desktopSearchInputRef.current;
        const mobileInput = mobileSearchInputRef.current;
        if (desktopInput && desktopInput.offsetParent !== null) {
          desktopInput.focus();
          return;
        }
        if (mobileInput && mobileInput.offsetParent !== null) {
          mobileInput.focus();
        }
      });
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const handleDocumentPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const inDesktop = desktopSearchWrapRef.current?.contains(target);
      const inMobilePanel = mobileSearchPanelRef.current?.contains(target);
      const inMobileTrigger = mobileSearchTriggerRef.current?.contains(target);
      if (!inDesktop && !inMobilePanel && !inMobileTrigger) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentPointerDown);
    return () => {
      document.removeEventListener('mousedown', handleDocumentPointerDown);
    };
  }, [isSearchOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const toggleSearch = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      return;
    }
    setIsSearchOpen(true);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative flex items-center">
          <div className="flex items-center gap-2 min-w-[170px]">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-8 h-8 object-contain shrink-0"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
              {text.brand}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <button
              onClick={() => onFilter('all')}
              className={`text-sm font-medium transition-colors ${
                currentFilter === 'all' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {text.allItems}
            </button>
            <button
              onClick={() => onFilter('lost')}
              className={`text-sm font-medium transition-colors ${
                currentFilter === 'lost' ? 'text-red-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {text.lost}
            </button>
            <button
              onClick={() => onFilter('found')}
              className={`text-sm font-medium transition-colors ${
                currentFilter === 'found' ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {text.found}
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 ml-auto">
            <div
              ref={desktopSearchWrapRef}
              className={`relative h-10 rounded-full border border-gray-300 bg-white overflow-hidden transition-[width] duration-300 ${
                isSearchOpen ? 'w-72' : 'w-10'
              }`}
            >
              <button
                type="button"
                onClick={toggleSearch}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 p-0 leading-none text-gray-500 hover:text-gray-700 flex items-center justify-center"
                aria-label="Toggle search"
              >
                <Search className="block w-5 h-5" />
              </button>
              <input
                ref={desktopSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder={text.search}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                  }
                }}
                className={`h-full w-full bg-transparent pl-10 pr-3 text-sm outline-none transition-opacity duration-200 ${
                  isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={onLanguageToggle}
              className="px-3 py-2 text-sm font-semibold border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
              title="Toggle language"
            >
              {language === 'en' ? 'EN' : 'CN'}
            </button>
          </div>

          <div className="md:hidden ml-auto flex items-center gap-2">
            <button
              ref={mobileSearchTriggerRef}
              type="button"
              onClick={toggleSearch}
              className="w-10 h-10 p-0 leading-none border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              aria-label="Toggle search"
            >
              <Search className="block w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isSearchOpen && (
          <div ref={mobileSearchPanelRef} className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder={text.search}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3 pt-4">
              <button
                type="button"
                onClick={onLanguageToggle}
                className="self-start w-auto px-4 py-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 border border-gray-200"
              >
                {language === 'en' ? 'EN' : 'CN'}
              </button>
              <button
                onClick={() => {
                  onFilter('all');
                  setIsMenuOpen(false);
                }}
                className={`text-left px-4 py-2 rounded-lg transition-colors ${
                  currentFilter === 'all' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {text.allItems}
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
                {text.lost}
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
                {text.found}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
