<?php
require_once '../../config/db.php';
require_once '../../models/Admin.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$targetUserId = $_GET['user_id'] ?? 0;
$admin = new Admin($conn);

if (!$admin->isAdmin($userId)) sendResponse(false, "Unauthorized Access");
if (!$targetUserId) sendResponse(false, "User ID required");

$expenses = $admin->getUserExpenses($targetUserId);
sendResponse(true, "User expenses fetched", $expenses);
?>