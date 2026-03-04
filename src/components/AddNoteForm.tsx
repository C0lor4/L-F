import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Upload } from 'lucide-react';
import { LostFoundItem, ItemStatus, StickyColor } from '../types';

type Language = 'en' | 'cn';

interface AddNoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<LostFoundItem, 'id' | 'createdAt'>) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: string | null;
  language: Language;
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
  language,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [bonusPrice, setBonusPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [contact, setContact] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [status, setStatus] = useState<ItemStatus>('lost');
  const [color, setColor] = useState<StickyColor>('yellow');
  const [customColor, setCustomColor] = useState(DEFAULT_CUSTOM_COLOR);
  const customColorInputRef = React.useRef<HTMLInputElement | null>(null);
  const titleInputRef = React.useRef<HTMLInputElement | null>(null);
  const locationInputRef = React.useRef<HTMLInputElement | null>(null);
  const dateInputRef = React.useRef<HTMLInputElement | null>(null);
  const contactInputRef = React.useRef<HTMLInputElement | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    title: false,
    location: false,
    date: false,
    contact: false,
  });
  const [honeypot, setHoneypot] = useState('');

  const text = language === 'cn'
    ? {
      unsupportedFormat: '\u4e0d\u652f\u6301\u7684\u6587\u4ef6\u683c\u5f0f\u3002',
      readImageFailed: '\u8bfb\u53d6\u56fe\u7247\u5931\u8d25\u3002',
      chooseImageFile: '\u8bf7\u9009\u62e9\u56fe\u7247\u6587\u4ef6\u3002',
      imageTooLarge: '\u56fe\u7247\u9700\u5c0f\u4e8e 1.5MB\u3002',
      processImageFailed: '\u5904\u7406\u56fe\u7247\u5931\u8d25\u3002',
      anonymous: '\u533f\u540d',
      title: '\u53d1\u5e03\u65b0\u7269\u54c1',
      postType: '\u4f60\u60f3\u53d1\u5e03\u4ec0\u4e48\uff1f',
      lostItem: '\u5931\u7269',
      lostItemHint: '\u5982\u679c\u6709\u4eba\u627e\u5230\uff0c\u53ef\u4ee5\u8054\u7cfb\u4f60\u3002',
      foundItem: '\u62db\u9886',
      foundItemHint: '\u586b\u5199\u7269\u54c1\u653e\u7f6e\u5730\u70b9\u65b9\u4fbf\u9886\u53d6\u3002',
      requiredNotice: '\u7ea2\u8272\u6807\u8bb0\u4e3a\u5fc5\u586b\u9879\u3002',
      requiredTag: '\u5fc5\u586b',
      requiredHint: '\u8fd9\u662f\u5fc5\u586b\u9879\u3002',
      formTitle: '\u6807\u9898',
      formTitlePlaceholder: '\u4f8b\u5982\uff1a\u84dd\u8272\u53cc\u80a9\u5305\uff08\u5185\u6709\u4e66\uff09',
      description: '\u63cf\u8ff0',
      descriptionPlaceholder: '\u8bf7\u8be6\u7ec6\u63cf\u8ff0\u7269\u54c1...',
      lostLocation: '\u4f60\u5728\u54ea\u91cc\u4e22\u7684\uff1f',
      foundLocation: '\u4f60\u628a\u7269\u54c1\u653e\u5728\u54ea\u91cc\uff1f',
      locationPlaceholder: '\u4f8b\u5982\uff1a\u56fe\u4e66\u9986 2 \u697c',
      bonusPrice: '\u8d4f\u91d1',
      bonusPricePlaceholder: '\u4f8b\u5982\uff1a\u4e00\u676f\u5976\u8336\u6216 \u00a550',
      date: '\u65e5\u671f',
      contact: '\u8054\u7cfb\u65b9\u5f0f',
      contactOwner: '\u8054\u7cfb\u65b9\u5f0f\uff08\u4f9b\u5931\u4e3b\u8054\u7cfb\uff09',
      anonymousOn: '\u5df2\u542f\u7528\u533f\u540d',
      anonymousOff: '\u9009\u62e9\u533f\u540d',
      contactPlaceholder: '\u4f8b\u5982\uff1a\u5fae\u4fe1\u53f7\u6216\u7535\u8bdd',
      uploadImage: '\u4e0a\u4f20\u56fe\u7247',
      chooseFromDevice: '\u4ece\u8bbe\u5907\u9009\u62e9\u56fe\u7247',
      uploadHint: '\u652f\u6301\u624b\u673a\u548c\u7535\u8111\uff0c\u6700\u5927 1.5MB\u3002',
      remove: '\u79fb\u9664',
      imageUrlPlaceholder: '\u53ef\u9009\uff1ahttps://example.com/image.jpg',
      noteColor: '\u4fbf\u7b7e\u989c\u8272',
      customColor: '\u81ea\u5b9a\u4e49\u989c\u8272',
      customColorSelected: '\u5df2\u9009\u62e9\u81ea\u5b9a\u4e49\u989c\u8272\uff1a',
      website: '\u7f51\u7ad9',
      cancel: '\u53d6\u6d88',
      submitting: '\u63d0\u4ea4\u4e2d...',
      addLost: '\u53d1\u5e03\u5931\u7269',
      addFound: '\u53d1\u5e03\u62db\u9886',
    }
    : {
      unsupportedFormat: 'Unsupported file format.',
      readImageFailed: 'Failed to read image file.',
      chooseImageFile: 'Please choose an image file.',
      imageTooLarge: 'Image must be smaller than 1.5MB.',
      processImageFailed: 'Failed to process image.',
      anonymous: 'Anonymous',
      title: 'Add New Item',
      postType: 'What do you want to post?',
      lostItem: 'Lost item',
      lostItemHint: 'People should contact you if they find it.',
      foundItem: 'Found item',
      foundItemHint: 'Share where you put the item for pickup.',
      requiredNotice: 'Fields marked in red are required.',
      requiredTag: 'Required',
      requiredHint: 'This field is required.',
      formTitle: 'Title',
      formTitlePlaceholder: 'e.g., Blue backpack with books',
      description: 'Description',
      descriptionPlaceholder: 'Describe the item in detail...',
      lostLocation: 'Where did you lose it?',
      foundLocation: 'Where did you place it?',
      locationPlaceholder: 'e.g., Library, 2nd floor',
      bonusPrice: 'Bonus price',
      bonusPricePlaceholder: 'e.g., One milk tea or \u00a510',
      date: 'Date',
      contact: 'Your Contact Information',
      contactOwner: 'Your Contact Information (for owner)',
      anonymousOn: 'Anonymous enabled',
      anonymousOff: 'Choose to stay anonymous',
      contactPlaceholder: 'e.g. phone number or wechat ID',
      uploadImage: 'Upload Image',
      chooseFromDevice: 'Choose image from device',
      uploadHint: 'Works on phone and computer. Max size: 1.5MB.',
      remove: 'Remove',
      imageUrlPlaceholder: 'Optional: https://example.com/image.jpg',
      noteColor: 'Note Color',
      customColor: 'Custom color',
      customColorSelected: 'Custom color selected:',
      website: 'Website',
      cancel: 'Cancel',
      submitting: 'Submitting...',
      addLost: 'Add Lost Item',
      addFound: 'Add Found Item',
    };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error(text.unsupportedFormat));
        }
      };
      reader.onerror = () => reject(new Error(text.readImageFailed));
      reader.readAsDataURL(file);
    });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageError(text.chooseImageFile);
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setImageError(text.imageTooLarge);
      e.target.value = '';
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setImageUrl(dataUrl);
      setImageError(null);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : text.processImageFailed);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedTitle = title.trim();
    const normalizedLocation = location.trim();
    const normalizedContact = isAnonymous ? 'Anonymous' : contact.trim();
    const normalizedBonusPrice = status === 'lost' ? bonusPrice.trim() : '';

    const missingTitle = !normalizedTitle;
    const missingLocation = !normalizedLocation;
    const missingDate = !date;
    const missingContact = !isAnonymous && !normalizedContact;

    if (!normalizedTitle || !normalizedLocation || !date || !normalizedContact) {
      setTouched({
        title: missingTitle,
        location: missingLocation,
        date: missingDate,
        contact: missingContact,
      });

      const firstMissingInput =
        (missingTitle && titleInputRef.current) ||
        (missingLocation && locationInputRef.current) ||
        (missingDate && dateInputRef.current) ||
        (missingContact && contactInputRef.current) ||
        null;

      if (firstMissingInput) {
        firstMissingInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => firstMissingInput.focus(), 160);
      }
      return;
    }

    try {
      await onSubmit({
        title: normalizedTitle,
        description: description.trim(),
        location: normalizedLocation,
        date,
        contact: normalizedContact,
        bonusPrice: normalizedBonusPrice || undefined,
        status,
        color,
        imageUrl: imageUrl.trim() || undefined,
      });
    } catch {
      return;
    }

    setTitle('');
    setDescription('');
    setLocation('');
    setBonusPrice('');
    setContact('');
    setIsAnonymous(false);
    setImageUrl('');
    setImageError(null);
    setStatus('lost');
    setColor('yellow');
    setCustomColor(DEFAULT_CUSTOM_COLOR);
    setTouched({
      title: false,
      location: false,
      date: false,
      contact: false,
    });
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{text.title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {text.postType}
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
                  <p className="font-semibold text-gray-900">{text.lostItem}</p>
                  <p className="text-xs text-gray-600 mt-1">{text.lostItemHint}</p>
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
                  <p className="font-semibold text-gray-900">{text.foundItem}</p>
                  <p className="text-xs text-gray-600 mt-1">{text.foundItemHint}</p>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.formTitle} <span className="text-red-600">*</span>
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                className="form-input"
                placeholder={text.formTitlePlaceholder}
                disabled={isSubmitting}
              />
              {touched.title && !title.trim() && (
                <p className="mt-1 text-xs text-red-600">{text.requiredHint}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.description}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="form-input"
                placeholder={text.descriptionPlaceholder}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {status === 'lost' ? text.lostLocation : text.foundLocation} <span className="text-red-600">*</span>
              </label>
              <input
                ref={locationInputRef}
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, location: true }))}
                className="form-input"
                placeholder={text.locationPlaceholder}
                disabled={isSubmitting}
              />
              {touched.location && !location.trim() && (
                <p className="mt-1 text-xs text-red-600">{text.requiredHint}</p>
              )}
            </div>

            {status === 'lost' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {text.bonusPrice}
                </label>
                <input
                  type="text"
                  value={bonusPrice}
                  onChange={(e) => setBonusPrice(e.target.value)}
                  className="form-input"
                  placeholder={text.bonusPricePlaceholder}
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.date} <span className="text-red-600">*</span>
              </label>
              <input
                ref={dateInputRef}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, date: true }))}
                className="form-input"
                disabled={isSubmitting}
              />
              {touched.date && !date && (
                <p className="mt-1 text-xs text-red-600">{text.requiredHint}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {status === 'lost' ? text.contact : text.contactOwner} <span className="text-red-600">*</span>
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
                  {isAnonymous ? text.anonymousOn : text.anonymousOff}
                </button>
              </div>
              <input
                ref={contactInputRef}
                type="text"
                value={isAnonymous ? text.anonymous : contact}
                onChange={(e) => setContact(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, contact: true }))}
                className="form-input"
                placeholder={text.contactPlaceholder}
                disabled={isSubmitting || isAnonymous}
              />
              {touched.contact && !isAnonymous && !contact.trim() && (
                <p className="mt-1 text-xs text-red-600">{text.requiredHint}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {text.uploadImage}
              </label>
              <div className="border border-gray-300 rounded-lg p-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">{text.chooseFromDevice}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
                <p className="mt-2 text-xs text-gray-500">{text.uploadHint}</p>

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
                        {text.remove}
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
                      placeholder={text.imageUrlPlaceholder}
                      disabled={isSubmitting}
                    />
                    <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {text.noteColor}
              </label>
              <div className="flex gap-3 flex-wrap">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setColor(option.value)}
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
                    title={text.customColor}
                    disabled={isSubmitting}
                  >
                    <span className="sr-only">{text.customColor}</span>
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
                    aria-label={text.customColor}
                  />
                </div>
              </div>
              {HEX_COLOR_PATTERN.test(color) && (
                <p className="mt-2 text-xs text-gray-600">
                  {text.customColorSelected} {color}
                </p>
              )}
            </div>

            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">{text.website}</label>
              <input
                id="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
            {imageError && <p className="text-sm text-red-600">{imageError}</p>}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                {text.cancel}
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                disabled={
                  isSubmitting ||
                  honeypot.trim().length > 0
                }
              >
                {isSubmitting ? text.submitting : status === 'lost' ? text.addLost : text.addFound}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddNoteForm;
