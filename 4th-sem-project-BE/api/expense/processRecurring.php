<?php
require_once '../../config/db.php';
require_once '../../models/RecurringExpense.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$recurring = new RecurringExpense($conn);
$count = $recurring->processDueExpenses($userId);

sendResponse(true, "Processed recurring expenses", ["generated" => $count]);
?>