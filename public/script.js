// Simulated database using localStorage
const DB = {
    // Initialize database if not exists
    init: function() {
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([
                { UserID: 1, Name: 'John Smith', Username: 'john', Password: 'password123' },
                { UserID: 2, Name: 'Junior Moya', Username: 'junior', Password: 'password123' }
            ]));
        }
        
        if (!localStorage.getItem('expenses')) {
            localStorage.setItem('expenses', JSON.stringify([
                { ExpenseID: 1, UserID: 1, Amount: 1200, Category: 'housing', Date: '2023-06-15', Description: 'Monthly rent' },
                { ExpenseID: 2, UserID: 1, Amount: 3200, Category: 'salary', Date: '2023-06-05', Description: 'Monthly salary' },
                { ExpenseID: 3, UserID: 1, Amount: 250, Category: 'food', Date: '2023-06-10', Description: 'Groceries' },
                { ExpenseID: 4, UserID: 1, Amount: 80, Category: 'transportation', Date: '2023-06-12', Description: 'Gas' },
                { ExpenseID: 5, UserID: 1, Amount: 150, Category: 'entertainment', Date: '2023-06-18', Description: 'Dinner and movie' },
                { ExpenseID: 6, UserID: 2, Amount: 1500, Category: 'salary', Date: '2023-06-01', Description: 'Monthly salary' },
                { ExpenseID: 7, UserID: 2, Amount: 800, Category: 'housing', Date: '2023-06-05', Description: 'Rent' },
                { ExpenseID: 8, UserID: 2, Amount: 200, Category: 'food', Date: '2023-06-08', Description: 'Groceries' }
            ]));
        }
        
        if (!localStorage.getItem('budgets')) {
            localStorage.setItem('budgets', JSON.stringify([
                { BudgetID: 1, UserID: 1, Category: 'housing', BudgetAmount: 1200 },
                { BudgetID: 2, UserID: 1, Category: 'food', BudgetAmount: 400 },
                { BudgetID: 3, UserID: 1, Category: 'transportation', BudgetAmount: 200 },
                { BudgetID: 4, UserID: 1, Category: 'entertainment', BudgetAmount: 300 },
                { BudgetID: 5, UserID: 1, Category: 'healthcare', BudgetAmount: 150 },
                { BudgetID: 6, UserID: 1, Category: 'utilities', BudgetAmount: 250 },
                { BudgetID: 7, UserID: 2, Category: 'housing', BudgetAmount: 800 },
                { BudgetID: 8, UserID: 2, Category: 'food', BudgetAmount: 300 },
                { BudgetID: 9, UserID: 2, Category: 'transportation', BudgetAmount: 150 }
            ]));
        }
    },
    
    // Get all users
    getUsers: function() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    },
    
    // Add a new user
    addUser: function(user) {
        const users = this.getUsers();
        const newId = users.length > 0 ? Math.max(...users.map(u => u.UserID)) + 1 : 1;
        
        const newUser = {
            UserID: newId,
            Name: user.Name,
            Username: user.Username,
            Password: user.Password
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        return newUser;
    },
    
    // Get all expenses for the current user
    getExpenses: function(userId) {
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        return expenses.filter(expense => expense.UserID === userId);
    },
    
    // Add a new expense/income
    addExpense: function(expense, userId) {
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const newId = expenses.length > 0 ? Math.max(...expenses.map(e => e.ExpenseID)) + 1 : 1;
        
        const newExpense = {
            ExpenseID: newId,
            UserID: userId,
            Amount: expense.Amount,
            Category: expense.Category,
            Date: expense.Date,
            Description: expense.Description || ''
        };
        
        expenses.push(newExpense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        
        return newExpense;
    },
    
    // Get all budgets for the current user
    getBudgets: function(userId) {
        const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        return budgets.filter(budget => budget.UserID === userId);
    },
    
    // Add or update a budget
    setBudget: function(category, amount, userId) {
        const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
        const existingBudget = budgets.find(b => b.Category === category && b.UserID === userId);
        
        if (existingBudget) {
            existingBudget.BudgetAmount = amount;
        } else {
            const newId = budgets.length > 0 ? Math.max(...budgets.map(b => b.BudgetID)) + 1 : 1;
            budgets.push({
                BudgetID: newId,
                UserID: userId,
                Category: category,
                BudgetAmount: amount
            });
        }
        
        localStorage.setItem('budgets', JSON.stringify(budgets));
    }
};

// Authentication and session management
const Auth = {
    currentUser: null,
    
    // Check if user is logged in
    isLoggedIn: function() {
        return localStorage.getItem('currentUser') !== null;
    },
    
    // Get current user
    getCurrentUser: function() {
        if (this.currentUser) return this.currentUser;
        
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            return this.currentUser;
        }
        
        return null;
    },
    
    // Login user
    login: function(username, password) {
        const users = DB.getUsers();
        const user = users.find(u => u.Username === username && u.Password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            return true;
        }
        
        return false;
    },
    
    // Register new user
    register: function(name, username, password) {
        const users = DB.getUsers();
        
        // Check if username already exists
        if (users.find(u => u.Username === username)) {
            return false;
        }
        
        // Add new user
        const newUser = DB.addUser({ Name: name, Username: username, Password: password });
        return true;
    },
    
    // Logout user
    logout: function() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize database
    DB.init();
    
    // Check if user is already logged in
    if (Auth.isLoggedIn()) {
        showApp();
    } else {
        showAuth();
    }
    
    // Set today's date as default in the date input
    document.getElementById('date').valueAsDate = new Date();
    
    // Add event listeners for authentication
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('signup-form').addEventListener('submit', handleSignup);
    document.getElementById('show-signup').addEventListener('click', showSignupForm);
    document.getElementById('show-login').addEventListener('click', showLoginForm);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    
    // Update category options based on transaction type
    document.getElementById('transaction-type').addEventListener('change', function() {
        updateCategoryOptions();
    });
});

// Show authentication section
function showAuth() {
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('app-section').classList.add('hidden');
}

// Show main application
function showApp() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('app-section').classList.remove('hidden');
    
    const user = Auth.getCurrentUser();
    if (user) {
        // Update user info in the header
        document.getElementById('user-name').textContent = user.Name;
        document.getElementById('user-avatar').textContent = getInitials(user.Name);
        
        // Load user-specific data
        updateDashboard();
        updateTransactions();
        updateBudgetStatus();
        
        // Add event listeners for app functionality
        document.getElementById('transaction-form').addEventListener('submit', handleTransactionSubmit);
        document.getElementById('budget-form').addEventListener('submit', handleBudgetSubmit);
    }
}

// Get user initials for avatar
function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

// Show signup form
function showSignupForm(e) {
    e.preventDefault();
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('signup-form').classList.remove('hidden');
    document.getElementById('success-message').style.display = 'none';
}

// Show login form
function showLoginForm(e) {
    e.preventDefault();
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('success-message').style.display = 'none';
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (Auth.login(username, password)) {
        showApp();
    } else {
        alert('Invalid username or password. Please try again.');
    }
}

// Handle signup form submission
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }
    
    if (Auth.register(name, username, password)) {
        // Show success message and switch to login form
        document.getElementById('success-message').style.display = 'block';
        document.getElementById('signup-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        
        // Clear the signup form
        document.getElementById('signup-form').reset();
    } else {
        alert('Username already exists. Please choose a different username.');
    }
}

// Handle logout
function handleLogout() {
    Auth.logout();
    showAuth();
    
    // Reset forms
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
    document.getElementById('signup-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('success-message').style.display = 'none';
}

// Update category options based on transaction type
function updateCategoryOptions() {
    const type = document.getElementById('transaction-type').value;
    const categorySelect = document.getElementById('category');
    
    // Clear current options except the first one
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }
    
    // Add appropriate categories based on type
    if (type === 'income') {
        addOptionGroup(categorySelect, 'Income', [
            { value: 'salary', text: 'Salary' },
            { value: 'freelance', text: 'Freelance' },
            { value: 'investment', text: 'Investment' },
            { value: 'gift', text: 'Gift' },
            { value: 'other-income', text: 'Other' }
        ]);
    } else {
        addOptionGroup(categorySelect, 'Expenses', [
            { value: 'housing', text: 'Housing' },
            { value: 'food', text: 'Food' },
            { value: 'transportation', text: 'Transportation' },
            { value: 'entertainment', text: 'Entertainment' },
            { value: 'healthcare', text: 'Healthcare' },
            { value: 'utilities', text: 'Utilities' },
            { value: 'other-expense', text: 'Other' }
        ]);
    }
}

// Helper function to add option groups to select
function addOptionGroup(select, label, options) {
    const group = document.createElement('optgroup');
    group.label = label;
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        group.appendChild(optionElement);
    });
    
    select.appendChild(group);
}

// Handle transaction form submission
function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const user = Auth.getCurrentUser();
    if (!user) return;
    
    const type = document.getElementById('transaction-type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    // Convert amount to negative for expenses
    const transactionAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    
    // Add to database
    DB.addExpense({
        Amount: transactionAmount,
        Category: category,
        Date: date,
        Description: description
    }, user.UserID);
    
    // Reset form
    document.getElementById('transaction-form').reset();
    document.getElementById('date').valueAsDate = new Date();
    
    // Update UI
    updateDashboard();
    updateTransactions();
    updateBudgetStatus();
}

// Handle budget form submission
function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const user = Auth.getCurrentUser();
    if (!user) return;
    
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    
    // Add to database
    DB.setBudget(category, amount, user.UserID);
    
    // Reset form
    document.getElementById('budget-form').reset();
    
    // Update UI
    updateDashboard();
    updateBudgetStatus();
}

// Update dashboard with current financial data
function updateDashboard() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    
    const expenses = DB.getExpenses(user.UserID);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filter transactions for current month
    const monthlyTransactions = expenses.filter(expense => {
        const expenseDate = new Date(expense.Date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    // Calculate totals
    const totalIncome = monthlyTransactions
        .filter(t => t.Amount > 0)
        .reduce((sum, t) => sum + t.Amount, 0);
        
    const totalExpenses = monthlyTransactions
        .filter(t => t.Amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.Amount), 0);
        
    const remainingBalance = totalIncome - totalExpenses;
    
    // Update summary cards
    document.getElementById('total-income').textContent = `R${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `R${totalExpenses.toFixed(2)}`;
    document.getElementById('remaining-balance').textContent = `R${remainingBalance.toFixed(2)}`;
    document.getElementById('current-balance').textContent = `R${remainingBalance.toFixed(2)}`;
    
    // Update charts
    updateCategoryChart(monthlyTransactions);
    updateBudgetChart();
}

// Update category chart
function updateCategoryChart(transactions) {
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    // Filter expenses only (negative amounts)
    const expenses = transactions.filter(t => t.Amount < 0);
    
    // Group by category and sum amounts
    const categoryTotals = {};
    expenses.forEach(expense => {
        const category = expense.Category;
        const amount = Math.abs(expense.Amount);
        
        if (categoryTotals[category]) {
            categoryTotals[category] += amount;
        } else {
            categoryTotals[category] = amount;
        }
    });
    
    // Prepare data for chart
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    // Colors for categories
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];
    
    // Destroy existing chart if it exists
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }
    
    // Create new chart
    window.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update budget chart
function updateBudgetChart() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    
    const ctx = document.getElementById('budget-chart').getContext('2d');
    const budgets = DB.getBudgets(user.UserID);
    const expenses = DB.getExpenses(user.UserID);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Prepare data for chart
    const labels = [];
    const budgetData = [];
    const spentData = [];
    
    budgets.forEach(budget => {
        const category = budget.Category;
        const budgetAmount = budget.BudgetAmount;
        
        // Calculate spent amount for this category in current month
        const spentAmount = expenses
            .filter(expense => {
                const expenseDate = new Date(expense.Date);
                return expense.Category === category && 
                       expenseDate.getMonth() === currentMonth && 
                       expenseDate.getFullYear() === currentYear &&
                       expense.Amount < 0;
            })
            .reduce((sum, expense) => sum + Math.abs(expense.Amount), 0);
        
        labels.push(category);
        budgetData.push(budgetAmount);
        spentData.push(spentAmount);
    });
    
    // Destroy existing chart if it exists
    if (window.budgetChart) {
        window.budgetChart.destroy();
    }
    
    // Create new chart
    window.budgetChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Budget',
                    data: budgetData,
                    backgroundColor: '#36A2EB',
                    borderWidth: 1
                },
                {
                    label: 'Spent',
                    data: spentData,
                    backgroundColor: '#FF6384',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Update transactions list
function updateTransactions() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    
    const transactionsList = document.getElementById('transactions-list');
    const expenses = DB.getExpenses(user.UserID);
    
    // Sort by date (newest first)
    const sortedTransactions = expenses.sort((a, b) => new Date(b.Date) - new Date(a.Date));
    
    // Clear current list
    transactionsList.innerHTML = '';
    
    // Add transactions to list (limit to 10)
    sortedTransactions.slice(0, 10).forEach(transaction => {
        const transactionItem = document.createElement('div');
        transactionItem.className = 'transaction-item';
        
        const isIncome = transaction.Amount > 0;
        const amountClass = isIncome ? 'income' : 'expense';
        const amountDisplay = isIncome ? 
            `+R${Math.abs(transaction.Amount).toFixed(2)}` : 
            `-R${Math.abs(transaction.Amount).toFixed(2)}`;
        
        transactionItem.innerHTML = `
            <div class="transaction-details">
                <div class="transaction-category">${formatCategory(transaction.Category)}</div>
                <div class="transaction-date">${formatDate(transaction.Date)}</div>
                ${transaction.Description ? `<div class="transaction-description">${transaction.Description}</div>` : ''}
            </div>
            <div class="transaction-amount ${amountClass}">${amountDisplay}</div>
        `;
        
        transactionsList.appendChild(transactionItem);
    });
}

// Update budget status
function updateBudgetStatus() {
    const user = Auth.getCurrentUser();
    if (!user) return;
    
    const budgetStatus = document.getElementById('budget-status');
    const budgets = DB.getBudgets(user.UserID);
    const expenses = DB.getExpenses(user.UserID);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Clear current status
    budgetStatus.innerHTML = '';
    
    // Add budget items
    budgets.forEach(budget => {
        const category = budget.Category;
        const budgetAmount = budget.BudgetAmount;
        
        // Calculate spent amount for this category in current month
        const spentAmount = expenses
            .filter(expense => {
                const expenseDate = new Date(expense.Date);
                return expense.Category === category && 
                       expenseDate.getMonth() === currentMonth && 
                       expenseDate.getFullYear() === currentYear &&
                       expense.Amount < 0;
            })
            .reduce((sum, expense) => sum + Math.abs(expense.Amount), 0);
        
        // Calculate percentage
        const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
        
        // Determine progress bar color
        let progressClass = 'safe';
        if (percentage > 80) progressClass = 'danger';
        else if (percentage > 60) progressClass = 'warning';
        
        const budgetItem = document.createElement('div');
        budgetItem.className = 'budget-item';
        
        budgetItem.innerHTML = `
            <div class="budget-info">
                <div class="budget-category">${formatCategory(category)}</div>
                <div class="budget-bar">
                    <div class="budget-progress ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
                <div class="budget-amounts">
                    <span>Spent: R${spentAmount.toFixed(2)}</span>
                    <span>Budget: R${budgetAmount.toFixed(2)}</span>
                </div>
            </div>
            <div class="budget-percentage">${percentage.toFixed(0)}%</div>
        `;
        
        budgetStatus.appendChild(budgetItem);
    });
}

// Helper function to format category names
function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
