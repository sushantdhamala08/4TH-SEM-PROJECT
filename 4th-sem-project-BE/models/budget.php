<?php
require_once __DIR__ . '/../config/db.php';

class Budget {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function setBudget($user_id, $amount, $type = "Monthly") {
        $stmt = $this->conn->prepare("SELECT type, amount FROM budgets WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $existing = [];
        while($row = $result->fetch_assoc()) {
            $existing[$row['type']] = (float)$row['amount'];
        }

        if ($type === 'Weekly') {
            if (isset($existing['Monthly']) && $amount > $existing['Monthly']) {
                return [
                    "success" => false, 
                    "message" => "Weekly budget ($amount) cannot exceed Monthly budget (" . $existing['Monthly'] . ")"
                ];
            }
            if (isset($existing['Yearly']) && $amount > $existing['Yearly']) {
                return [
                    "success" => false, 
                    "message" => "Weekly budget cannot exceed Yearly budget (" . $existing['Yearly'] . ")"
                ];
            }
        } 
        elseif ($type === 'Monthly') {
            if (isset($existing['Weekly']) && $amount < $existing['Weekly']) {
                return [
                    "success" => false, 
                    "message" => "Monthly budget ($amount) cannot be less than Weekly budget (" . $existing['Weekly'] . ")"
                ];
            }
            if (isset($existing['Yearly']) && $amount > $existing['Yearly']) {
                return [
                    "success" => false, 
                    "message" => "Monthly budget cannot exceed Yearly budget (" . $existing['Yearly'] . ")"
                ];
            }
        } 
        elseif ($type === 'Yearly') {
            if (isset($existing['Monthly']) && $amount < $existing['Monthly']) {
                return [
                    "success" => false, 
                    "message" => "Yearly budget cannot be less than Monthly budget (" . $existing['Monthly'] . ")"
                ];
            }
            if (isset($existing['Weekly']) && $amount < $existing['Weekly']) {
                 return [
                    "success" => false, 
                    "message" => "Yearly budget cannot be less than Weekly budget (" . $existing['Weekly'] . ")"
                ];
            }
        }

        $check = $this->conn->prepare("SELECT id FROM budgets WHERE user_id = ? AND type = ?");
        $check->bind_param("is", $user_id, $type);
        $check->execute();
        $checkRes = $check->get_result();

        if ($checkRes->num_rows > 0) {
            $stmt = $this->conn->prepare("UPDATE budgets SET amount = ?, created_at = NOW() WHERE user_id = ? AND type = ?");
            $stmt->bind_param("dis", $amount, $user_id, $type);
        } else {
            $stmt = $this->conn->prepare("INSERT INTO budgets (user_id, amount, type) VALUES (?, ?, ?)");
            $stmt->bind_param("ids", $user_id, $amount, $type);
        }

        if ($stmt->execute()) {
            return ["success" => true, "message" => "Budget set successfully"];
        } else {
            return ["success" => false, "message" => "Database error occurred"];
        }
    }
          public function setMonthlyAmount($user_id, $year, $month, $w1, $w2, $w3, $w4) {
        // Calculate Total automatically
        $totalAmount = $w1 + $w2 + $w3 + $w4;

        $stmt = $this->conn->prepare("
            INSERT INTO monthly_budgets (user_id, year, month, amount, week1, week2, week3, week4) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                amount = VALUES(amount),
                week1 = VALUES(week1),
                week2 = VALUES(week2),
                week3 = VALUES(week3),
                week4 = VALUES(week4)
        ");
        $stmt->bind_param("iiiddddd", $user_id, $year, $month, $totalAmount, $w1, $w2, $w3, $w4);
        
        if ($stmt->execute()) {
            return ["success" => true, "message" => "Budget updated"];
        }
        return ["success" => false, "message" => "Database error"];
    }

    public function getBudget($user_id, $type) {
        $stmt = $this->conn->prepare("SELECT * FROM budgets WHERE user_id = ? AND type = ? ORDER BY id DESC LIMIT 1");
        $stmt->bind_param("is", $user_id, $type);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc();
    }
     public function getYearlyBreakdown($user_id, $year) {
        $stmt = $this->conn->prepare("SELECT month, amount, week1, week2, week3, week4 FROM monthly_budgets WHERE user_id = ? AND year = ?");
        $stmt->bind_param("ii", $user_id, $year);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $data = [];
        while($row = $result->fetch_assoc()) {
            $data[$row['month']] = [
                "amount" => (float)$row['amount'],
                "week1" => (float)$row['week1'],
                "week2" => (float)$row['week2'],
                "week3" => (float)$row['week3'],
                "week4" => (float)$row['week4'],
            ];
        }
        
        // Fill missing months
        $finalData = [];
        for ($i = 1; $i <= 12; $i++) {
            $existing = $data[$i] ?? null;
            $finalData[] = [
                "month" => $i,
                "amount" => $existing ? $existing['amount'] : 0,
                "week1" => $existing ? $existing['week1'] : 0,
                "week2" => $existing ? $existing['week2'] : 0,
                "week3" => $existing ? $existing['week3'] : 0,
                "week4" => $existing ? $existing['week4'] : 0,
            ];
        }
        
        return $finalData;
    }
}
?>