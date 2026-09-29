<?php
require_once __DIR__ . '/../config/db.php';

class Family {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Check if user is a parent
    public function isParent($userId) {
        $stmt = $this->conn->prepare("SELECT role FROM users WHERE id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        return $user && $user['role'] === 'parent';
    }

    // 1. Parent requests to link an existing student account
    public function requestLink($parentId, $studentEmail) {
        $stmt = $this->conn->prepare("SELECT id, role FROM users WHERE email = ?");
        $stmt->bind_param("s", $studentEmail);
        $stmt->execute();
        $student = $stmt->get_result()->fetch_assoc();

        if (!$student) return ["success" => false, "message" => "No account found with that email."];
        if ($student['role'] !== 'student') return ["success" => false, "message" => "You can only link student accounts."];

        $studentId = $student['id'];

        $check = $this->conn->prepare("SELECT id, status FROM family_links WHERE parent_id = ? AND student_id = ?");
        $check->bind_param("ii", $parentId, $studentId);
        $check->execute();
        $existing = $check->get_result()->fetch_assoc();

        if ($existing) {
            if ($existing['status'] === 'ACTIVE') return ["success" => false, "message" => "Already linked to this student."];
            return ["success" => false, "message" => "Link request already pending."];
        }

        $insert = $this->conn->prepare("INSERT INTO family_links (parent_id, student_id, status) VALUES (?, ?, 'PENDING')");
        $insert->bind_param("ii", $parentId, $studentId);
        
        if ($insert->execute()) return ["success" => true, "message" => "Link request sent to student."];
        return ["success" => false, "message" => "Database error."];
    }

    // 2. Student views pending requests
    public function getPendingRequests($studentId) {
        $stmt = $this->conn->prepare("
            SELECT f.id as link_id, u.first_name, u.last_name, u.email, f.created_at
            FROM family_links f
            JOIN users u ON f.parent_id = u.id
            WHERE f.student_id = ? AND f.status = 'PENDING'
        ");
        $stmt->bind_param("i", $studentId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // 3. Student accepts or rejects request
    public function respondToRequest($studentId, $linkId, $action) {
        if ($action === 'ACCEPT') {
            $stmt = $this->conn->prepare("UPDATE family_links SET status = 'ACTIVE' WHERE id = ? AND student_id = ?");
            $stmt->bind_param("ii", $linkId, $studentId);
            return $stmt->execute();
        } elseif ($action === 'REJECT') {
            $stmt = $this->conn->prepare("DELETE FROM family_links WHERE id = ? AND student_id = ?");
            $stmt->bind_param("ii", $linkId, $studentId);
            return $stmt->execute();
        }
        return false;
    }

    // 4. Parent views their active students
    public function getLinkedStudents($parentId) {
        $stmt = $this->conn->prepare("
            SELECT u.id, u.first_name, u.last_name, u.email, f.status
            FROM family_links f
            JOIN users u ON f.student_id = u.id
            WHERE f.parent_id = ? AND f.status = 'ACTIVE'
        ");
        $stmt->bind_param("i", $parentId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    // Verify if a parent is actually linked to a specific student
    public function isLinked($parentId, $studentId) {
        $stmt = $this->conn->prepare("
            SELECT id FROM family_links 
            WHERE parent_id = ? AND student_id = ? AND status = 'ACTIVE'
        ");
        $stmt->bind_param("ii", $parentId, $studentId);
        $stmt->execute();
        return $stmt->get_result()->num_rows > 0;
    }

    // 5. Parent UNLINKS a student
    public function unlinkStudent($parentId, $studentId) {
        $stmt = $this->conn->prepare("DELETE FROM family_links WHERE parent_id = ? AND student_id = ?");
        $stmt->bind_param("ii", $parentId, $studentId);
        return $stmt->execute();
    }

    // 6. Student UNLINKS a parent
    public function unlinkParent($studentId, $parentId) {
        $stmt = $this->conn->prepare("DELETE FROM family_links WHERE student_id = ? AND parent_id = ?");
        $stmt->bind_param("ii", $studentId, $parentId);
        return $stmt->execute();
    }
}
?>