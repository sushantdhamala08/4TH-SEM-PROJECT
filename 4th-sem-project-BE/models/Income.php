<?php
require_once __DIR__ . '/../config/db.php';

class Income {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function add($user_id, $source, $amount, $date, $description) {
        $stmt = $this->conn->prepare("INSERT INTO incomes (user_id, source, amount, date, description) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("isdss", $user_id, $source, $amount, $date, $description);
        if ($stmt->execute()) {
            return ["success" => true, "id" => $stmt->insert_id];
        }
        return ["success" => false];
    }

    public function getAll($user_id, $start = null, $end = null) {
        $sql = "SELECT * FROM incomes WHERE user_id = ?";
        if ($start && $end) $sql .= " AND date BETWEEN ? AND ?";
        $sql .= " ORDER BY date DESC";

        $stmt = $this->conn->prepare($sql);
        if ($start && $end) $stmt->bind_param("iss", $user_id, $start, $end);
        else $stmt->bind_param("i", $user_id);

        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function update($id, $user_id, $source, $amount, $date, $description) {
        $stmt = $this->conn->prepare("UPDATE incomes SET source=?, amount=?, date=?, description=? WHERE id=? AND user_id=?");
        $stmt->bind_param("sdssii", $source, $amount, $date, $description, $id, $user_id);
        return $stmt->execute();
    }

    public function delete($id, $user_id) {
        $stmt = $this->conn->prepare("DELETE FROM incomes WHERE id=? AND user_id=?");
        $stmt->bind_param("ii", $id, $user_id);
        return $stmt->execute();
    }
}
?>