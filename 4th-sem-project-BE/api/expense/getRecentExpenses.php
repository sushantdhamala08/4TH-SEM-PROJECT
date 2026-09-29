<?php
require_once '../../config/db.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$stmt = $conn->prepare("
    SELECT e.id, e.amount, e.date, e.description, c.category_name 
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ? 
    ORDER BY e.date DESC, e.id DESC 
    LIMIT 5
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