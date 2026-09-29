<?php
require_once '../../config/db.php';
require_once '../../models/IncomePlan.php';
require_once '../../models/TransactionLog.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);
$year = $data['year']; $month = $data['month']; $amount = $data['amount'];

$plan = new IncomePlan($conn);
$result = $plan->setMonthlyPlan($userId, $year, $month, $amount);

if ($result['success']) {
    $logger = new TransactionLog($conn);
    $monthName = date("F", mktime(0, 0, 0, $month, 10));
    $logger->log($userId, "INCOME_PLAN_UPDATED", "Set income goal for $monthName $year to NPR $amount");
}
sendResponse($result['success'], $result['message']);