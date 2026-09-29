<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

echo json_encode([
    "status" => true,
    "version" => "1.0.0",
    "message" => "Expense Tracker Backend API is running",
    "available_routes" => [
        "Auth" => [
            ["method" => "POST", "path" => "/api/auth/register.php", "auth_required" => false],
            ["method" => "POST", "path" => "/api/auth/login.php", "auth_required" => false]
        ],
        "Expense" => [
            ["method" => "POST", "path" => "/api/expense/addExpense.php", "auth_required" => true],
            ["method" => "GET", "path" => "/api/expense/getExpenses.php", "auth_required" => true],
            ["method" => "PUT", "path" => "/api/expense/updateExpense.php", "auth_required" => true],
            ["method" => "DELETE", "path" => "/api/expense/deleteExpense.php", "auth_required" => true]
        ],
        "Budget" => [
            ["method" => "POST", "path" => "/api/budget/setBudget.php", "auth_required" => true],
            ["method" => "GET", "path" => "/api/budget/getBudget.php", "auth_required" => true]
        ],
        "Analytics" => [
            ["method" => "GET", "path" => "/api/analytics/getExpensesByCategory.php", "auth_required" => true],
            ["method" => "GET", "path" => "/api/analytics/getExpensesByDate.php", "auth_required" => true],
            ["method" => "GET", "path" => "/api/analytics/getMonthlySummary.php", "auth_required" => true]
        ]
    ]
]);