<?php
require_once '../../config/db.php';
require_once '../../models/Family.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);
$studentEmail = filter_var(trim($data['student_email'] ?? ''), FILTER_SANITIZE_EMAIL);

if (empty($studentEmail)) sendResponse(false, "Student email is required");

$family = new Family($conn);

// Verify user is a parent
if (!$family->isParent($userId)) {
    sendResponse(false, "Unauthorized. Only parents can link students.");
}

$result = $family->requestLink($userId, $studentEmail);
sendResponse($result['success'], $result['message']);
?>