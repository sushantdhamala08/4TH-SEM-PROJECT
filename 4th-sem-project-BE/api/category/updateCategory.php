<?php
require_once '../../config/db.php';
require_once '../../models/TransactionLog.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;
$name = trim($data['name'] ?? '');

if (!$id || empty($name)) sendResponse(false, "Invalid input");

$stmt = $conn->prepare("UPDATE categories SET category_name = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param("sii", $name, $id, $userId);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    $logger = new TransactionLog($conn);
    $logger->log($userId, "UPDATED_CATEGORY", "Renamed category to: $name");
    sendResponse(true, "Category updated");
} else {
    sendResponse(false, "Failed (System categories cannot be edited)");
}
?>