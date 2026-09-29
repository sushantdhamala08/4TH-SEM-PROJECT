<?php
require_once '../../config/db.php';
require_once '../../models/Admin.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$admin = new Admin($conn);

if (!$admin->isAdmin($userId)) sendResponse(false, "Unauthorized Access");

$users = $admin->getAllUsers();
sendResponse(true, "Users fetched successfully", $users);
?>