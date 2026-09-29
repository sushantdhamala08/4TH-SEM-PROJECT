<?php
require_once '../../config/db.php';
require_once '../../models/Income.php';
require_once '../../models/TransactionLog.php'; 
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;
$source = $data['source'] ?? '';
$amount = $data['amount'] ?? 0;
$date = $data['date'] ?? '';
$description = $data['description'] ?? '';

if (!$id || !$amount) sendResponse(false, "Invalid input");

$income = new Income($conn);
if ($income->update($id, $userId, $source, $amount, $date, $description)) {
    $logger = new TransactionLog($conn);
    $logger->log($userId, "UPDATED_INCOME", "Updated income record: $source to NPR $amount");
    sendResponse(true, "Income updated");
} else {
    sendResponse(false, "Update failed");
}
?>