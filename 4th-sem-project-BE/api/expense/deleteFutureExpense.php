<?php
require_once '../../config/db.php';
require_once '../../models/TransactionLog.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

if (!$id) sendResponse(false, "Invalid ID");

$stmt = $conn->prepare("DELETE FROM future_expenses WHERE id = ? AND user_id = ? AND status = 'PENDING'");
$stmt->bind_param("ii", $id, $userId);

if ($stmt->execute()) {
    $logger = new TransactionLog($conn);
    $logger->log($userId, "DELETED_SCHEDULE", "Cancelled a scheduled expense (ID: $id)");
    sendResponse(true, "Scheduled expense cancelled");
} else {
    sendResponse(false, "Failed to delete");
}
?>