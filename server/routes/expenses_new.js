import express from 'express';
import pool from '../database/mysql.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all expenses with optional filters and sorting
router.get('/', async (req, res) => {
  try {
    const { category, startDate, endDate, sortBy = 'date', order = 'DESC', page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    
    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params = [userId];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    // Add sorting
    const validSortColumns = ['date', 'amount', 'category', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'date';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [expenses] = await pool.query(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM expenses WHERE user_id = ?';
    const countParams = [userId];
    
    if (category) {
      countQuery += ' AND category = ?';
      countParams.push(category);
    }
    if (startDate) {
      countQuery += ' AND date >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countQuery += ' AND date <= ?';
      countParams.push(endDate);
    }

    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single expense by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    const [expense] = await pool.query(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (expense.length === 0) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    res.json({ success: true, data: expense[0] });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new expense
router.post('/', async (req, res) => {
  try {
    const { category, amount, note, date } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!category || !amount || !date) {
      return res.status(400).json({ 
        success: false, 
        error: 'Category, amount, and date are required' 
      });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount must be a positive number' 
      });
    }

    const [result] = await pool.query(
      'INSERT INTO expenses (user_id, category, amount, note, date) VALUES (?, ?, ?, ?, ?)',
      [userId, category, parseFloat(amount), note || '', date]
    );

    const [newExpense] = await pool.query(
      'SELECT * FROM expenses WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({ 
      success: true, 
      data: newExpense[0],
      message: 'Expense created successfully' 
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, note, date } = req.body;
    const userId = req.user.userId;

    // Check if expense exists and belongs to user
    const [existing] = await pool.query(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    // Validation
    if (amount !== undefined && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount must be a positive number' 
      });
    }

    const updates = [];
    const params = [];

    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    if (amount) {
      updates.push('amount = ?');
      params.push(parseFloat(amount));
    }
    if (note !== undefined) {
      updates.push('note = ?');
      params.push(note);
    }
    if (date) {
      updates.push('date = ?');
      params.push(date);
    }

    if (updates.length > 0) {
      params.push(id, userId);
      await pool.query(
        `UPDATE expenses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        params
      );
    }

    const [updatedExpense] = await pool.query(
      'SELECT * FROM expenses WHERE id = ?',
      [id]
    );

    res.json({ 
      success: true, 
      data: updatedExpense[0],
      message: 'Expense updated successfully' 
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if expense exists and belongs to user
    const [existing] = await pool.query(
      'SELECT * FROM expenses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({ 
      success: true, 
      message: 'Expense deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const userId = req.user.userId;
    
    let whereClause = 'WHERE user_id = ?';
    const params = [userId];

    if (startDate) {
      whereClause += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      whereClause += ' AND date <= ?';
      params.push(endDate);
    }
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    // Total spend
    const [totalResult] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses ${whereClause}`,
      params
    );

    // Average per day
    const [avgResult] = await pool.query(
      `SELECT COALESCE(AVG(daily_total), 0) as average
       FROM (
         SELECT date, SUM(amount) as daily_total
         FROM expenses ${whereClause}
         GROUP BY date
       ) as daily_totals`,
      params
    );

    // Category breakdown
    const [categoryBreakdown] = await pool.query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM expenses ${whereClause}
       GROUP BY category
       ORDER BY total DESC`,
      params
    );

    // Daily trend (last 30 days or filtered range)
    const [dailyTrend] = await pool.query(
      `SELECT date, SUM(amount) as total
       FROM expenses ${whereClause}
       GROUP BY date
       ORDER BY date DESC
       LIMIT 30`,
      params
    );

    // Count of expenses
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as count FROM expenses ${whereClause}`,
      params
    );

    // Get total income for comparison
    let incomeWhereClause = 'WHERE user_id = ?';
    const incomeParams = [userId];
    
    if (startDate) {
      incomeWhereClause += ' AND date >= ?';
      incomeParams.push(startDate);
    }
    if (endDate) {
      incomeWhereClause += ' AND date <= ?';
      incomeParams.push(endDate);
    }

    const [incomeResult] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM income ${incomeWhereClause}`,
      incomeParams
    );

    const totalIncome = parseFloat(incomeResult[0].total);
    const totalExpenses = parseFloat(totalResult[0].total);
    const balance = totalIncome - totalExpenses;

    res.json({
      success: true,
      data: {
        totalSpend: totalExpenses,
        totalIncome: totalIncome,
        balance: balance,
        averagePerDay: parseFloat(avgResult[0].average),
        totalExpenses: countResult[0].count,
        categoryBreakdown,
        dailyTrend: dailyTrend.reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all unique categories
router.get('/meta/categories', async (req, res) => {
  try {
    const userId = req.user.userId;
    const [categories] = await pool.query(
      'SELECT DISTINCT category FROM expenses WHERE user_id = ? ORDER BY category',
      [userId]
    );
    
    res.json({ 
      success: true, 
      data: categories.map(c => c.category) 
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
