<?php
require_once '../../config/db.php';
require_once '../../models/TransactionLog.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$logger = new TransactionLog($conn);
$data = $logger->getLogs($userId);

sendResponse(true, "Logs fetched", $data);
?>