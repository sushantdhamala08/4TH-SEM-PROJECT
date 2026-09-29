<?php
require_once '../../config/db.php';
require_once '../../models/Family.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate(); // The logged in parent
$family = new Family($conn);

// Verify user is a parent
if (!$family->isParent($userId)) {
    sendResponse(false, "Unauthorized. Only parents can view linked students.");
}

$students = $family->getLinkedStudents($userId);
sendResponse(true, "Linked students fetched", $students);
?>