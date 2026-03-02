import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, Phone, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { LostFoundItem } from '../types';

interface ItemDetailModalProps {
  item: LostFoundItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

const colorClasses = {
  yellow: 'bg-sticky-yellow',
  pink: 'bg-sticky-pink',
  blue: 'bg-sticky-blue',
  green: 'bg-sticky-green',
  orange: 'bg-sticky-orange',
  purple: 'bg-sticky-purple',
};

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ 
  item, 
  isOpen, 
  onClose,
  onDelete 
}) => {
  if (!isOpen || !item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`${colorClasses[item.color]} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              {item.status === 'lost' ? (
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
                <span className="text-sm text-gray-600 capitalize">{item.status}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this item?')) {
                      onDelete(item.id);
                    }
                  }}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  title="Delete item"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Image */}
          {item.imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden shadow-md">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-gray-700">{item.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date</p>
                <p className="text-gray-700">{new Date(item.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Contact</p>
                <p className="text-gray-700">{item.contact}</p>
              </div>
            </div>
          </div>

          {/* Posted Date */}
          <div className="mt-6 pt-4 border-t border-gray-300/50">
            <p className="text-xs text-gray-600">
              Posted on {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ItemDetailModal;
