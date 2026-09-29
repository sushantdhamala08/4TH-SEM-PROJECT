<?php
require_once '../../config/db.php';
require_once '../../models/RecurringExpense.php';
require_once '../../models/TransactionLog.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$category_id = $data['category_id'] ?? 0;
$sub_category_id = !empty($data['sub_category_id']) ? $data['sub_category_id'] : NULL;
$amount = $data['amount'] ?? 0;
$frequency = $data['frequency'] ?? 'Monthly';
$start_date = $data['start_date'] ?? date('Y-m-d');
$description = $data['description'] ?? '';
$source = $data['source'] ?? 'Cash';

if (!$category_id || !$amount || !$frequency) {
    sendResponse(false, "Category, Amount, and Frequency are required.");
}

$recurring = new RecurringExpense($conn);
$result = $recurring->add($userId, $category_id, $amount, $frequency, $start_date, $description, $sub_category_id, $source);

if ($result) {
    $logger = new TransactionLog($conn);
    $logger->log($userId, "SET_RECURRING", "Set up $frequency recurring expense of NPR $amount");
    
    // Immediately process so it shows up if due today
    $recurring->processDueExpenses($userId);

    sendResponse(true, "Recurring expense set up successfully.");
} else {
    sendResponse(false, "Failed to set recurring expense.");
}
?>