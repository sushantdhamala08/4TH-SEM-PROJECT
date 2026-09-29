<?php
require_once '../../config/db.php';
require_once '../../models/Budget.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$type = $_GET['type'] ?? 'Monthly'; 
$month = $_GET['month'] ?? date('m');
$year = $_GET['year'] ?? date('Y');

// 1. If Monthly, check if a specific plan exists in the monthly_budgets table
if ($type === 'Monthly') {
    $stmtPlan = $conn->prepare("SELECT amount FROM monthly_budgets WHERE user_id = ? AND month = ? AND year = ?");
    $stmtPlan->bind_param("iii", $userId, $month, $year);
    $stmtPlan->execute();
    $planRes = $stmtPlan->get_result()->fetch_assoc();

    if ($planRes && $planRes['amount'] > 0) {
        sendResponse(true, "Specific monthly budget fetched", [
            'amount' => $planRes['amount'], 
            'type' => 'Monthly',
            'source' => 'monthly_plan'
        ]);
        exit; // Stop execution, we found our specific budget
    }
}

// 2. Fallback to general budgets table (or for Weekly/Yearly types)
$stmt = $conn->prepare("SELECT * FROM budgets WHERE user_id = ? AND type = ? ORDER BY id DESC LIMIT 1");
$stmt->bind_param("is", $userId, $type);
$stmt->execute();
$data = $stmt->get_result()->fetch_assoc();

if ($data) {
    $data['source'] = 'general_budget';
    sendResponse(true, "General budget fetched", $data);
} else {
    sendResponse(true, "No budget found", ['amount' => 0, 'type' => $type, 'source' => 'none']);
}
?>