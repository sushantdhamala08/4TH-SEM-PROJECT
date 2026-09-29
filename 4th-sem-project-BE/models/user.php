<?php
require_once __DIR__ . '/../config/db.php';

class User {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function register($email, $password, $role, $first_name, $middle_name, $last_name, $bank_name = '', $bank_account_no = '') {
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email=?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        if ($stmt->get_result()->num_rows > 0) {
            return ["success" => false, "message" => "Email already registered"];
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // ADDED ROLE TO INSERT STATEMENT
        $stmt = $this->conn->prepare("
            INSERT INTO users (email, password, role, first_name, middle_name, last_name, bank_name, bank_account_no) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->bind_param("ssssssss", $email, $hashedPassword, $role, $first_name, $middle_name, $last_name, $bank_name, $bank_account_no);
        
        if ($stmt->execute()) {
            return ["success" => true, "message" => "Registration successful", "user_id" => $stmt->insert_id];
        }
        return ["success" => false, "message" => "Registration failed"];
    }

    public function login($email, $password) {
        $stmt = $this->conn->prepare("SELECT * FROM users WHERE email=?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if ($user && password_verify($password, $user['password'])) {
            return ["success" => true, "user" => $user];
        }
        return ["success" => false, "message" => "Invalid email or password"];
    }
}
?>