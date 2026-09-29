<?php
require_once '../../config/db.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$period = $_GET['period'] ?? 'Monthly'; 

// Get requested Month and Year, default to current if not provided
$reqMonth = isset($_GET['month']) ? intval($_GET['month']) : intval(date('m'));
$reqYear = isset($_GET['year']) ? intval($_GET['year']) : intval(date('Y'));

$dateCondition = "";

if (strcasecmp($period, 'Weekly') == 0) {
    // For Weekly, we stick to "Current Week" logic for simplicity, 
    // or you could implement specific week selection later.
    $dateCondition = "YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)";
} elseif (strcasecmp($period, 'Yearly') == 0) {
    // Filter by specific Year
    $dateCondition = "YEAR(date) = $reqYear";
} else {
    // Default to Monthly: Filter by specific Month AND Year
    $dateCondition = "MONTH(date) = $reqMonth AND YEAR(date) = $reqYear";
}

$sqlTotal = "SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND $dateCondition";
$stmtTotal = $conn->prepare($sqlTotal);
$stmtTotal->bind_param("i", $userId);
$stmtTotal->execute();
$total = (float)$stmtTotal->get_result()->fetch_assoc()['total'] ?? 0;

$sqlCat = "
    SELECT c.category_name as category, SUM(e.amount) as total 
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ? AND $dateCondition
    GROUP BY c.category_name
";
$stmtCat = $conn->prepare($sqlCat);
$stmtCat->bind_param("i", $userId);
$stmtCat->execute();
$resultCat = $stmtCat->get_result();

$categories = [];
while ($row = $resultCat->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode([
    "status" => true,
    "totalExpense" => $total,
    "byCategory" => $categories,
    "period" => $period,
    "filter" => [
        "month" => $reqMonth,
        "year" => $reqYear
    ]
]);
?>