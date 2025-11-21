const express = require('express');
const router = express.Router();
const connection = require('../models/database');
const queries = require('../models/queries');

// Get all expenses for a user
router.get('/:userId', async (req, res) => {
    try {
        const expenses = await connection.query(queries.GET_ALL_EXPENSES, [req.params.userId]);
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new expense/income
router.post('/', async (req, res) => {
    try {
        const { UserID, Amount, Category, Date, Description } = req.body;
        const result = await connection.execute(queries.ADD_EXPENSE, [UserID, Amount, Category, Date, Description]);
        res.json({ success: true, id: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get monthly summary
router.get('/summary/:userId/:month/:year', async (req, res) => {
    try {
        const { userId, month, year } = req.params;
        const expenses = await connection.query(queries.GET_EXPENSES_BY_MONTH, [userId, month, year]);
        
        const totalIncome = expenses
            .filter(e => e.Amount > 0)
            .reduce((sum, e) => sum + e.Amount, 0);
            
        const totalExpenses = expenses
            .filter(e => e.Amount < 0)
            .reduce((sum, e) => sum + Math.abs(e.Amount), 0);
            
        res.json({
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            transactions: expenses
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;