import React from 'react';

interface FooterProps {
  language: 'en' | 'cn';
  onLanguageToggle: () => void;
}

const Footer: React.FC<FooterProps> = ({ language, onLanguageToggle }) => {
  const languageTitle = language === 'cn' ? '\u5207\u6362\u8BED\u8A00' : 'Language';

  return (
    <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-0">
          <img
            src="/wechat.png"
            alt="WeChat"
            className="w-6 h-6 sm:w-7 sm:h-7"
          />
          <span className="text-xs sm:text-sm text-gray-700 font-medium">: EasyToRememberThis</span>
        </div>
        <button
          type="button"
          onClick={onLanguageToggle}
          className="px-3 py-1.5 text-sm font-semibold border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
          title={languageTitle}
        >
          {language === 'en' ? 'EN' : 'CN'}
        </button>
      </div>
    </footer>
  );
};

export default Footer;
