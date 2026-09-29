<?php
require_once '../../config/db.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? 0;
$name = trim($data['name'] ?? '');

if (!$id || empty($name)) sendResponse(false, "Invalid input");

$stmt = $conn->prepare("UPDATE sub_categories SET name = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param("sii", $name, $id, $userId);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    sendResponse(true, "Sub-category updated");
} else {
    sendResponse(false, "Failed");
}
?>