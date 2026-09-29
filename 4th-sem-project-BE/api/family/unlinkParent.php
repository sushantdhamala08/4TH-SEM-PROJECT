<?php
require_once '../../config/db.php';
require_once '../../models/Family.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate(); // The logged in student
$data = json_decode(file_get_contents("php://input"), true);
$parentId = $data['parent_id'] ?? 0;

if (!$parentId) {
    sendResponse(false, "Parent ID is required");
}

$family = new Family($conn);

// Verify user is actually a student
if ($family->isParent($userId)) {
    sendResponse(false, "Unauthorized. Only students can use this endpoint.");
}

if ($family->unlinkParent($userId, $parentId)) {
    sendResponse(true, "Parent successfully unlinked");
} else {
    sendResponse(false, "Failed to unlink parent");
}
?>