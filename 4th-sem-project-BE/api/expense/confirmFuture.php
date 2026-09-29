<?php
require_once '../../config/db.php';
require_once '../../models/FutureExpense.php';
require_once '../../models/TransactionLog.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? 0;

$future = new FutureExpense($conn);
if ($future->confirm($id, $userId, $data)) {
    $logger = new TransactionLog($conn);
    $logger->log($userId, "CONFIRMED_EXPENSE", "Moved scheduled item ID $id to actual expenses");
    sendResponse(true, "Transaction confirmed.");
} else { sendResponse(false, "Confirmation failed."); }