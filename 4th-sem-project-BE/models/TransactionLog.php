<?php
require_once __DIR__ . '/../config/db.php';

class TransactionLog {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function log($userId, $action, $details) {
        $stmt = $this->conn->prepare("INSERT INTO transaction_logs (user_id, action, details) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $userId, $action, $details);
        return $stmt->execute();
    }

    public function getLogs($userId) {
        $stmt = $this->conn->prepare("SELECT action, details, created_at FROM transaction_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }
}
?>