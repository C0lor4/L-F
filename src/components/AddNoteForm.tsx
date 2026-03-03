import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Upload } from 'lucide-react';
import { LostFoundItem, ItemStatus, StickyColor } from '../types';

interface AddNoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<LostFoundItem, 'id' | 'createdAt'>) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: string | null;
}

const colorOptions: { value: StickyColor; label: string; previewColor: string }[] = [
  { value: 'yellow', label: 'Yellow', previewColor: '#fef08a' },
  { value: 'pink', label: 'Pink', previewColor: '#fbcfe8' },
  { value: 'blue', label: 'Blue', previewColor: '#bfdbfe' },
  { value: 'green', label: 'Green', previewColor: '#bbf7d0' },
  { value: 'orange', label: 'Orange', previewColor: '#fed7aa' },
  { value: 'purple', label: 'Purple', previewColor: '#ddd6fe' },
];

const MAX_IMAGE_FILE_SIZE = 1_500_000;
const DEFAULT_CUSTOM_COLOR = '#facc15';
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [status, setStatus] = useState<ItemStatus>('lost');
  const [color, setColor] = useState<StickyColor>('yellow');
  const [customColor, setCustomColor] = useState(DEFAULT_CUSTOM_COLOR);
  const customColorInputRef = React.useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);

  const [honeypot, setHoneypot] = useState('');

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Unsupported file format.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setImageError('Image must be smaller than 1.5MB.');
      e.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageUrl(dataUrl);
      setImageError(null);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Failed to process image.');
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedContact = isAnonymous ? 'Anonymous' : contact.trim();
    if (!title.trim() || !location.trim() || !normalizedContact) {
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        date,
        contact: normalizedContact,
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
    setIsAnonymous(false);
    setImageUrl('');
    setImageError(null);
    setStatus('lost');
    setColor('yellow');
    setCustomColor(DEFAULT_CUSTOM_COLOR);
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What do you want to post?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('lost')}
                  className={`text-left rounded-lg border p-3 transition-colors ${
                    status === 'lost'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isSubmitting}
                >
                  <p className="font-semibold text-gray-900">Lost item</p>
                  <p className="text-xs text-gray-600 mt-1">
                    People should contact you if they find it.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('found')}
                  className={`text-left rounded-lg border p-3 transition-colors ${
                    status === 'found'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  disabled={isSubmitting}
                >
                  <p className="font-semibold text-gray-900">Found item</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Share where you put the item for pickup.
                  </p>
                </button>
              </div>
            </div>

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
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="form-input"
                placeholder="Describe the item in detail..."
                disabled={isSubmitting}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {status === 'lost' ? 'Where did you lose it? *' : 'Where did you place it? *'}
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
                {status === 'lost' ? 'Your Contact Information *' : 'Your Contact Information (for owner) *'}
              </label>
              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => setIsAnonymous((prev) => !prev)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    isAnonymous
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                  }`}
                  disabled={isSubmitting}
                >
                  {isAnonymous ? 'Anonymous enabled' : 'Choose to stay anonymous'}
                </button>
              </div>
              <input
                type="text"
                value={isAnonymous ? 'Anonymous' : contact}
                onChange={(e) => setContact(e.target.value)}
                className="form-input"
                placeholder="e.g., email@example.com or phone number"
                required={!isAnonymous}
                disabled={isSubmitting || isAnonymous}
              />
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
                    onClick={() => {
                      setColor(option.value);
                    }}
                    className={`w-12 h-12 rounded-full border-2 transition-transform hover:scale-110 ${
                      color === option.value ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: option.previewColor }}
                    title={option.label}
                    disabled={isSubmitting}
                  />
                ))}

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      const nextColor = HEX_COLOR_PATTERN.test(color) ? color : customColor;
                      setColor(nextColor);
                      customColorInputRef.current?.click();
                    }}
                    className={`relative w-12 h-12 rounded-full border-2 transition-transform hover:scale-110 ${
                      HEX_COLOR_PATTERN.test(color) ? 'border-gray-900 scale-110' : 'border-transparent'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${customColor} 0%, #f472b6 35%, #60a5fa 65%, #34d399 100%)`,
                    }}
                    title="Custom color"
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">Custom color</span>
                  </button>

                  <input
                    ref={customColorInputRef}
                    type="color"
                    value={HEX_COLOR_PATTERN.test(color) ? color : customColor}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setCustomColor(selected);
                      setColor(selected);
                    }}
                    className="sr-only"
                    disabled={isSubmitting}
                    aria-label="Pick custom color"
                  />
                </div>
              </div>
              {HEX_COLOR_PATTERN.test(color) && (
                <p className="mt-2 text-xs text-gray-600">
                  Custom color selected: {color}
                </p>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Image (optional)
              </label>
              <div className="border border-gray-300 rounded-lg p-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Choose image from device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">
                  Works on phone and computer. Max size: 1.5MB.
                </p>

                {imageUrl && (
                  <div className="mt-3">
                    <div className="relative rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
                        disabled={isSubmitting}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {!imageUrl && (
                  <div className="mt-3 relative">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="form-input pr-10"
                      placeholder="Optional: https://example.com/image.jpg"
                      disabled={isSubmitting}
                    />
                    <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                )}
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
            {imageError && (
              <p className="text-sm text-red-600">{imageError}</p>
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
                disabled={isSubmitting || !title.trim() || !location.trim() || (!isAnonymous && !contact.trim()) || honeypot.trim().length > 0}
              >
                {isSubmitting ? 'Submitting...' : status === 'lost' ? 'Add Lost Item' : 'Add Found Item'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddNoteForm;
