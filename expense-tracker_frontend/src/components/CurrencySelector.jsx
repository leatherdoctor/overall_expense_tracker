import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { CURRENCIES, getCurrentCurrency, setCurrency } from '../utils/currency';

export default function CurrencySelector({ onCurrencyChange }) {
  const [selectedCurrency, setSelectedCurrency] = useState(getCurrentCurrency());
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyChange = (currencyCode) => {
    setCurrency(currencyCode);
    setSelectedCurrency(currencyCode);
    setIsOpen(false);
    if (onCurrencyChange) {
      onCurrencyChange(currencyCode);
    }
  };

  const currentCurrency = CURRENCIES[selectedCurrency];

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-center w-full h-full focus:outline-none"
        aria-label="Change currency"
      >
        <span className="text-base">{currentCurrency.flag}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-2 sm:p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-primary-500 to-primary-600">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Select Currency
                </h3>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-100"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {Object.values(CURRENCIES).map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => {
                    handleCurrencyChange(currency.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 sm:p-4 transition-colors duration-150 ${
                    selectedCurrency === currency.code
                      ? 'bg-primary-50 text-primary-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{currency.flag}</span>
                    <div className="text-left">
                      <div className="font-medium text-sm sm:text-base">{currency.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {currency.symbol} - {currency.code}
                      </div>
                    </div>
                  </div>
                  {selectedCurrency === currency.code && (
                    <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
