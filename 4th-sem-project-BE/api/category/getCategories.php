<?php
require_once '../../config/db.php';
require_once '../../models/Category.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$category = new Category($conn);

$data = $category->getAll($userId);

if ($data) {
    sendResponse(true, "Categories fetched", $data);
} else {
    sendResponse(true, "No categories found", []);
}
?>