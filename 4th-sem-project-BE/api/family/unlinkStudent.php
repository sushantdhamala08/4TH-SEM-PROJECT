<?php
require_once '../../config/db.php';
require_once '../../models/Family.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate(); // The logged in parent
$data = json_decode(file_get_contents("php://input"), true);
$studentId = $data['student_id'] ?? 0;

if (!$studentId) {
    sendResponse(false, "Student ID is required");
}

$family = new Family($conn);

// Verify user is actually a parent
if (!$family->isParent($userId)) {
    sendResponse(false, "Unauthorized. Only parents can unlink students.");
}

if ($family->unlinkStudent($userId, $studentId)) {
    sendResponse(true, "Student successfully unlinked");
} else {
    sendResponse(false, "Failed to unlink student");
}
?>