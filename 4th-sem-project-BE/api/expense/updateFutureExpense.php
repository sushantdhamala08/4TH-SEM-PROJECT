<?php
require_once '../../config/db.php';
require_once '../../models/FutureExpense.php';
require_once '../../models/RecurringExpense.php'; // Import Recurring Model
require_once '../../models/TransactionLog.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;
$category_id = $data['category_id'] ?? 0;
$amount = $data['amount'] ?? 0;
$date = $data['date'] ?? '';
$description = $data['description'] ?? '';

// Check for recurring conversion flags
$create_recurring = $data['create_recurring_rule'] ?? false;
$frequency = $data['frequency'] ?? 'Monthly';

if (!$id || !$amount || !$date) {
    sendResponse(false, "Required fields missing.");
}

$future = new FutureExpense($conn);

// 1. Update the current item first
if ($future->update($id, $userId, $category_id, $amount, $date, $description)) {
    
    $logger = new TransactionLog($conn);
    $logger->log($userId, "UPDATED_SCHEDULE", "Modified scheduled expense ID: $id");

    // 2. If user requested to make it recurring
    if ($create_recurring) {
        $recurring = new RecurringExpense($conn);
        
        // Use default sub_category as NULL for now (or fetch from DB if needed)
        // We use the 'date' as the 'start_date' for the recursion
        $result = $recurring->add(
            $userId, 
            $category_id, 
            $amount, 
            $frequency, 
            $date, 
            $description, 
            NULL, 
            'Cash' // Defaulting source to Cash, or fetch from existing if critical
        );

        if ($result) {
            $logger->log($userId, "SET_RECURRING", "Converted Future Expense #$id to $frequency Recurring");
            sendResponse(true, "Updated & Converted to Recurring Series.");
        } else {
            sendResponse(true, "Expense Updated, but failed to create recurring rule.");
        }
    } else {
        sendResponse(true, "Scheduled expense updated.");
    }

} else {
    sendResponse(false, "No changes made or update failed.");
}
?>