<?php
require_once "../../config/db.php";
require_once "../../models/User.php";
require_once "../../utils/mailer.php"; // Import the mailer function

function sendResponse($success, $message) {
    echo json_encode(["success" => $success, "message" => $message]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (!$data) $data = $_POST;

$email      = filter_var(trim($data['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$password   = trim($data['password'] ?? '');
$role       = trim($data['role'] ?? 'student');
$first_name = trim($data['first_name'] ?? '');
$last_name  = trim($data['last_name'] ?? '');
$mid_name   = trim($data['middle_name'] ?? '');
$bank_name  = trim($data['bank_name'] ?? '');
$bank_acc   = trim($data['bank_account_no'] ?? '');

// Ensure role is valid
if (!in_array($role, ['student', 'parent'])) {
    $role = 'student';
}

if (empty($email) || empty($password) || empty($first_name) || empty($last_name)) {
    sendResponse(false, "Name, Email, and Password are required.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(false, "Invalid email address format.");
}

if (strlen($password) < 6) {
    sendResponse(false, "Password must be at least 6 characters long.");
}

$userModel = new User($conn);
$result = $userModel->register($email, $password, $role, $first_name, $mid_name, $last_name, $bank_name, $bank_acc);

// --- NEW: SEND WELCOME EMAIL ---
if ($result['success']) {
    $subject = "Welcome to Expense Tracker!";
    $body = "
        <div style='font-family: Arial, sans-serif; color: #333;'>
            <h2>Hello $first_name $last_name,</h2>
            <p>Welcome to <b>Expense Tracker</b>!</p>
            <p>Your account has been successfully created as a <b>" . ucfirst($role) . "</b>.</p>
            <p>You can now log in and start tracking your finances.</p>
            <br>
            <p>Best Regards,<br>Expense Tracker Team</p>
        </div>
    ";
    
    // Call the email function
    sendEmail($email, "$first_name $last_name", $subject, $body);
}

echo json_encode($result);
?>