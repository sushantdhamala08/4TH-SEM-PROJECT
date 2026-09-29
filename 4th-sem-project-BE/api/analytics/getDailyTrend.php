<?php
require_once '../../config/db.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$month = $_GET['month'] ?? date('m');
$year = $_GET['year'] ?? date('Y');

$stmt = $conn->prepare("
    SELECT 
        DAY(date) as day, 
        SUM(amount) as total 
    FROM expenses 
    WHERE user_id = ? 
      AND MONTH(date) = ? 
      AND YEAR(date) = ? 
    GROUP BY day 
    ORDER BY day ASC
");

$stmt->bind_param("isi", $userId, $month, $year);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        "day" => (string)$row['day'],
        "amount" => (float)$row['total']
    ];
}

echo json_encode([
    "status" => true,
    "data" => $data
]);
?>