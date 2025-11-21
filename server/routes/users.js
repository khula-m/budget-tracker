const express = require('express');
const router = express.Router();
const connection = require('../models/database');
const queries = require('../models/queries');

// Get user info
router.get('/:userId', async (req, res) => {
    try {
        const users = await connection.query(queries.GET_USER, [req.params.userId]);
        if (users.length > 0) {
            res.json(users[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;