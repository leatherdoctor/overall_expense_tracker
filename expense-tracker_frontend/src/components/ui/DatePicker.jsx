import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

const DatePicker = ({ label, value, onChange, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm transition-colors duration-200"
          {...props}
        />
      </div>
    </div>
  );
};

export default DatePicker;
