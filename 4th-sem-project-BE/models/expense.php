<?php
require_once __DIR__ . '/../config/db.php';

class Expense {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function add($user_id, $category_id, $amount, $date, $description, $sub_category_id = NULL, $source = "Cash") {
        $stmt = $this->conn->prepare("
            INSERT INTO expenses (user_id, category_id, sub_category_id, amount, date, description, source) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("iiidsss", $user_id, $category_id, $sub_category_id, $amount, $date, $description, $source);
        
        // CHANGED: Return the new ID instead of a boolean
        if ($stmt->execute()) {
            return $stmt->insert_id; 
        }
        return false;
    }

    // Get all expenses for a user (Standard model method, though API uses custom query)
    public function getAll($user_id) {
        $stmt = $this->conn->prepare("
            SELECT e.id, e.amount, e.date, e.description, c.category_name, c.id as category_id
            FROM expenses e
            JOIN categories c ON e.category_id = c.id
            WHERE e.user_id = ?
            ORDER BY e.date DESC
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    // Update expense
    public function update($id, $user_id, $category_id, $amount, $date, $description) {
        $stmt = $this->conn->prepare("
            UPDATE expenses 
            SET category_id=?, amount=?, date=?, description=? 
            WHERE id=? AND user_id=?
        ");
        $stmt->bind_param("idssii", $category_id, $amount, $date, $description, $id, $user_id);
        return $stmt->execute();
    }

    // Delete expense
    public function delete($id, $user_id) {
        $stmt = $this->conn->prepare("
            DELETE FROM expenses 
            WHERE id=? AND user_id=?
        ");
        $stmt->bind_param("ii", $id, $user_id);
        return $stmt->execute();
    }
}
?>