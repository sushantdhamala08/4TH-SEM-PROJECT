<?php
require_once '../../config/db.php';
require_once '../../models/Income.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

$income = new Income($conn);
$data = $income->getAll($userId, $startDate, $endDate);

sendResponse(true, "Incomes fetched", $data);
?>