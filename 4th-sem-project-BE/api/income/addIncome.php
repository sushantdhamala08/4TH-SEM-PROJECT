<?php
require_once '../../config/db.php';
require_once '../../models/Income.php';
require_once '../../models/TransactionLog.php'; // 1. Import Logger
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$source = trim($data['source'] ?? '');
$amount = filter_var($data['amount'] ?? 0, FILTER_VALIDATE_FLOAT);
$date = $data['date'] ?? '';

if (empty($source) || !$amount) {
    sendResponse(false, "Source and Amount are required");
}

$income = new Income($conn);
$result = $income->add($userId, $source, $amount, $date, $data['description'] ?? '');

if ($result['success']) {
    // 2. RECORD TO ACTIVITY LOG
    $logger = new TransactionLog($conn);
    $logger->log($userId, "INCOME_RECEIVED", "Received NPR $amount from $source");

    sendResponse(true, "Income added successfully");
} else {
    sendResponse(false, "Failed to add income");
}