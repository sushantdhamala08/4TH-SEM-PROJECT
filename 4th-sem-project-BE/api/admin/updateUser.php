<?php
require_once '../../config/db.php';
require_once '../../models/Admin.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);
$admin = new Admin($conn);

if (!$admin->isAdmin($userId)) sendResponse(false, "Unauthorized Access");

if ($admin->updateUser($data['id'], $data['first_name'], $data['last_name'], $data['email'], $data['role'])) {
    sendResponse(true, "User updated successfully");
} else {
    sendResponse(false, "Failed to update user");
}
?>