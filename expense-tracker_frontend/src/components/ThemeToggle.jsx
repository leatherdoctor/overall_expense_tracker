import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-offset-gray-800"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className="relative w-5 h-5 overflow-hidden">
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${theme === 'dark' ? 'translate-y-0' : '-translate-y-6'}`}
        >
          <Sun className="w-4 h-4 text-yellow-400" />
        </div>
        <div 
          className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${theme === 'dark' ? 'translate-y-6' : 'translate-y-0'}`}
        >
          <Moon className="w-4 h-4 text-indigo-400" />
        </div>
      </div>
    </button>
  );
}
