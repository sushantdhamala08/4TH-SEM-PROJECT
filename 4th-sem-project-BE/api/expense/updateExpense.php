<?php
require_once '../../config/db.php';
require_once '../../models/Expense.php';
require_once '../../models/TransactionLog.php';
require_once '../../utils/response.php';
require_once '../../utils/auth.php';

$userId = authenticate();

// Support both JSON and FormData
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) $data = $_POST;

$id = filter_var($data['id'] ?? 0, FILTER_VALIDATE_INT);
$category_id = filter_var($data['category_id'] ?? 0, FILTER_VALIDATE_INT);
$amount = filter_var($data['amount'] ?? 0, FILTER_VALIDATE_FLOAT);
$date = filter_var($data['date'] ?? '', FILTER_SANITIZE_STRING);
$description = filter_var($data['description'] ?? '', FILTER_SANITIZE_STRING);

if (!$id || !$category_id || !$amount || !$date) {
    sendResponse(false, "Invalid input. ID, Category, Amount, and Date required.");
}

$expense = new Expense($conn);
$result = $expense->update($id, $userId, $category_id, $amount, $date, $description);

if ($result) {

    // --- NEW: HANDLE UPDATED FILE UPLOADS ---
    if (isset($_FILES['bills']) && !empty($_FILES['bills']['name'][0])) {
        
        // 1. Delete old bills from Database to avoid clutter (Optional: you could also unlink/delete physical files here)
        $del = $conn->prepare("DELETE FROM expense_bills WHERE expense_id = ?");
        $del->bind_param("i", $id);
        $del->execute();

        // 2. Upload new files
        $uploadDir = '../../uploads/bills/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        foreach ($_FILES['bills']['tmp_name'] as $key => $tmpName) {
            $fileName = time() . '_' . basename($_FILES['bills']['name'][$key]);
            $targetPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($tmpName, $targetPath)) {
                $dbPath = 'uploads/bills/' . $fileName;
                $stmt = $conn->prepare("INSERT INTO expense_bills (expense_id, file_path) VALUES (?, ?)");
                $stmt->bind_param("is", $id, $dbPath);
                $stmt->execute();
            }
        }
    }
    // --- END FILE UPLOAD LOGIC ---

    // LOGGING
    $logger = new TransactionLog($conn);
    $logger->log($userId, "UPDATED_EXPENSE", "Updated expense ID: $id (Amount: $amount)");

    sendResponse(true, "Expense updated successfully");
} else {
    sendResponse(false, "Failed to update expense");
}
?>