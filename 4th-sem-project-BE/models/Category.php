<?php
require_once __DIR__ . '/../config/db.php';

class Category {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAll($userId) {
        // Added 'user_id' to select to fix the Edit/Delete button issue
        $sqlCat = "SELECT id, user_id, category_name FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY category_name ASC";
        $stmt = $this->conn->prepare($sqlCat);
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $cats = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        $sqlSub = "SELECT id, user_id, category_id, name FROM sub_categories WHERE user_id IS NULL OR user_id = ? ORDER BY name ASC";
        $stmtSub = $this->conn->prepare($sqlSub);
        $stmtSub->bind_param("i", $userId);
        $stmtSub->execute();
        $subs = $stmtSub->get_result()->fetch_all(MYSQLI_ASSOC);

        $finalCategories = [];
        foreach ($cats as $cat) {
            $catId = $cat['id'];
            $cat['sub_categories'] = [];

            foreach ($subs as $sub) {
                if ($sub['category_id'] == $catId) {
                    $cat['sub_categories'][] = $sub;
                }
            }
            $finalCategories[] = $cat;
        }

        return $finalCategories;
    }

    public function add($userId, $name) {
        // 1. Check for Duplicate (Case-Insensitive)
        // Checks against User's own categories AND System categories (user_id IS NULL)
        $check = $this->conn->prepare("SELECT id FROM categories WHERE LOWER(category_name) = LOWER(?) AND (user_id = ? OR user_id IS NULL)");
        $check->bind_param("si", $name, $userId);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            return ["success" => false, "message" => "Category '$name' already exists!"];
        }

        // 2. Insert if not exists
        $stmt = $this->conn->prepare("INSERT INTO categories (user_id, category_name) VALUES (?, ?)");
        $stmt->bind_param("is", $userId, $name);
        if ($stmt->execute()) {
            return ["success" => true, "id" => $stmt->insert_id, "name" => $name];
        }
        return ["success" => false, "message" => "Database error occurred"];
    }

    public function addSubCategory($userId, $categoryId, $name) {
        // 1. Check for Duplicate Sub-Category inside the specific Category
        $check = $this->conn->prepare("SELECT id FROM sub_categories WHERE category_id = ? AND LOWER(name) = LOWER(?) AND (user_id = ? OR user_id IS NULL)");
        $check->bind_param("isi", $categoryId, $name, $userId);
        $check->execute();
        if ($check->get_result()->num_rows > 0) {
            return ["success" => false, "message" => "Sub-category '$name' already exists in this category!"];
        }

        // 2. Insert if not exists
        $stmt = $this->conn->prepare("INSERT INTO sub_categories (user_id, category_id, name) VALUES (?, ?, ?)");
        $stmt->bind_param("iis", $userId, $categoryId, $name);
        if ($stmt->execute()) {
            return ["success" => true, "id" => $stmt->insert_id, "name" => $name];
        }
        return ["success" => false, "message" => "Database error occurred"];
    }
}
?>