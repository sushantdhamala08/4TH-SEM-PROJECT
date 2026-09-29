<?php
// Set CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type, Accept, Origin, X-Requested-With, Access-Control-Request-Method, Access-Control-Request-Headers");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Terminate immediately on preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$host = "localhost";
$username = "root";
$password = "";     
$db_name = "expense_tracker";

// Suppress uncaught MySQLi fatal exception on PHP 8.1+ if MySQL is offline
mysqli_report(MYSQLI_REPORT_OFF);

$conn = @new mysqli($host, $username, $password, $db_name);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Database connection failed. Ensure MySQL is running in XAMPP: " . $conn->connect_error
    ]);
    exit();
}
?>