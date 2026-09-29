<?php
require_once '../../config/db.php';
require_once '../../models/Admin.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$admin = new Admin($conn);

if (!$admin->isAdmin($userId)) sendResponse(false, "Unauthorized Access");

// Get filters from frontend
$period = $_GET['period'] ?? 'Monthly';
$month = isset($_GET['month']) ? (int)$_GET['month'] : (int)date('m');
$year = isset($_GET['year']) ? (int)$_GET['year'] : (int)date('Y');

// Pass filters to the model methods
$stats = $admin->getSystemStats($period, $month, $year);
$pieData = $admin->getPieChartData($period, $month, $year); 

sendResponse(true, "Dashboard data fetched", [
    "stats" => $stats,
    "pieData" => $pieData
]);
?>