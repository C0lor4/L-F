import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

const predefinedColors = [
  '#fef08a', // yellow
  '#fbcfe8', // pink
  '#bfdbfe', // blue
  '#bbf7d0', // green
  '#fed7aa', // orange
  '#ddd6fe', // purple
  '#fca5a5', // red
  '#fcd34d', // amber
  '#a3e635', // lime
  '#67e8f9', // cyan
  '#c4b5fd', // violet
  '#fda4af', // rose
];

const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange, onClose }) => {
  const [customColor, setCustomColor] = useState(value);

  const handleColorClick = (color: string) => {
    onChange(color);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute z-50 bg-white rounded-xl shadow-2xl p-4 border border-gray-200"
      style={{ minWidth: '280px' }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select a color</h3>
        <div className="grid grid-cols-4 gap-2">
          {predefinedColors.map((color) => (
            <motion.button
              key={color}
              type="button"
              onClick={() => handleColorClick(color)}
              className={`w-12 h-12 rounded-full border-2 transition-transform hover:scale-110 ${
                value === color ? 'border-gray-900 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              title={color}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Custom color</h3>
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={() => handleColorClick(customColor)}
            className={`w-12 h-12 rounded-full border-2 transition-transform hover:scale-110 ${
              value === customColor ? 'border-gray-900 scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: customColor }}
            title={customColor}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                const newColor = e.target.value;
                if (/^#[0-9a-fA-F]{6}$/.test(newColor)) {
                  setCustomColor(newColor);
                  onChange(newColor);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              placeholder="#RRGGBB"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ColorPicker;
