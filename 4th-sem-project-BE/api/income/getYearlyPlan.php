<?php
require_once '../../config/db.php';
require_once '../../models/IncomePlan.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$year = $_GET['year'] ?? date('Y');

$plan = new IncomePlan($conn);
$data = $plan->getYearlyBreakdown($userId, $year);

sendResponse(true, "Yearly income plan fetched", $data);
?>