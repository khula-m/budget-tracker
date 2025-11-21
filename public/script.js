// API base URL
const API_BASE = 'http://localhost:3000/api';

// Current user ID (you would get this from authentication)
const CURRENT_USER_ID = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default in the date input
    document.getElementById('date').valueAsDate = new Date();
    
    // Load initial data
    loadInitialData();
    
    // Add event listeners
    document.getElementById('transaction-form').addEventListener('submit', handleTransactionSubmit);
    document.getElementById('budget-form').addEventListener('submit', handleBudgetSubmit);
    
    // Update category options based on transaction type
    document.getElementById('transaction-type').addEventListener('change', function() {
        updateCategoryOptions();
    });
});

// Load initial data from backend
async function loadInitialData() {
    try {
        showLoadingState(true);
        await updateDashboard();
        await updateTransactions();
        await updateBudgetStatus();
        showLoadingState(false);
    } catch (error) {
        console.error('Error loading initial data:', error);
        showError('Failed to load data. Please refresh the page.');
        showLoadingState(false);
    }
}

// Show/hide loading state
function showLoadingState(show) {
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        if (show) {
            button.disabled = true;
            button.innerHTML = 'Loading...';
        } else {
            button.disabled = false;
            button.innerHTML = button.getAttribute('data-original-text') || 'Add Transaction';
        }
    });
}

// Show error message
function showError(message) {
    // Create error toast notification
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e74c3c;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Create success toast notification
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// API functions
async function apiGet(url) {
    const response = await fetch(`${API_BASE}${url}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}

async function apiPost(url, data) {
    const response = await fetch(`${API_BASE}${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}

async function apiDelete(url) {
    const response = await fetch(`${API_BASE}${url}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
}

async function apiPut(url, data) {
    const response = await fetch(`${API_BASE}${url}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
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
async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('transaction-type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    
    // Validation
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount greater than 0.');
        return;
    }
    
    if (!category) {
        showError('Please select a category.');
        return;
    }
    
    if (!date) {
        showError('Please select a date.');
        return;
    }
    
    // Convert amount to negative for expenses
    const transactionAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    
    try {
        showLoadingState(true);
        
        // Add to database via API
        await apiPost('/expenses', {
            UserID: CURRENT_USER_ID,
            Amount: transactionAmount,
            Category: category,
            Date: date,
            Description: description,
            Type: type
        });
        
        // Reset form
        document.getElementById('transaction-form').reset();
        document.getElementById('date').valueAsDate = new Date();
        
        // Update UI
        await updateDashboard();
        await updateTransactions();
        await updateBudgetStatus();
        
        showSuccess('Transaction added successfully!');
        
    } catch (error) {
        console.error('Error adding transaction:', error);
        showError('Error adding transaction. Please try again.');
    } finally {
        showLoadingState(false);
    }
}

// Handle budget form submission
async function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const category = document.getElementById('budget-category').value;
    const amount = parseFloat(document.getElementById('budget-amount').value);
    
    // Validation
    if (!amount || amount <= 0) {
        showError('Please enter a valid budget amount greater than 0.');
        return;
    }
    
    if (!category) {
        showError('Please select a category.');
        return;
    }
    
    try {
        showLoadingState(true);
        
        // Add to database via API
        await apiPost('/budgets', {
            UserID: CURRENT_USER_ID,
            Category: category,
            BudgetAmount: amount
        });
        
        // Reset form
        document.getElementById('budget-form').reset();
        
        // Update UI
        await updateDashboard();
        await updateBudgetStatus();
        
        showSuccess('Budget set successfully!');
        
    } catch (error) {
        console.error('Error setting budget:', error);
        showError('Error setting budget. Please try again.');
    } finally {
        showLoadingState(false);
    }
}

// Delete transaction
async function deleteTransaction(expenseId) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        try {
            showLoadingState(true);
            await apiDelete(`/expenses/${expenseId}/user/${CURRENT_USER_ID}`);
            await updateDashboard();
            await updateTransactions();
            await updateBudgetStatus();
            showSuccess('Transaction deleted successfully!');
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showError('Error deleting transaction. Please try again.');
        } finally {
            showLoadingState(false);
        }
    }
}

// Delete budget
async function deleteBudget(budgetId) {
    if (confirm('Are you sure you want to delete this budget?')) {
        try {
            showLoadingState(true);
            await apiDelete(`/budgets/${budgetId}/user/${CURRENT_USER_ID}`);
            await updateDashboard();
            await updateBudgetStatus();
            showSuccess('Budget deleted successfully!');
        } catch (error) {
            console.error('Error deleting budget:', error);
            showError('Error deleting budget. Please try again.');
        } finally {
            showLoadingState(false);
        }
    }
}

// Edit budget
async function editBudget(budgetId, currentAmount) {
    const newAmount = prompt('Enter new budget amount:', currentAmount);
    
    if (newAmount !== null && newAmount !== '') {
        const amount = parseFloat(newAmount);
        
        if (isNaN(amount) || amount <= 0) {
            showError('Please enter a valid amount greater than 0.');
            return;
        }
        
        try {
            showLoadingState(true);
            await apiPut(`/budgets/${budgetId}`, {
                UserID: CURRENT_USER_ID,
                BudgetAmount: amount
            });
            
            await updateDashboard();
            await updateBudgetStatus();
            showSuccess('Budget updated successfully!');
        } catch (error) {
            console.error('Error updating budget:', error);
            showError('Error updating budget. Please try again.');
        } finally {
            showLoadingState(false);
        }
    }
}

// Update dashboard with current financial data
async function updateDashboard() {
    try {
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        
        const summary = await apiGet(`/expenses/summary/${CURRENT_USER_ID}/${month}/${year}`);
        
        // Update summary cards
        document.getElementById('total-income').textContent = `R${summary.totalIncome.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `R${summary.totalExpenses.toFixed(2)}`;
        document.getElementById('remaining-balance').textContent = `R${summary.balance.toFixed(2)}`;
        document.getElementById('current-balance').textContent = `R${summary.balance.toFixed(2)}`;
        
        // Update charts
        updateCategoryChart(summary.categorySpending || []);
        await updateBudgetChart();
        
    } catch (error) {
        console.error('Error updating dashboard:', error);
        throw error;
    }
}

// Update category chart
function updateCategoryChart(categorySpending) {
    const ctx = document.getElementById('category-chart').getContext('2d');
    
    // If no data, show empty state
    if (!categorySpending || categorySpending.length === 0) {
        // Destroy existing chart if it exists
        if (window.categoryChart) {
            window.categoryChart.destroy();
        }
        
        // Create empty chart with message
        window.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['No data'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['#ecf0f1'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                elements: {
                    arc: {
                        borderWidth: 0
                    }
                }
            }
        });
        
        return;
    }
    
    // Prepare data for chart
    const labels = categorySpending.map(item => formatCategory(item.Category));
    const data = categorySpending.map(item => item.Total);
    
    // Colors for categories
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#8AC926', '#C9CBCF',
        '#1982C4', '#6A4C93', '#F15BB5', '#00BBF9'
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
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: R${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '50%'
        }
    });
}

// Update budget chart
async function updateBudgetChart() {
    const ctx = document.getElementById('budget-chart').getContext('2d');
    
    try {
        const [budgets, expenses] = await Promise.all([
            apiGet(`/budgets/user/${CURRENT_USER_ID}`),
            apiGet(`/expenses/user/${CURRENT_USER_ID}`)
        ]);
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // If no budgets, show empty state
        if (!budgets || budgets.length === 0) {
            // Destroy existing chart if it exists
            if (window.budgetChart) {
                window.budgetChart.destroy();
            }
            
            // Create empty chart
            window.budgetChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['No budgets set'],
                    datasets: [
                        {
                            label: 'Budget',
                            data: [0],
                            backgroundColor: '#ecf0f1'
                        },
                        {
                            label: 'Spent',
                            data: [0],
                            backgroundColor: '#bdc3c7'
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
            
            return;
        }
        
        // Prepare data for chart
        const labels = [];
        const budgetData = [];
        const spentData = [];
        const colors = [];
        
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
                           expense.Type === 'expense';
                })
                .reduce((sum, expense) => sum + Math.abs(expense.Amount), 0);
            
            // Determine color based on budget utilization
            const utilization = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
            const color = utilization > 100 ? '#e74c3c' : utilization > 80 ? '#f39c12' : '#2ecc71';
            
            labels.push(formatCategory(category));
            budgetData.push(budgetAmount);
            spentData.push(spentAmount);
            colors.push(color);
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
                        backgroundColor: '#3498db',
                        borderWidth: 1,
                        borderColor: '#2980b9'
                    },
                    {
                        label: 'Spent',
                        data: spentData,
                        backgroundColor: colors,
                        borderWidth: 1,
                        borderColor: colors.map(color => color.replace('0.8', '1'))
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R' + value;
                            }
                        },
                        title: {
                            display: true,
                            text: 'Amount (R)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Categories'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y || 0;
                                const budget = context.dataset.label === 'Spent' ? 
                                    budgetData[context.dataIndex] : null;
                                
                                if (budget) {
                                    const percentage = ((value / budget) * 100).toFixed(1);
                                    return `${label}: R${value.toFixed(2)} (${percentage}% of budget)`;
                                }
                                
                                return `${label}: R${value.toFixed(2)}`;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error updating budget chart:', error);
        throw error;
    }
}

// Update transactions list
async function updateTransactions() {
    try {
        const expenses = await apiGet(`/expenses/user/${CURRENT_USER_ID}`);
        const transactionsList = document.getElementById('transactions-list');
        
        // Sort by date (newest first)
        const sortedTransactions = expenses.sort((a, b) => new Date(b.Date) - new Date(a.Date));
        
        // Clear current list
        transactionsList.innerHTML = '';
        
        if (sortedTransactions.length === 0) {
            transactionsList.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon">💸</div>
                    <div class="no-data-text">No transactions yet</div>
                    <div class="no-data-subtext">Add your first transaction using the form</div>
                </div>
            `;
            return;
        }
        
        // Add transactions to list (limit to 15)
        sortedTransactions.slice(0, 15).forEach(transaction => {
            const transactionItem = document.createElement('div');
            transactionItem.className = 'transaction-item';
            
            const isIncome = transaction.Type === 'income';
            const amountClass = isIncome ? 'income' : 'expense';
            const amountDisplay = isIncome ? 
                `+R${Math.abs(transaction.Amount).toFixed(2)}` : 
                `-R${Math.abs(transaction.Amount).toFixed(2)}`;
            
            const icon = getCategoryIcon(transaction.Category);
            
            transactionItem.innerHTML = `
                <div class="transaction-main">
                    <div class="transaction-icon">${icon}</div>
                    <div class="transaction-details">
                        <div class="transaction-header">
                            <div class="transaction-category">${formatCategory(transaction.Category)}</div>
                            <div class="transaction-amount ${amountClass}">${amountDisplay}</div>
                        </div>
                        <div class="transaction-footer">
                            <div class="transaction-date">${formatDate(transaction.Date)}</div>
                            ${transaction.Description ? `<div class="transaction-description">${transaction.Description}</div>` : ''}
                        </div>
                    </div>
                </div>
                <div class="transaction-actions">
                    <button class="btn-danger btn-small" onclick="deleteTransaction(${transaction.ExpenseID})" title="Delete transaction">
                        🗑️
                    </button>
                </div>
            `;
            
            transactionsList.appendChild(transactionItem);
        });
        
    } catch (error) {
        console.error('Error updating transactions:', error);
        throw error;
    }
}

// Update budget status
async function updateBudgetStatus() {
    try {
        const [budgets, expenses] = await Promise.all([
            apiGet(`/budgets/user/${CURRENT_USER_ID}`),
            apiGet(`/expenses/user/${CURRENT_USER_ID}`)
        ]);
        
        const budgetStatus = document.getElementById('budget-status');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Clear current status
        budgetStatus.innerHTML = '';
        
        if (budgets.length === 0) {
            budgetStatus.innerHTML = `
                <div class="no-data-message">
                    <div class="no-data-icon">📊</div>
                    <div class="no-data-text">No budgets set</div>
                    <div class="no-data-subtext">Set your first budget using the form</div>
                </div>
            `;
            return;
        }
        
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
                           expense.Type === 'expense';
                })
                .reduce((sum, expense) => sum + Math.abs(expense.Amount), 0);
            
            // Calculate percentage
            const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
            
            // Determine progress bar color and status
            let progressClass = 'safe';
            let statusText = 'Within Budget';
            
            if (percentage > 100) {
                progressClass = 'danger';
                statusText = 'Over Budget';
            } else if (percentage > 80) {
                progressClass = 'warning';
                statusText = 'Close to Limit';
            }
            
            const remaining = budgetAmount - spentAmount;
            const icon = getCategoryIcon(category);
            
            const budgetItem = document.createElement('div');
            budgetItem.className = 'budget-item';
            
            budgetItem.innerHTML = `
                <div class="budget-header">
                    <div class="budget-category">
                        <span class="budget-icon">${icon}</span>
                        ${formatCategory(category)}
                    </div>
                    <div class="budget-status-badge ${progressClass}">${statusText}</div>
                </div>
                <div class="budget-bar-container">
                    <div class="budget-bar">
                        <div class="budget-progress ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                    </div>
                    <div class="budget-percentage">${percentage.toFixed(0)}%</div>
                </div>
                <div class="budget-amounts">
                    <div class="budget-amount-item">
                        <span class="amount-label">Spent:</span>
                        <span class="amount-value spent">R${spentAmount.toFixed(2)}</span>
                    </div>
                    <div class="budget-amount-item">
                        <span class="amount-label">Budget:</span>
                        <span class="amount-value budget">R${budgetAmount.toFixed(2)}</span>
                    </div>
                    <div class="budget-amount-item">
                        <span class="amount-label">Remaining:</span>
                        <span class="amount-value remaining ${remaining < 0 ? 'negative' : ''}">
                            R${remaining.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div class="budget-actions">
                    <button class="btn-warning btn-small" onclick="editBudget(${budget.BudgetID}, ${budgetAmount})" title="Edit budget">
                        ✏️
                    </button>
                    <button class="btn-danger btn-small" onclick="deleteBudget(${budget.BudgetID})" title="Delete budget">
                        🗑️
                    </button>
                </div>
            `;
            
            budgetStatus.appendChild(budgetItem);
        });
        
    } catch (error) {
        console.error('Error updating budget status:', error);
        throw error;
    }
}

// Helper function to get category icon
function getCategoryIcon(category) {
    const icons = {
        'salary': '💰',
        'freelance': '💼',
        'investment': '📈',
        'gift': '🎁',
        'other-income': '💵',
        'housing': '🏠',
        'food': '🍕',
        'transportation': '🚗',
        'entertainment': '🎬',
        'healthcare': '🏥',
        'utilities': '💡',
        'other-expense': '💸'
    };
    
    return icons[category] || '💰';
}

// Helper function to format category names
function formatCategory(category) {
    const categoryNames = {
        'salary': 'Salary',
        'freelance': 'Freelance',
        'investment': 'Investment',
        'gift': 'Gift',
        'other-income': 'Other Income',
        'housing': 'Housing',
        'food': 'Food',
        'transportation': 'Transportation',
        'entertainment': 'Entertainment',
        'healthcare': 'Healthcare',
        'utilities': 'Utilities',
        'other-expense': 'Other Expense'
    };
    
    return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Export data function
async function exportData() {
    try {
        const [expenses, budgets] = await Promise.all([
            apiGet(`/expenses/user/${CURRENT_USER_ID}`),
            apiGet(`/budgets/user/${CURRENT_USER_ID}`)
        ]);
        
        const data = {
            expenses: expenses,
            budgets: budgets,
            exportDate: new Date().toISOString(),
            user: 'John Smith'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `finance-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showSuccess('Data exported successfully!');
        
    } catch (error) {
        console.error('Error exporting data:', error);
        showError('Error exporting data. Please try again.');
    }
}

// Import data function
async function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate data structure
            if (!data.expenses || !data.budgets) {
                throw new Error('Invalid data format');
            }
            
            showLoadingState(true);
            
            // Import expenses
            for (const expense of data.expenses) {
                await apiPost('/expenses', {
                    UserID: CURRENT_USER_ID,
                    Amount: expense.Amount,
                    Category: expense.Category,
                    Date: expense.Date,
                    Description: expense.Description,
                    Type: expense.Type
                });
            }
            
            // Import budgets
            for (const budget of data.budgets) {
                await apiPost('/budgets', {
                    UserID: CURRENT_USER_ID,
                    Category: budget.Category,
                    BudgetAmount: budget.BudgetAmount
                });
            }
            
            // Reload data
            await loadInitialData();
            showSuccess('Data imported successfully!');
            
        } catch (error) {
            console.error('Error importing data:', error);
            showError('Error importing data. Please check the file format.');
        } finally {
            showLoadingState(false);
            // Reset file input
            event.target.value = '';
        }
    };
    
    reader.readAsText(file);
}

// Add export/import buttons to the page
function addExportImportButtons() {
    const header = document.querySelector('.header-content');
    
    const exportImportDiv = document.createElement('div');
    exportImportDiv.className = 'export-import-buttons';
    exportImportDiv.innerHTML = `
        <button class="btn-success btn-small" onclick="exportData()" title="Export data">
            📤 Export
        </button>
        <label class="btn-warning btn-small" title="Import data">
            📥 Import
            <input type="file" accept=".json" onchange="importData(event)" style="display: none;">
        </label>
    `;
    
    header.appendChild(exportImportDiv);
}

// Initialize export/import buttons when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    addExportImportButtons();
});

// Add some utility functions for data analysis
function getMonthlyTrends() {
    // This function would analyze spending trends over months
    // Implementation would depend on your specific requirements
    console.log('Monthly trends analysis would go here');
}

function getCategoryInsights() {
    // This function would provide insights into spending patterns by category
    // Implementation would depend on your specific requirements
    console.log('Category insights analysis would go here');
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+E for export
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportData();
    }
    
    // Ctrl+I for import
    if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        document.querySelector('input[type="file"]').click();
    }
});

// Add responsive behavior
function handleResize() {
    const charts = [window.categoryChart, window.budgetChart];
    charts.forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
}

window.addEventListener('resize', handleResize);

// Add service worker for offline functionality (basic PWA support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Error boundary for unhandled errors
window.addEventListener('error', function(e) {
    console.error('Unhandled error:', e.error);
    showError('An unexpected error occurred. Please refresh the page.');
});

// Global error handler for async operations
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showError('An unexpected error occurred. Please try again.');
});