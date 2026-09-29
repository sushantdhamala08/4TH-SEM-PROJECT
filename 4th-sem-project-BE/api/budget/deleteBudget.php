<?php
require_once '../../config/db.php';
require_once '../../models/TransactionLog.php'; // Add this
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

if (!$id) sendResponse(false, "Invalid ID");

$stmt = $conn->prepare("DELETE FROM budgets WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $userId);

if ($stmt->execute()) {
    // LOGGING
    $logger = new TransactionLog($conn);
    $logger->log($userId, "DELETED_BUDGET", "Deleted a budget record (ID: $id)");

    sendResponse(true, "Budget deleted successfully");
} else {
    sendResponse(false, "Failed to delete");
}
?>