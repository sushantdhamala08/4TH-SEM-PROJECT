<?php
require_once '../../config/db.php';
require_once '../../models/TransactionLog.php'; // Import Logger
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

$stmt = $conn->prepare("DELETE FROM categories WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $id, $userId);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    // LOGGING
    $logger = new TransactionLog($conn);
    $logger->log($userId, "DELETED_CATEGORY", "Deleted category ID: $id");

    sendResponse(true, "Category deleted");
} else {
    sendResponse(false, "Failed (You cannot delete system categories)");
}
?>