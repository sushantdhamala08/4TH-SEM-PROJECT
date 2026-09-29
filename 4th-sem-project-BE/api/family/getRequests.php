<?php
require_once '../../config/db.php';
require_once '../../models/Family.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate(); // The logged in student
$family = new Family($conn);

$requests = $family->getPendingRequests($userId);
sendResponse(true, "Pending requests fetched", $requests);
?>