<?php
require_once '../../config/db.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$stmt = $conn->prepare("
    SELECT c.category_name, cb.category_id, cb.amount 
    FROM category_budgets cb
    JOIN categories c ON cb.category_id = c.id
    WHERE cb.user_id = ?
");

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[$row['category_name']] = (float)$row['amount'];
}

sendResponse(true, "Fetched successfully", $data);
?>