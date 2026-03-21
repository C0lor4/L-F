import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Tag, Gift } from 'lucide-react';
import { LostFoundItem } from '../types';

type Language = 'en' | 'cn';

interface StickyNoteProps {
  item: LostFoundItem;
  onClick: () => void;
  language: Language;
  searchQuery?: string;
}

const colorClasses: Record<string, string> = {
  yellow: 'bg-sticky-yellow',
  pink: 'bg-sticky-pink',
  blue: 'bg-sticky-blue',
  green: 'bg-sticky-green',
  orange: 'bg-sticky-orange',
  purple: 'bg-sticky-purple',
};
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

const rotation = ['-2deg', '1deg', '-1deg', '2deg', '-3deg', '3deg'];

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getCustomHighlightStyle = (hexColor: string): React.CSSProperties => {
  const r = Number.parseInt(hexColor.slice(1, 3), 16);
  const g = Number.parseInt(hexColor.slice(3, 5), 16);
  const b = Number.parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (luminance > 0.75) {
    return {
      backgroundColor: 'rgba(251, 191, 36, 0.8)',
      color: '#111827',
      boxShadow: 'inset 0 0 0 1px rgba(180, 83, 9, 0.5)',
    };
  }
  if (luminance > 0.5) {
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
      color: '#111827',
      boxShadow: 'inset 0 0 0 1px rgba(55, 65, 81, 0.45)',
    };
  }
  return {
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    color: '#111827',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.55)',
  };
};

const StickyNote: React.FC<StickyNoteProps> = ({ item, onClick, language, searchQuery = '' }) => {
  const randomRotation = rotation[Math.floor(Math.random() * rotation.length)];
  const presetColorClass = colorClasses[item.color] || '';
  const customColorStyle = HEX_COLOR_PATTERN.test(item.color) ? { backgroundColor: item.color } : undefined;
  const presetHighlightClass: Record<string, string> = {
    yellow: 'bg-sky-200/90 text-gray-900 ring-1 ring-sky-500/70',
    pink: 'bg-amber-200/90 text-gray-900 ring-1 ring-amber-500/70',
    blue: 'bg-amber-200/95 text-gray-900 ring-1 ring-amber-500/80',
    green: 'bg-amber-200/95 text-gray-900 ring-1 ring-amber-500/80',
    orange: 'bg-sky-200/90 text-gray-900 ring-1 ring-sky-500/70',
    purple: 'bg-amber-100/95 text-gray-900 ring-1 ring-amber-500/75',
  };
  const highlightClassName = `rounded-sm px-0.5 py-0 font-semibold ${presetHighlightClass[item.color] || 'bg-amber-200/95 text-gray-900 ring-1 ring-amber-500/80'}`;
  const customHighlightStyle = HEX_COLOR_PATTERN.test(item.color) ? getCustomHighlightStyle(item.color) : undefined;
  const queryTokens = searchQuery
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const highlightRegex = queryTokens.length > 0
    ? new RegExp(`(${queryTokens.map((token) => escapeRegExp(token)).join('|')})`, 'ig')
    : null;

  const renderHighlighted = (value: string): React.ReactNode => {
    if (!highlightRegex || !value) return value;
    const parts = value.split(highlightRegex);
    return parts.map((part, index) => {
      if (!part) return null;
      if (queryTokens.some((token) => token.toLowerCase() === part.toLowerCase())) {
        return (
          <mark
            key={`${part}-${index}`}
            className={highlightClassName}
            style={customHighlightStyle}
          >
            {part}
          </mark>
        );
      }
      return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
    });
  };

  const text = language === 'cn'
    ? {
      claimed: '\u5df2\u8ba4\u9886',
      lost: '\u5931\u7269',
      found: '\u62db\u9886',
      reward: '\u8d4f\u91d1',
    }
    : {
      claimed: 'Claimed',
      lost: 'Lost',
      found: 'Found',
      reward: 'Reward',
    };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: randomRotation }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0,
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
      }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`sticky-note ${presetColorClass} p-6 rounded-lg shadow-sticky relative min-h-[200px]`}
      style={customColorStyle}
    >
      <div className="sticky-pin" aria-hidden="true">
        <span className="pin-head pin-head-top" />
        <span className="pin-stem" />
        <span className="pin-head pin-head-bottom" />
      </div>
      {item.claimed && (
        <span className="absolute -top-3 right-3 z-20 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold shadow">
          {text.claimed}
        </span>
      )}

      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 pr-2">
          {renderHighlighted(item.title)}
        </h3>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${
            item.status === 'lost'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          <Tag className="w-3 h-3" />
          {item.status === 'lost' ? text.lost : text.found}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-3">
        {renderHighlighted(item.description)}
      </p>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{renderHighlighted(item.location)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(item.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Gift className="w-3.5 h-3.5" />
          <span className="truncate">
            {text.reward}: {renderHighlighted(item.bonusPrice?.trim() || '0')}
          </span>
        </div>
      </div>

      {item.imageUrl && (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-32 object-cover"
          />
        </div>
      )}
    </motion.div>
  );
};

export default StickyNote;
