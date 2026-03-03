import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Phone, Tag } from 'lucide-react';
import { LostFoundItem } from '../types';

interface StickyNoteProps {
  item: LostFoundItem;
  onClick: () => void;
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

const StickyNote: React.FC<StickyNoteProps> = ({ item, onClick }) => {
  const randomRotation = rotation[Math.floor(Math.random() * rotation.length)];
  const presetColorClass = colorClasses[item.color] || '';
  const customColorStyle = HEX_COLOR_PATTERN.test(item.color) ? { backgroundColor: item.color } : undefined;

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
      <div className="sticky-pin" />

      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 pr-2">
          {item.title}
        </h3>
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${
            item.status === 'lost'
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          <Tag className="w-3 h-3" />
          {item.status === 'lost' ? 'Lost' : 'Found'}
        </span>
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-3">
        {item.description}
      </p>

      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{item.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(item.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5" />
          <span className="truncate">{item.contact}</span>
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
