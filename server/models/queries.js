module.exports = {
    // User queries
    GET_USER: "SELECT * FROM Users WHERE UserID = ?",
    
    // Expense queries
    GET_ALL_EXPENSES: "SELECT * FROM Expenses WHERE UserID = ? ORDER BY Date DESC",
    GET_EXPENSES_BY_MONTH: "SELECT * FROM Expenses WHERE UserID = ? AND MONTH(Date) = ? AND YEAR(Date) = ?",
    ADD_EXPENSE: "INSERT INTO Expenses (UserID, Amount, Category, Date, Description) VALUES (?, ?, ?, ?, ?)",
    DELETE_EXPENSE: "DELETE FROM Expenses WHERE ExpenseID = ? AND UserID = ?",
    
    // Budget queries
    GET_ALL_BUDGETS: "SELECT * FROM Budgets WHERE UserID = ?",
    GET_BUDGET_BY_CATEGORY: "SELECT * FROM Budgets WHERE UserID = ? AND Category = ?",
    UPSERT_BUDGET: `INSERT INTO Budgets (UserID, Category, BudgetAmount) 
                    VALUES (?, ?, ?) 
                    ON DUPLICATE KEY UPDATE BudgetAmount = ?`,
    UPDATE_BUDGET: "UPDATE Budgets SET BudgetAmount = ? WHERE BudgetID = ? AND UserID = ?"
};