import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, Phone, Tag, Trash2 } from 'lucide-react';
import { LostFoundItem } from '../types';

interface ItemDetailModalProps {
  item: LostFoundItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onClaim?: (payload: { itemId: string; claimLocation: string; claimDate: string }) => Promise<void>;
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

const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ 
  item, 
  isOpen, 
  onClose,
  onDelete,
  onClaim,
}) => {
  const [isClaimOpen, setIsClaimOpen] = React.useState(false);
  const [claimLocation, setClaimLocation] = React.useState('');
  const [claimDate, setClaimDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [claimConfirmed, setClaimConfirmed] = React.useState(false);
  const [isClaimSubmitting, setIsClaimSubmitting] = React.useState(false);
  const [claimError, setClaimError] = React.useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!item || !isOpen) return;
    setIsClaimOpen(false);
    setClaimLocation('');
    setClaimDate(new Date().toISOString().split('T')[0]);
    setClaimConfirmed(false);
    setIsClaimSubmitting(false);
    setClaimError(null);
    setClaimSuccess(null);
  }, [item?.id, isOpen]);

  if (!isOpen || !item) return null;
  const presetColorClass = colorClasses[item.color] || '';
  const customColorStyle = HEX_COLOR_PATTERN.test(item.color) ? { backgroundColor: item.color } : undefined;

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onClaim) return;
    if (!claimLocation.trim() || !claimDate || !claimConfirmed) {
      setClaimError('Please confirm the claim and fill place/date.');
      return;
    }

    const shouldContinue = window.confirm('Please double-check: Do you want to submit this claim?');
    if (!shouldContinue) return;

    setClaimError(null);
    setIsClaimSubmitting(true);
    try {
      await onClaim({
        itemId: item.id,
        claimLocation: claimLocation.trim(),
        claimDate,
      });
      setClaimSuccess('Claim submitted successfully.');
      setIsClaimOpen(false);
      setClaimConfirmed(false);
    } catch (error) {
      setClaimError(error instanceof Error ? error.message : 'Failed to submit claim.');
    } finally {
      setIsClaimSubmitting(false);
    }
  };

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
        className={`${presetColorClass} rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}
        style={customColorStyle}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
                <span
                  className={`mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    item.status === 'lost'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  {item.status === 'lost' ? 'Lost' : 'Found'}
                </span>
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

          {item.status === 'lost' && onClaim && (
            <div className="mt-6 pt-4 border-t border-gray-300/50">
              <button
                type="button"
                onClick={() => {
                  setClaimError(null);
                  setClaimSuccess(null);
                  setIsClaimOpen((prev) => !prev);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                disabled={isClaimSubmitting}
              >
                {isClaimOpen ? 'Cancel Claim' : 'Claim This Item'}
              </button>

              {claimSuccess && (
                <p className="mt-3 text-sm text-green-700">{claimSuccess}</p>
              )}

              {isClaimOpen && (
                <form onSubmit={handleClaimSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Place of claim *
                    </label>
                    <input
                      type="text"
                      value={claimLocation}
                      onChange={(e) => setClaimLocation(e.target.value)}
                      className="form-input"
                      placeholder="e.g., Student Center front desk"
                      required
                      disabled={isClaimSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of claim *
                    </label>
                    <input
                      type="date"
                      value={claimDate}
                      onChange={(e) => setClaimDate(e.target.value)}
                      className="form-input"
                      required
                      disabled={isClaimSubmitting}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={claimConfirmed}
                      onChange={(e) => setClaimConfirmed(e.target.checked)}
                      disabled={isClaimSubmitting}
                    />
                    I double-checked the details and want to submit this claim.
                  </label>
                  {claimError && (
                    <p className="text-sm text-red-600">{claimError}</p>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    disabled={isClaimSubmitting || !claimLocation.trim() || !claimDate || !claimConfirmed}
                  >
                    {isClaimSubmitting ? 'Submitting Claim...' : 'Submit Claim'}
                  </button>
                </form>
              )}
            </div>
          )}

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
