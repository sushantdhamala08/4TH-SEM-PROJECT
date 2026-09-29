<?php
require_once '../../config/db.php';
require_once '../../models/Family.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$linkId = $data['link_id'] ?? 0;
$action = $data['action'] ?? ''; // 'ACCEPT' or 'REJECT'

if (!$linkId || !in_array($action, ['ACCEPT', 'REJECT'])) {
    sendResponse(false, "Invalid input");
}

$family = new Family($conn);
if ($family->respondToRequest($userId, $linkId, $action)) {
    sendResponse(true, "Request " . strtolower($action) . "ed successfully");
} else {
    sendResponse(false, "Failed to update request");
}
?>