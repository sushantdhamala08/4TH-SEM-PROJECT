<?php
require_once '../../config/db.php';
require_once '../../models/FutureExpense.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$future = new FutureExpense($conn);
$data = $future->getAllPending($userId);

sendResponse(true, "Pending expenses fetched", $data);
?>