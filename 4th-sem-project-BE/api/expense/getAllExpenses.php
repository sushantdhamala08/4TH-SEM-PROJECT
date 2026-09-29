<?php
require_once '../../config/db.php';
require_once '../../utils/auth.php';

$userId = authenticate();

$startDate = $_GET['start_date'] ?? null;
$endDate = $_GET['end_date'] ?? null;

$sql = "
    SELECT 
        e.id, 
        e.amount, 
        e.date, 
        e.description, 
        e.category_id,
        c.category_name, 
        e.sub_category_id,
        s.name as sub_category_name,
        (SELECT GROUP_CONCAT(file_path SEPARATOR ',') FROM expense_bills WHERE expense_id = e.id) as bills
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    LEFT JOIN sub_categories s ON e.sub_category_id = s.id
    WHERE e.user_id = ? 
";

if ($startDate && $endDate) {
    $sql .= " AND e.date BETWEEN ? AND ? ";
}

$sql .= " ORDER BY e.date DESC, e.id DESC";

$stmt = $conn->prepare($sql);

if ($startDate && $endDate) {
    $stmt->bind_param("iss", $userId, $startDate, $endDate);
} else {
    $stmt->bind_param("i", $userId);
}

$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    // Parse the comma-separated string into an actual array
    if ($row['bills']) {
        $row['bills'] = explode(',', $row['bills']);
    } else {
        $row['bills'] = [];
    }
    
    $data[] = $row;
}

echo json_encode(["status" => true, "data" => $data]);
?>