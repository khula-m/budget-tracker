const express = require('express');
const router = express.Router();
const connection = require('../models/database');
const queries = require('../models/queries');

// Get all budgets for a user
router.get('/:userId', async (req, res) => {
    try {
        const budgets = await connection.query(queries.GET_ALL_BUDGETS, [req.params.userId]);
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Set/update budget
router.post('/', async (req, res) => {
    try {
        const { UserID, Category, BudgetAmount } = req.body;
        
        // Check if budget exists
        const existing = await connection.query(queries.GET_BUDGET_BY_CATEGORY, [UserID, Category]);
        
        if (existing.length > 0) {
            await connection.execute(queries.UPDATE_BUDGET, [BudgetAmount, existing[0].BudgetID, UserID]);
        } else {
            await connection.execute("INSERT INTO Budgets (UserID, Category, BudgetAmount) VALUES (?, ?, ?)", 
                                   [UserID, Category, BudgetAmount]);
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;