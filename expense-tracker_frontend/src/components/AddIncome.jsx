import { useState } from 'react';
import { DollarSign, X, Briefcase, FileText, Loader2, ArrowLeft, ChevronDown } from 'lucide-react';
import DatePicker from './ui/DatePicker';
import { incomeAPI } from '../api/income';

const INCOME_TYPES = [
  { value: 'salary', label: '💼 Salary', icon: '💼' },
  { value: 'bonus', label: '🎯 Bonus', icon: '🎯' },
  { value: 'investment', label: '📈 Investment', icon: '📈' },
  { value: 'freelance', label: '💻 Freelance', icon: '💻' },
  { value: 'gift', label: '🎁 Gift', icon: '🎁' },
  { value: 'other', label: '📋 Other', icon: '📋' }
];

export default function AddIncome({ onIncomeAdded, onClose }) {
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    type: 'salary'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.source || !formData.amount || !formData.date) {
      setError('Please fill in all required fields');
      return;
    }

    // Check if the selected date is in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
    
    if (selectedDate > today) {
      setError('Cannot add income for future dates');
      return;
    }

    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    setLoading(true);
    try {
      await incomeAPI.createIncome({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      // Reset form
      setFormData({
        source: '',
        amount: '',
        note: '',
        date: new Date().toISOString().split('T')[0],
        type: 'salary'
      });
      
      // Show success message and redirect after a short delay
      if (onIncomeAdded) {
        onIncomeAdded();
      }
      
      if (onIncomeAdded) onIncomeAdded();
      if (onClose) onClose();
    } catch (err) {
      setError(err.message || 'Failed to add income');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => ({
      ...prev,
      type: type.value
    }));
    setShowTypeDropdown(false);
  };

  const selectedType = INCOME_TYPES.find(type => type.value === formData.type) || INCOME_TYPES[0];

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-90 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold">Add Income</h2>
            <div className="w-9"></div> {/* For alignment */}
          </div>
          
          {/* Amount Input */}
          <div className="mb-2">
            <div className="text-sm text-white/80 mb-1">Amount</div>
            <div className="flex items-baseline">
              <span className="text-2xl mr-1">Rs.</span>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="bg-transparent border-0 text-3xl font-bold w-full focus:outline-none placeholder-white/70 text-white"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Form */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm flex items-center">
              <X className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Source Input */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                Source
              </div>
              <input
                type="text"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g., Company Name, Client, etc."
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:border-green-500 focus:ring-1 focus:ring-green-200 focus:outline-none transition-colors"
                required
              />
            </div>
            
            {/* Type Selector */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                Income Type
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="mr-2">{selectedType.icon}</span>
                    <span>{selectedType.label.replace(/^[^\s]+\s/, '')}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showTypeDropdown ? 'transform rotate-180' : ''}`} />
                </button>
                
                {showTypeDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {INCOME_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleTypeSelect(type)}
                        className={`w-full text-left px-4 py-3 flex items-center hover:bg-gray-50 ${formData.type === type.value ? 'bg-green-50 text-green-600' : ''}`}
                      >
                        <span className="mr-2">{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Date Picker */}
            <DatePicker
              label="Date"
              name="date"
              value={formData.date}
              onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
              className="mt-2"
            />
            
            {/* Note */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                Note (Optional)
              </div>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Add a note..."
                rows="2"
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:border-green-500 focus:ring-1 focus:ring-green-200 focus:outline-none transition-colors resize-none"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-500 text-white font-medium rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-lg shadow-green-100 ${loading ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5 text-white" />
                  Adding Income...
                </span>
              ) : (
                <span className="flex items-center justify-center text-lg">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Add Income
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
