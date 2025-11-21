// Simple authentication middleware for the finance app
// In a real application, you would use proper JWT or session-based auth

const authenticateUser = (req, res, next) => {
    // For demo purposes, we're using a simple user ID from query params or headers
    // In production, you would use proper authentication tokens
    
    const userId = req.headers['user-id'] || req.query.userId || 1;
    
    if (!userId) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please provide a valid user ID'
        });
    }
    
    // Add user to request object for use in routes
    req.user = { id: parseInt(userId) };
    next();
};

const validateUserAccess = (req, res, next) => {
    // This middleware validates that the user can only access their own data
    const resourceUserId = parseInt(req.params.userId);
    const currentUserId = req.user.id;
    
    if (resourceUserId !== currentUserId) {
        return res.status(403).json({ 
            error: 'Access denied',
            message: 'You can only access your own data'
        });
    }
    
    next();
};

// Input validation middleware
const validateTransactionInput = (req, res, next) => {
    const { Amount, Category, Date, Type } = req.body;
    
    const errors = [];
    
    if (!Amount || isNaN(Amount)) {
        errors.push('Valid amount is required');
    }
    
    if (!Category || typeof Category !== 'string') {
        errors.push('Valid category is required');
    }
    
    if (!Date || isNaN(new Date(Date).getTime())) {
        errors.push('Valid date is required');
    }
    
    if (!Type || !['income', 'expense'].includes(Type)) {
        errors.push('Type must be either "income" or "expense"');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            messages: errors
        });
    }
    
    next();
};

const validateBudgetInput = (req, res, next) => {
    const { Category, BudgetAmount } = req.body;
    
    const errors = [];
    
    if (!Category || typeof Category !== 'string') {
        errors.push('Valid category is required');
    }
    
    if (!BudgetAmount || isNaN(BudgetAmount) || BudgetAmount <= 0) {
        errors.push('Valid budget amount greater than 0 is required');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            messages: errors
        });
    }
    
    next();
};

// Rate limiting setup (simple in-memory version for demo)
const rateLimitStore = new Map();

const rateLimit = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowStart = now - windowMs;
        
        // Clean old entries
        for (const [key, timestamp] of rateLimitStore.entries()) {
            if (timestamp < windowStart) {
                rateLimitStore.delete(key);
            }
        }
        
        // Check rate limit
        const requestCount = Array.from(rateLimitStore.values())
            .filter(timestamp => timestamp > windowStart)
            .length;
        
        if (requestCount >= maxRequests) {
            return res.status(429).json({
                error: 'Too many requests',
                message: 'Please try again later'
            });
        }
        
        // Add current request
        rateLimitStore.set(`${ip}-${now}`, now);
        
        // Add headers for client information
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - requestCount - 1);
        
        next();
    };
};

module.exports = {
    authenticateUser,
    validateUserAccess,
    validateTransactionInput,
    validateBudgetInput,
    rateLimit
};