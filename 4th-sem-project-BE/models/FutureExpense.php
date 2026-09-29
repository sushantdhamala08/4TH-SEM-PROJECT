<?php
require_once __DIR__ . '/../config/db.php';

class FutureExpense {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Add to future queue
public function add($user_id, $category_id, $amount, $date, $description, $sub_category_id, $source) {
    $stmt = $this->conn->prepare("
        INSERT INTO future_expenses (user_id, category_id, sub_category_id, amount, date, description, source, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
    ");
    // Handle NULL for sub_category_id
    $sub_cat = !empty($sub_category_id) ? $sub_category_id : NULL;
    $stmt->bind_param("iiidsss", $user_id, $category_id, $sub_cat, $amount, $date, $description, $source);
    return $stmt->execute();
}

    // Get expenses that are due (Date is today or passed) and still PENDING
    public function getDueExpenses($user_id) {
        $today = date('Y-m-d');
        $stmt = $this->conn->prepare("
            SELECT f.*, c.category_name 
            FROM future_expenses f
            JOIN categories c ON f.category_id = c.id
            WHERE f.user_id = ? AND f.status = 'PENDING' AND f.date <= ?
        ");
        $stmt->bind_param("is", $user_id, $today);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Confirm: Move from Future -> Main Expenses
    public function confirm($id, $userId, $updatedData = null) {
        $stmt = $this->conn->prepare("SELECT * FROM future_expenses WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $userId);
        $stmt->execute();
        $orig = $stmt->get_result()->fetch_assoc();

        if (!$orig) return false;

        $cat  = $updatedData['category_id'] ?? $orig['category_id'];
        $sub  = $updatedData['sub_category_id'] ?? $orig['sub_category_id'];
        $amt  = $updatedData['amount'] ?? $orig['amount'];
        $date = $updatedData['date'] ?? date('Y-m-d'); 
        $desc = $updatedData['description'] ?? $orig['description'];
        $src  = $updatedData['source'] ?? $orig['source'];

        $this->conn->begin_transaction();
        try {
            $ins = $this->conn->prepare("INSERT INTO expenses (user_id, category_id, sub_category_id, amount, date, description, source) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $ins->bind_param("iiidsss", $userId, $cat, $sub, $amt, $date, $desc, $src);
            $ins->execute();

            $upd = $this->conn->prepare("UPDATE future_expenses SET status = 'PROCESSED' WHERE id = ?");
            $upd->bind_param("i", $id);
            $upd->execute();

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollback();
            return false;
        }
    }

    public function getAllPending($user_id) {
        $stmt = $this->conn->prepare("
            SELECT f.*, c.category_name 
            FROM future_expenses f
            JOIN categories c ON f.category_id = c.id
            WHERE f.user_id = ? AND f.status = 'PENDING'
            ORDER BY f.date ASC
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function update($id, $user_id, $category_id, $amount, $date, $description) {
        $stmt = $this->conn->prepare("
            UPDATE future_expenses 
            SET category_id = ?, amount = ?, date = ?, description = ? 
            WHERE id = ? AND user_id = ? AND status = 'PENDING'
        ");
        $stmt->bind_param("idssii", $category_id, $amount, $date, $description, $id, $user_id);
        return $stmt->execute();
    }
}