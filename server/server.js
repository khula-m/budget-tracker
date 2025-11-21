const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/users', userRoutes);

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Function to find available port
function findAvailablePort(port) {
    const net = require('net');
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(port, () => {
            server.close(() => {
                resolve(port);
            });
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findAvailablePort(port + 1));
            } else {
                reject(err);
            }
        });
    });
}

// Start server with available port
findAvailablePort(PORT)
    .then(availablePort => {
        app.listen(availablePort, () => {
            console.log(`Server running on http://localhost:${availablePort}`);
            console.log(`Frontend accessible at: http://localhost:${availablePort}`);
        });
    })
    .catch(error => {
        console.error('Failed to start server:', error);
    });