<?php
require_once '../../config/db.php';
require_once '../../models/Income.php';
require_once '../../models/TransactionLog.php'; 
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

if (!$id) sendResponse(false, "ID required");

$income = new Income($conn);
if ($income->delete($id, $userId)) {
    $logger = new TransactionLog($conn);
    $logger->log($userId, "DELETED_INCOME", "Deleted income record (ID: $id)");
    sendResponse(true, "Income deleted successfully");
} else {
    sendResponse(false, "Failed to delete");
}
?>