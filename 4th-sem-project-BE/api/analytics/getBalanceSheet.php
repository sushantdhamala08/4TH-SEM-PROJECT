<?php
require_once '../../config/db.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$period = $_GET['period'] ?? 'Monthly'; 

$dateCondition = "";
if (strcasecmp($period, 'Weekly') == 0) {
    $dateCondition = "YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)";
} elseif (strcasecmp($period, 'Yearly') == 0) {
    $dateCondition = "YEAR(date) = YEAR(CURDATE())";
} else {
    $dateCondition = "MONTH(date) = MONTH(CURDATE()) AND YEAR(date) = YEAR(CURDATE())";
}

// 1. Get Itemized Income (By Source)
$sqlInc = "SELECT source as name, SUM(amount) as amount FROM incomes WHERE user_id = ? AND $dateCondition GROUP BY source";
$stmtInc = $conn->prepare($sqlInc);
$stmtInc->bind_param("i", $userId);
$stmtInc->execute();
$incomeRows = $stmtInc->get_result()->fetch_all(MYSQLI_ASSOC);

// 2. Get Itemized Expenses (By Category)
$sqlExp = "SELECT c.category_name as name, SUM(e.amount) as amount 
           FROM expenses e 
           JOIN categories c ON e.category_id = c.id 
           WHERE e.user_id = ? AND $dateCondition 
           GROUP BY c.category_name";
$stmtExp = $conn->prepare($sqlExp);
$stmtExp->bind_param("i", $userId);
$stmtExp->execute();
$expenseRows = $stmtExp->get_result()->fetch_all(MYSQLI_ASSOC);

// Calculate Totals
$totalInc = array_sum(array_column($incomeRows, 'amount'));
$totalExp = array_sum(array_column($expenseRows, 'amount'));

echo json_encode([
    "status" => true,
    "incomeRows" => $incomeRows,
    "expenseRows" => $expenseRows,
    "summary" => [
        "totalIncome" => $totalInc,
        "totalExpense" => $totalExp,
        "netBalance" => $totalInc - $totalExp
    ]
]);