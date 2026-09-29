<?php
require_once '../../config/db.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();

// 1. Fetch main user details including role
$stmt = $conn->prepare("SELECT id, first_name, middle_name, last_name, email, role, bank_name, bank_account_no FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if ($user) {
    // 2. If the user is a student, fetch their parent linking status
    if ($user['role'] === 'student') {
        $linkStmt = $conn->prepare("
            SELECT u.id AS parent_id, u.first_name, u.last_name, u.email, fl.status 
            FROM family_links fl 
            JOIN users u ON fl.parent_id = u.id 
            WHERE fl.student_id = ?
        ");
        $linkStmt->bind_param("i", $userId);
        $linkStmt->execute();
        
        $links = $linkStmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $user['family_links'] = $links; 
    }

    sendResponse(true, "Profile fetched", $user);
} else {
    sendResponse(false, "User not found");
}
?>