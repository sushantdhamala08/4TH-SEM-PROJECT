<?php
require_once '../../config/db.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$stmt = $conn->prepare("SELECT id, type, amount, created_at FROM budgets WHERE user_id = ? ORDER BY created_at DESC");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$budgets = [];
while ($row = $result->fetch_assoc()) {
    $budgets[] = $row;
}

sendResponse(true, "Budgets fetched", $budgets);
?>