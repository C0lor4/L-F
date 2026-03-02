import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon } from 'lucide-react';
import { LostFoundItem, ItemStatus, StickyColor } from '../types';

interface AddNoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<LostFoundItem, 'id' | 'createdAt'>) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const colorOptions: { value: StickyColor; label: string; bgClass: string }[] = [
  { value: 'yellow', label: 'Yellow', bgClass: 'bg-sticky-yellow' },
  { value: 'pink', label: 'Pink', bgClass: 'bg-sticky-pink' },
  { value: 'blue', label: 'Blue', bgClass: 'bg-sticky-blue' },
  { value: 'green', label: 'Green', bgClass: 'bg-sticky-green' },
  { value: 'orange', label: 'Orange', bgClass: 'bg-sticky-orange' },
  { value: 'purple', label: 'Purple', bgClass: 'bg-sticky-purple' },
];

const AddNoteForm: React.FC<AddNoteFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<ItemStatus>('lost');
  const [color, setColor] = useState<StickyColor>('yellow');
  const [imageUrl, setImageUrl] = useState('');

  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim() || !contact.trim()) {
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date,
        contact: contact.trim(),
        status,
        color,
        imageUrl: imageUrl.trim() || undefined,
      });
    } catch {
      return;
    }

    // Reset form
    setTitle('');
    setDescription('');
    setLocation('');
    setContact('');
    setImageUrl('');
    setStatus('lost');
    setColor('yellow');
    setHoneypot('');
    onClose();
  };

  if (!isOpen) return null;

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
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Item</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="e.g., Blue backpack with books"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="form-input"
                placeholder="Describe the item in detail..."
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
                placeholder="e.g., Library, 2nd floor"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="form-input"
                disabled={isSubmitting}
              />
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Information *
              </label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="form-input"
                placeholder="e.g., email@example.com or phone number"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="lost"
                    checked={status === 'lost'}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className="mr-2"
                    disabled={isSubmitting}
                  />
                  <span>Lost</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="found"
                    checked={status === 'found'}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className="mr-2"
                    disabled={isSubmitting}
                  />
                  <span>Found</span>
                </label>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Color
              </label>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColor(option.value)}
                    className={`w-12 h-12 rounded-lg ${option.bgClass} border-2 transition-transform hover:scale-110 ${
                      color === option.value ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    title={option.label}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="form-input pr-10"
                  placeholder="https://example.com/image.jpg"
                  disabled={isSubmitting}
                />
                <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Honeypot (anti-bot) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {submitError && (
              <p className="text-sm text-red-600">{submitError}</p>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                disabled={isSubmitting || !title.trim() || !description.trim() || !location.trim() || !contact.trim() || honeypot.trim().length > 0}
              >
                {isSubmitting ? 'Submitting...' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddNoteForm;
