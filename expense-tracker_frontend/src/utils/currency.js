// Currency configuration
export const CURRENCIES = {
  INR: {
    code: 'INR',
    symbol: 'Rs',
    name: 'Indian Rupee',
    country: 'India',
    flag: '🇮🇳',
    locale: 'en-IN'
  },
  AUD: {
    code: 'AUD',
    symbol: '$',
    name: 'Australian Dollar',
    country: 'Australia',
    flag: '🇦🇺',
    locale: 'en-AU'
  }
};

// Format amount with currency
export const formatCurrency = (amount, currencyCode = 'INR') => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
  return `${currency.symbol}${parseFloat(amount).toLocaleString(currency.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Get currency from localStorage or default to INR
export const getCurrentCurrency = () => {
  const saved = localStorage.getItem('currency');
  return saved && CURRENCIES[saved] ? saved : 'INR';
};

// Save currency preference
export const setCurrency = (currencyCode) => {
  if (CURRENCIES[currencyCode]) {
    localStorage.setItem('currency', currencyCode);
    return true;
  }
  return false;
};
