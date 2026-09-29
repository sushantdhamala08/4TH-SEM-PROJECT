<?php
require_once '../../config/db.php';
require_once '../../models/Family.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$parentId = authenticate();
$studentId = $_GET['student_id'] ?? 0;
$period = $_GET['period'] ?? 'Monthly';
$month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('m');
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');

$family = new Family($conn);

// Security Check
if (!$family->isLinked($parentId, $studentId)) {
    sendResponse(false, "Unauthorized. You are not linked to this student.");
}

// Date Condition Logic
$dateCondition = "";
if (strcasecmp($period, 'Weekly') == 0) {
    // Current week
    $dateCondition = "YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)";
} elseif (strcasecmp($period, 'Yearly') == 0) {
    // Specific Year
    $dateCondition = "YEAR(date) = $year";
} else {
    // Specific Month and Year
    $dateCondition = "MONTH(date) = $month AND YEAR(date) = $year";
}

// 1. Fetch Total Spent
$stmtSpent = $conn->prepare("SELECT SUM(amount) as total_spent FROM expenses WHERE user_id = ? AND $dateCondition");
$stmtSpent->bind_param("i", $studentId);
$stmtSpent->execute();
$spent = $stmtSpent->get_result()->fetch_assoc()['total_spent'] ?? 0;

// 2. Fetch Appropriate Budget Limit
$stmtBudget = $conn->prepare("SELECT amount FROM budgets WHERE user_id = ? AND type = ? LIMIT 1");
$stmtBudget->bind_param("is", $studentId, $period);
$stmtBudget->execute();
$budget = $stmtBudget->get_result()->fetch_assoc()['amount'] ?? 0;

// 3. Fetch Category Breakdown
$sqlCat = "SELECT c.category_name as name, SUM(e.amount) as value 
           FROM expenses e 
           JOIN categories c ON e.category_id = c.id 
           WHERE e.user_id = ? AND $dateCondition
           GROUP BY c.category_name";
$stmtCat = $conn->prepare($sqlCat);
$stmtCat->bind_param("i", $studentId);
$stmtCat->execute();
$categories = $stmtCat->get_result()->fetch_all(MYSQLI_ASSOC);

// 4. Fetch Transaction List
$sqlList = "SELECT e.id, e.date, c.category_name, e.description, e.amount 
            FROM expenses e 
            JOIN categories c ON e.category_id = c.id 
            WHERE e.user_id = ? AND $dateCondition 
            ORDER BY e.date DESC, e.id DESC";
$stmtList = $conn->prepare($sqlList);
$stmtList->bind_param("i", $studentId);
$stmtList->execute();
$expenses = $stmtList->get_result()->fetch_all(MYSQLI_ASSOC);

sendResponse(true, "Student data fetched", [
    "stats" => [
        "totalSpent" => (float)$spent,
        "budget" => (float)$budget
    ],
    "categories" => $categories,
    "expenses" => $expenses
]);
?>