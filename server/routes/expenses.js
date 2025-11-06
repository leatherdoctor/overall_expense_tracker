import express from 'express';
import pool from '../database/mysql.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all expenses with optional filters and sorting
router.get('/', (req, res) => {
  try {
    const { category, startDate, endDate, sortBy = 'date', order = 'DESC', page = 1, limit = 10 } = req.query;
    
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];

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

    const expenses = db.prepare(query).all(...params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM expenses WHERE 1=1';
    const countParams = [];
    
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

    const { total } = db.prepare(countQuery).get(...countParams);

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
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    
    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new expense
router.post('/', (req, res) => {
  try {
    const { category, amount, note, date } = req.body;

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

    const stmt = db.prepare(`
      INSERT INTO expenses (category, amount, note, date)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(category, parseFloat(amount), note || '', date);

    const newExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ 
      success: true, 
      data: newExpense,
      message: 'Expense created successfully' 
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update expense
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category, amount, note, date } = req.body;

    // Check if expense exists
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    // Validation
    if (amount !== undefined && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount must be a positive number' 
      });
    }

    const stmt = db.prepare(`
      UPDATE expenses 
      SET category = COALESCE(?, category),
          amount = COALESCE(?, amount),
          note = COALESCE(?, note),
          date = COALESCE(?, date),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      category || null,
      amount ? parseFloat(amount) : null,
      note !== undefined ? note : null,
      date || null,
      id
    );

    const updatedExpense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);

    res.json({ 
      success: true, 
      data: updatedExpense,
      message: 'Expense updated successfully' 
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete expense
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Check if expense exists
    const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Expense not found' });
    }

    const stmt = db.prepare('DELETE FROM expenses WHERE id = ?');
    stmt.run(id);

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
router.get('/analytics/summary', (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

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
    const totalQuery = `SELECT COALESCE(SUM(amount), 0) as total FROM expenses ${whereClause}`;
    const { total } = db.prepare(totalQuery).get(...params);

    // Average per day
    const avgQuery = `
      SELECT COALESCE(AVG(daily_total), 0) as average
      FROM (
        SELECT date, SUM(amount) as daily_total
        FROM expenses ${whereClause}
        GROUP BY date
      )
    `;
    const { average } = db.prepare(avgQuery).get(...params);

    // Category breakdown
    const categoryQuery = `
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM expenses ${whereClause}
      GROUP BY category
      ORDER BY total DESC
    `;
    const categoryBreakdown = db.prepare(categoryQuery).all(...params);

    // Daily trend (last 30 days or filtered range)
    const trendQuery = `
      SELECT date, SUM(amount) as total
      FROM expenses ${whereClause}
      GROUP BY date
      ORDER BY date DESC
      LIMIT 30
    `;
    const dailyTrend = db.prepare(trendQuery).all(...params);

    // Count of expenses
    const countQuery = `SELECT COUNT(*) as count FROM expenses ${whereClause}`;
    const { count } = db.prepare(countQuery).get(...params);

    res.json({
      success: true,
      data: {
        totalSpend: parseFloat(total.toFixed(2)),
        averagePerDay: parseFloat(average.toFixed(2)),
        totalExpenses: count,
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
router.get('/meta/categories', (req, res) => {
  try {
    const categories = db.prepare('SELECT DISTINCT category FROM expenses ORDER BY category').all();
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
