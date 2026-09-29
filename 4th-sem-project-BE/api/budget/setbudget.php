<?php
require_once '../../config/db.php';
require_once '../../models/Budget.php';
require_once '../../models/TransactionLog.php'; // Import Logger
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$amount = filter_var($data['amount'] ?? 0, FILTER_VALIDATE_FLOAT);
$type = filter_var($data['type'] ?? 'Monthly', FILTER_SANITIZE_STRING);

if ($amount === false || $amount < 0) {
    sendResponse(false, "Invalid budget amount");
}

$budget = new Budget($conn);
// This updates the general `budgets` table
$result = $budget->setBudget($userId, $amount, $type);

if ($result['success']) {
    
    // NEW: If type is Monthly, sync with the specific monthly_budgets table 
    // to ensure the dashboard instantly reflects the change for the current filter.
    if ($type === 'Monthly') {
        $month = $data['month'] ?? date('m');
        $year = $data['year'] ?? date('Y');
        
        $stmtSync = $conn->prepare("
            INSERT INTO monthly_budgets (user_id, year, month, amount) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE amount = VALUES(amount)
        ");
        $stmtSync->bind_param("iiid", $userId, $year, $month, $amount);
        $stmtSync->execute();
    }

    // LOGGING
    $logger = new TransactionLog($conn);
    $logger->log($userId, "SET_BUDGET", "Set $type budget to $amount");

    sendResponse(true, $result['message']);
} else {
    sendResponse(false, $result['message']);
}
?>