<?php
require_once '../../config/db.php';
require_once '../../models/Admin.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';
require_once '../../utils/mailer.php'; 

$userId = authenticate();
$data = json_decode(file_get_contents("php://input"), true);
$admin = new Admin($conn);

// Ensure the person making the request is an admin
if (!$admin->isAdmin($userId)) {
    sendResponse(false, "Unauthorized Access");
}

$targetUserId = $data['id'] ?? 0;

if (!$targetUserId) {
    sendResponse(false, "User ID is required.");
}

// --- 1. GENERATE RANDOM PASSWORD ---
// Creates a random 10-character password using letters, numbers, and special characters
$characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!%*';
$newPassword = substr(str_shuffle($characters), 0, 10);

// --- 2. FETCH TARGET USER'S DETAILS ---
$stmt = $conn->prepare("SELECT email, first_name, last_name FROM users WHERE id = ?");
$stmt->bind_param("i", $targetUserId);
$stmt->execute();
$targetUser = $stmt->get_result()->fetch_assoc();

if (!$targetUser) {
    sendResponse(false, "User not found.");
}

// --- 3. RESET THE PASSWORD IN DATABASE ---
// The resetPassword method handles hashing the $newPassword before saving it
if ($admin->resetPassword($targetUserId, $newPassword)) {
    
    // --- 4. SEND EMAIL NOTIFICATION WITH NEW PASSWORD ---
    $fullName = $targetUser['first_name'] . ' ' . $targetUser['last_name'];
    $subject = "Security Alert: Administrator Reset Your Password";
    
    $body = "
        <div style='font-family: Arial, sans-serif; color: #333;'>
            <h2>Hello {$targetUser['first_name']},</h2>
            <p>An administrator has reset the password for your Expense Tracker account (<b>{$targetUser['email']}</b>).</p>
            <p>Your new temporary password is: <b style='background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; letter-spacing: 1px;'>{$newPassword}</b></p>
            <p>Please log in using this new password and change it immediately from your Profile settings for security reasons.</p>
            <br>
            <p>Best Regards,<br>Expense Tracker Admin Team</p>
        </div>
    ";
    
    sendEmail($targetUser['email'], $fullName, $subject, $body);

    sendResponse(true, "Random password generated and emailed to the user successfully.");
} else {
    sendResponse(false, "Failed to reset password.");
}
?>