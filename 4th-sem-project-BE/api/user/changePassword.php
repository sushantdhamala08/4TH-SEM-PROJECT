<?php
require_once '../../config/db.php';
require_once '../../models/TransactionLog.php'; 
require_once '../../utils/response.php';
require_once '../../utils/auth.php';
require_once '../../utils/mailer.php'; // Import the mailer function

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);

$currentPass = $data['current_password'] ?? '';
$newPass = $data['new_password'] ?? '';

if (empty($currentPass) || strlen($newPass) < 6) {
    sendResponse(false, "Invalid input. New password must be 6+ chars.");
}

// Ensure we fetch email, first_name, and last_name along with the password
$stmt = $conn->prepare("SELECT email, first_name, last_name, password FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!password_verify($currentPass, $user['password'])) {
    sendResponse(false, "Current password is incorrect");
}

$newHash = password_hash($newPass, PASSWORD_DEFAULT);
$update = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
$update->bind_param("si", $newHash, $userId);

if ($update->execute()) {
    // LOGGING
    $logger = new TransactionLog($conn);
    $logger->log($userId, "SECURITY_UPDATE", "Password changed successfully");

    // --- NEW: SEND SECURITY ALERT EMAIL ---
    $fullName = $user['first_name'] . ' ' . $user['last_name'];
    $subject = "Security Alert: Password Changed";
    $body = "
        <div style='font-family: Arial, sans-serif; color: #333;'>
            <h2>Hello {$user['first_name']},</h2>
            <p>The password for your Expense Tracker account (<b>{$user['email']}</b>) was recently changed.</p>
            <p>If you made this change, you don't need to do anything. If you did <b>not</b> make this change, please contact your administrator immediately or reset your password.</p>
            <br>
            <p>Stay secure,<br>Expense Tracker Security Team</p>
        </div>
    ";
    
    sendEmail($user['email'], $fullName, $subject, $body);

    sendResponse(true, "Password changed successfully");
} else {
    sendResponse(false, "Failed to change password");
}
?>