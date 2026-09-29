<?php
require_once '../../config/db.php';
require_once '../../models/Budget.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$year = $_GET['year'] ?? date('Y');

$budget = new Budget($conn);
$data = $budget->getYearlyBreakdown($userId, $year);

sendResponse(true, "Yearly plan fetched", $data);
?>