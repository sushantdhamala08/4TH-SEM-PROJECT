<?php
require_once '../../config/db.php';
require_once '../../models/Category.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$categoryId = filter_var($data['category_id'] ?? 0, FILTER_VALIDATE_INT);
$name = trim($data['name'] ?? '');

if (!$categoryId || empty($name)) {
    sendResponse(false, "Category ID and Name required");
}

$category = new Category($conn);
$result = $category->addSubCategory($userId, $categoryId, $name);

if ($result['success']) {
    sendResponse(true, "Sub-category added", ["id" => $result['id'], "name" => $name]);
} else {
    // Pass the specific error message
    sendResponse(false, $result['message']);
}
?>