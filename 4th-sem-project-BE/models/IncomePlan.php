<?php
require_once __DIR__ . '/../config/db.php';

class IncomePlan {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Set Monthly Plan (Amount Only)
    public function setMonthlyPlan($user_id, $year, $month, $amount) {
        // We set weeks to 0 since we are only tracking the monthly total
        $stmt = $this->conn->prepare("
            INSERT INTO monthly_income_plans (user_id, year, month, amount, week1, week2, week3, week4) 
            VALUES (?, ?, ?, ?, 0, 0, 0, 0) 
            ON DUPLICATE KEY UPDATE 
                amount = VALUES(amount),
                week1 = 0, week2 = 0, week3 = 0, week4 = 0
        ");
        $stmt->bind_param("iiid", $user_id, $year, $month, $amount);
        
        if ($stmt->execute()) {
            return ["success" => true, "message" => "Income plan updated"];
        }
        return ["success" => false, "message" => "Database error"];
    }

    // Get Yearly Data
    public function getYearlyBreakdown($user_id, $year) {
        $stmt = $this->conn->prepare("SELECT month, amount FROM monthly_income_plans WHERE user_id = ? AND year = ?");
        $stmt->bind_param("ii", $user_id, $year);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $data = [];
        while($row = $result->fetch_assoc()) {
            $data[$row['month']] = (float)$row['amount'];
        }
        
        // Fill missing months with 0
        $finalData = [];
        for ($i = 1; $i <= 12; $i++) {
            $finalData[] = [
                "month" => $i,
                "amount" => $data[$i] ?? 0
            ];
        }
        
        return $finalData;
    }
}
?>