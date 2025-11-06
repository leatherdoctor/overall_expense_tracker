import { useEffect, useState } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { incomeAPI } from '../api/income';

const INCOME_TYPE_ICONS = {
  salary: '💼',
  bonus: '🎯',
  investment: '📈',
  freelance: '💻',
  gift: '🎁',
  other: '📋',
};

export default function IncomeList({ refreshTrigger }) {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        setLoading(true);
        const response = await incomeAPI.getIncomes();
        setIncomes(response.data || []);
      } catch (err) {
        setError('Failed to load income history');
        console.error('Error fetching incomes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomes();
  }, [refreshTrigger]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
          Income History
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          A list of all your income transactions
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Source
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {incomes.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No income records found
                </td>
              </tr>
            ) : (
              incomes.map((income) => (
                <tr key={income.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {income.source}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {income.note || 'No description'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{INCOME_TYPE_ICONS[income.type] || '💰'}</span>
                      <span className="text-sm text-gray-900 dark:text-gray-200 capitalize">
                        {income.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(income.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end">
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        +Rs.{parseFloat(income.amount).toFixed(2)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
