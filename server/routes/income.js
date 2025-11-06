import express from 'express';
import pool from '../database/mysql.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all income entries
router.get('/', async (req, res) => {
  try {
    const { type, startDate, endDate, sortBy = 'date', order = 'DESC', page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;

    let query = 'SELECT * FROM income WHERE user_id = ?';
    const params = [userId];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
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
    const validSortColumns = ['date', 'amount', 'type', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'date';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;

    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [income] = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM income WHERE user_id = ?';
    const countParams = [userId];

    if (type) {
      countQuery += ' AND type = ?';
      countParams.push(type);
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
      data: income,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single income entry
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const [income] = await pool.query(
      'SELECT * FROM income WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (income.length === 0) {
      return res.status(404).json({ success: false, error: 'Income entry not found' });
    }

    res.json({ success: true, data: income[0] });
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new income entry
router.post('/', async (req, res) => {
  try {
    const { source, amount, note, date, type = 'salary' } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!source || !amount || !date) {
      return res.status(400).json({
        success: false,
        error: 'Source, amount, and date are required'
      });
    }

    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      });
    }

    const [result] = await pool.query(
      'INSERT INTO income (user_id, source, amount, note, date, type) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, source, parseFloat(amount), note || '', date, type]
    );

    const [newIncome] = await pool.query(
      'SELECT * FROM income WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newIncome[0],
      message: 'Income entry created successfully'
    });
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update income entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { source, amount, note, date, type } = req.body;
    const userId = req.user.userId;

    // Check if income exists and belongs to user
    const [existing] = await pool.query(
      'SELECT * FROM income WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Income entry not found' });
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

    if (source) {
      updates.push('source = ?');
      params.push(source);
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
    if (type) {
      updates.push('type = ?');
      params.push(type);
    }

    if (updates.length > 0) {
      params.push(id, userId);
      await pool.query(
        `UPDATE income SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        params
      );
    }

    const [updatedIncome] = await pool.query(
      'SELECT * FROM income WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      data: updatedIncome[0],
      message: 'Income entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete income entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if income exists and belongs to user
    const [existing] = await pool.query(
      'SELECT * FROM income WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Income entry not found' });
    }

    await pool.query('DELETE FROM income WHERE id = ? AND user_id = ?', [id, userId]);

    res.json({
      success: true,
      message: 'Income entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get income summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
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
    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    // Total income
    const [totalResult] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total FROM income ${whereClause}`,
      params
    );

    // Income by type
    const [typeBreakdown] = await pool.query(
      `SELECT type, SUM(amount) as total, COUNT(*) as count
       FROM income ${whereClause}
       GROUP BY type
       ORDER BY total DESC`,
      params
    );

    // Monthly trend
    const [monthlyTrend] = await pool.query(
      `SELECT DATE_FORMAT(date, '%Y-%m') as month, SUM(amount) as total
       FROM income ${whereClause}
       GROUP BY month
       ORDER BY month DESC
       LIMIT 12`,
      params
    );

    res.json({
      success: true,
      data: {
        totalIncome: parseFloat(totalResult[0].total),
        typeBreakdown,
        monthlyTrend: monthlyTrend.reverse()
      }
    });
  } catch (error) {
    console.error('Error fetching income analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
