<?php
require_once '../../config/db.php';
require_once '../../models/Expense.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$expense = new Expense($conn);
$data = $expense->getAll($userId);

sendResponse(true, "Expenses fetched successfully", $data);
?>