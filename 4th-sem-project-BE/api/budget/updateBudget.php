<?php
require_once '../../config/db.php';
require_once '../../models/TransactionLog.php'; // Add this
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;
$amount = $data['amount'] ?? 0;
$type = $data['type'] ?? 'Monthly';

if (!$id || !$amount) sendResponse(false, "Invalid Input");

$stmt = $conn->prepare("UPDATE budgets SET amount = ?, type = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param("dsii", $amount, $type, $id, $userId);

if ($stmt->execute()) {
    // LOGGING
    $logger = new TransactionLog($conn);
    $logger->log($userId, "UPDATED_BUDGET", "Changed $type budget limit to NPR $amount");

    sendResponse(true, "Budget updated successfully");
} else {
    sendResponse(false, "Failed to update");
}
?>