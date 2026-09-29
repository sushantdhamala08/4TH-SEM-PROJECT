<?php
require_once '../../config/db.php';
require_once '../../models/Category.php';
require_once '../../models/TransactionLog.php'; // Import Logger
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);
$name = trim($data['name'] ?? '');

if (empty($name)) sendResponse(false, "Category name is required");

$category = new Category($conn);
$result = $category->add($userId, $name);

if ($result['success']) {
    // LOGGING
    $logger = new TransactionLog($conn);
    $logger->log($userId, "ADDED_CATEGORY", "Created new category: $name");

    sendResponse(true, "Category added successfully", [
        "id" => $result['id'],
        "name" => $result['name'], 
        "category_name" => $result['name'],
        "user_id" => $userId
    ]);
} else {
    sendResponse(false, $result['message']);
}
?>