<?php
require_once '../../config/db.php';
require_once '../../models/User.php';
require_once '../../utils/auth.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if(empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Email and password required"]);
    exit;
}

$userModel = new User($conn);
$result = $userModel->login($email, $password);

if ($result['success']) {
    $user = $result['user'];
    $token = generateToken($user['id']);
    
    echo json_encode([
        "success" => true,
        "message" => "Login successful",
        "token" => $token,
        "user" => [
            "id" => $user['id'],
            "name" => $user['first_name'] . ' ' . $user['last_name'],
            "email" => $user['email'],
            "role" => $user['role'] // NEW: Pass the role back to React
        ]
    ]);
} else {
    echo json_encode($result);
}
?>