import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { expenseAPI } from '../api/expenses';

const ExpenseCalendar = ({ currency = 'USD' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, [currentDate]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      // Use start of day in local timezone
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      const response = await expenseAPI.getAnalytics({ startDate, endDate });
      
      const expensesByDate = {};
      if (response.data.dailyTrend) {
        response.data.dailyTrend.forEach(day => {
          // Create a date object from the UTC date string and convert to local date string
          const dateObj = new Date(day.date);
          // Format as YYYY-MM-DD in local timezone
          const localDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
          expensesByDate[localDate] = parseFloat(day.total) || 0;
        });
      }
      
      setExpenses(expensesByDate);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
  const startDay = monthStart.getDay();
  
  // Create an array of day names for the header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Create an array of days to display, including empty cells for days before the 1st
  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }
  daysInMonth.forEach(day => days.push(day));

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get total for a specific date
  const getTotalForDate = (date) => {
    if (!date) return null;
    // Format date in local timezone
    const dateStr = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    return expenses[dateStr] || 0;
  };

  // Get day class based on amount spent
  const getDayClass = (amount) => {
    if (!amount) return 'bg-gray-50';
    if (amount < 50) return 'bg-green-50 text-green-800';
    if (amount < 200) return 'bg-yellow-50 text-yellow-800';
    return 'bg-red-50 text-red-800';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Expense Calendar</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-medium text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500 mb-2">
        {dayNames.map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const amount = getTotalForDate(day);
          const dayClass = getDayClass(amount);
          
          return (
            <div 
              key={i} 
              className={`p-2 rounded-lg border ${dayClass} ${!day ? 'invisible' : ''} ${isToday(day) ? 'ring-2 ring-primary-500' : ''}`}
            >
              <div className="text-right text-sm font-medium mb-1">
                {day ? format(day, 'd') : ''}
              </div>
              {day && amount > 0 && (
                <div className="text-xs truncate" title={`${formatCurrency(amount)}`}>
                  {formatCurrency(amount)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseCalendar;
