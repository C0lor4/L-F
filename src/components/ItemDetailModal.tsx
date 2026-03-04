import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Calendar, Phone, Tag, Trash2, Gift } from 'lucide-react';
import { LostFoundItem } from '../types';

type Language = 'en' | 'cn';

interface ItemDetailModalProps {
  item: LostFoundItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onClaim?: (payload: { itemId: string; claimDate: string; claimerNickname?: string }) => Promise<void>;
  language: Language;
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
  language,
}) => {
  const [isClaimOpen, setIsClaimOpen] = React.useState(false);
  const [claimDate, setClaimDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [claimerNickname, setClaimerNickname] = React.useState('');
  const [isClaimSubmitting, setIsClaimSubmitting] = React.useState(false);
  const [claimError, setClaimError] = React.useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!item || !isOpen) return;
    setIsClaimOpen(false);
    setClaimDate(new Date().toISOString().split('T')[0]);
    setClaimerNickname('');
    setIsClaimSubmitting(false);
    setClaimError(null);
    setClaimSuccess(null);
  }, [item?.id, isOpen]);

  if (!isOpen || !item) return null;
  const presetColorClass = colorClasses[item.color] || '';
  const customColorStyle = HEX_COLOR_PATTERN.test(item.color) ? { backgroundColor: item.color } : undefined;
  const text = language === 'cn'
    ? {
      lost: '\u5931\u7269',
      found: '\u62db\u9886',
      deleteConfirm: '\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u6761\u4fe1\u606f\u5417\uff1f',
      deleteItem: '\u5220\u9664\u7269\u54c1',
      description: '\u63cf\u8ff0',
      location: '\u5730\u70b9',
      date: '\u65e5\u671f',
      contact: '\u8054\u7cfb\u65b9\u5f0f',
      reward: '\u8d4f\u91d1',
      anonymous: '\u533f\u540d',
      cancelClaim: '\u53d6\u6d88\u8ba4\u9886',
      claimItem: '\u8ba4\u9886\u8fd9\u4e2a\u7269\u54c1',
      claimSuccess: '\u8ba4\u9886\u63d0\u4ea4\u6210\u529f\u3002',
      claimNickname: '\u8ba4\u9886\u6635\u79f0\uff08\u53ef\u9009\uff09',
      claimNicknamePlaceholder: '\u4f8b\u5982\uff1aAlex',
      claimDateRequired: '\u8ba4\u9886\u65e5\u671f *',
      submittingClaim: '\u63d0\u4ea4\u8ba4\u9886\u4e2d...',
      submitClaim: '\u63d0\u4ea4\u8ba4\u9886',
      fillClaimDate: '\u8bf7\u586b\u5199\u8ba4\u9886\u65e5\u671f\u3002',
      submitClaimFailed: '\u63d0\u4ea4\u8ba4\u9886\u5931\u8d25\u3002',
      postedOn: '\u53d1\u5e03\u4e8e',
    }
    : {
      lost: 'Lost',
      found: 'Found',
      deleteConfirm: 'Are you sure you want to delete this item?',
      deleteItem: 'Delete item',
      description: 'Description',
      location: 'Location',
      date: 'Date',
      contact: 'Contact',
      reward: 'Reward',
      anonymous: 'Anonymous',
      cancelClaim: 'Cancel Claim',
      claimItem: 'Claim This Item',
      claimSuccess: 'Claim submitted successfully.',
      claimNickname: 'Claimed by nickname (optional)',
      claimNicknamePlaceholder: 'e.g., Alex',
      claimDateRequired: 'Date of claim *',
      submittingClaim: 'Submitting Claim...',
      submitClaim: 'Submit Claim',
      fillClaimDate: 'Please fill claim date.',
      submitClaimFailed: 'Failed to submit claim.',
      postedOn: 'Posted on',
    };
  const contactDisplay = item.contact.trim().toLowerCase() === 'anonymous'
    ? text.anonymous
    : item.contact;

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onClaim) return;
    if (!claimDate) {
      setClaimError(text.fillClaimDate);
      return;
    }

    setClaimError(null);
    setIsClaimSubmitting(true);
    try {
      await onClaim({
        itemId: item.id,
        claimDate,
        claimerNickname: claimerNickname.trim() || undefined,
      });
      setClaimSuccess(text.claimSuccess);
      setIsClaimOpen(false);
    } catch (error) {
      setClaimError(error instanceof Error ? error.message : text.submitClaimFailed);
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
                  {item.status === 'lost' ? text.lost : text.found}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm(text.deleteConfirm)) {
                      onDelete(item.id);
                    }
                  }}
                  className="p-2 hover:bg-red-100 rounded-full transition-colors"
                  title={text.deleteItem}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{text.description}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{text.location}</p>
                <p className="text-gray-700">{item.location}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{text.date}</p>
                <p className="text-gray-700">{new Date(item.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">{text.contact}</p>
                <p className="text-gray-700">{contactDisplay}</p>
              </div>
            </div>

            {item.status === 'lost' && item.bonusPrice && (
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{text.reward}</p>
                  <p className="text-gray-700">{item.bonusPrice}</p>
                </div>
              </div>
            )}
          </div>

          {onClaim && (
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
                {isClaimOpen ? text.cancelClaim : text.claimItem}
              </button>

              {claimSuccess && (
                <p className="mt-3 text-sm text-green-700">{claimSuccess}</p>
              )}

              {isClaimOpen && (
                <form onSubmit={handleClaimSubmit} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {text.claimNickname}
                    </label>
                    <input
                      type="text"
                      value={claimerNickname}
                      onChange={(e) => setClaimerNickname(e.target.value)}
                      className="form-input"
                      placeholder={text.claimNicknamePlaceholder}
                      disabled={isClaimSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {text.claimDateRequired}
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
                  {claimError && (
                    <p className="text-sm text-red-600">{claimError}</p>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-60"
                    disabled={isClaimSubmitting || !claimDate}
                  >
                    {isClaimSubmitting ? text.submittingClaim : text.submitClaim}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Posted Date */}
          <div className="mt-6 pt-4 border-t border-gray-300/50">
            <p className="text-xs text-gray-600">
              {text.postedOn} {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ItemDetailModal;
