<?php
require_once '../../config/db.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$stmt = $conn->prepare("
    SELECT c.category_name as category, SUM(e.amount) as total 
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ? 
    GROUP BY c.category_name
");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode(["status" => true, "data" => $data]);
?>