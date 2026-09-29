<?php
header("Content-Type: application/json");
require_once '../../config/db.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$month = $_GET['month'] ?? date('m');
$year = $_GET['year'] ?? date('Y');

$stmtTotal = $conn->prepare("SELECT SUM(amount) as total FROM expenses WHERE user_id=? AND MONTH(date)=? AND YEAR(date)=?");
$stmtTotal->bind_param("isi", $userId, $month, $year);
$stmtTotal->execute();
$total = $stmtTotal->get_result()->fetch_assoc()['total'] ?? 0;

$stmtCat = $conn->prepare("
    SELECT c.category_name as category, SUM(e.amount) as total 
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id=? AND MONTH(e.date)=? AND YEAR(e.date)=? 
    GROUP BY c.category_name
");
$stmtCat->bind_param("isi", $userId, $month, $year);
$stmtCat->execute();
$resultCat = $stmtCat->get_result();

$categories = [];
while ($row = $resultCat->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode([
    "status" => true,
    "totalExpense" => $total,
    "byCategory" => $categories
]);
?>