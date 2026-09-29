<?php
require_once __DIR__ . '/../config/db.php';

class RecurringExpense {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Add a new recurring template
    public function add($user_id, $category_id, $amount, $frequency, $start_date, $description, $sub_category_id, $source) {
        $stmt = $this->conn->prepare("
            INSERT INTO recurring_expenses 
            (user_id, category_id, sub_category_id, amount, frequency, start_date, next_due_date, description, source, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        ");
        
        // Initial next_due_date is the start_date
        $next_due = $start_date;
        $sub_cat = !empty($sub_category_id) ? $sub_category_id : NULL;
        
        $stmt->bind_param("iiidsssss", $user_id, $category_id, $sub_cat, $amount, $frequency, $start_date, $next_due, $description, $source);
        return $stmt->execute();
    }

    // The Engine: Checks for due items and generates future_expenses
    public function processDueExpenses($user_id) {
        // Look ahead 7 days to generate bills slightly in advance
        $targetDate = date('Y-m-d', strtotime('+7 days'));
        
        // Find all active templates where next_due_date is <= 7 days from now
        $stmt = $this->conn->prepare("SELECT * FROM recurring_expenses WHERE user_id = ? AND status = 'ACTIVE' AND next_due_date <= ?");
        $stmt->bind_param("is", $user_id, $targetDate);
        $stmt->execute();
        $templates = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        
        $count = 0;

        foreach ($templates as $t) {
            $nextDate = $t['next_due_date'];
            
            // Loop to generate bills up to the target date (handles missed months)
            while ($nextDate <= $targetDate) {
                
                // A. Check if this specific future expense already exists (Prevent Duplicates)
                // We check: Same User, Same Category, Same Amount, Same Date, Still Pending
                $check = $this->conn->prepare("SELECT id FROM future_expenses WHERE user_id = ? AND category_id = ? AND amount = ? AND date = ? AND status = 'PENDING'");
                $check->bind_param("iids", $user_id, $t['category_id'], $t['amount'], $nextDate);
                $check->execute();
                
                if ($check->get_result()->num_rows == 0) {
                    // It doesn't exist, so insert it
                    $ins = $this->conn->prepare("
                        INSERT INTO future_expenses (user_id, category_id, sub_category_id, amount, date, description, source, status) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
                    ");
                    
                    // Append (Auto-Generated) to description
                    $desc = $t['description'] . " (Recurring: " . $t['frequency'] . ")";
                    $ins->bind_param("iiidsss", $user_id, $t['category_id'], $t['sub_category_id'], $t['amount'], $nextDate, $desc, $t['source']);
                    $ins->execute();
                    $count++;
                }
                
                // B. Calculate NEXT due date based on frequency
                $dateObj = new DateTime($nextDate);
                if ($t['frequency'] === 'Weekly') {
                    $dateObj->modify('+1 week');
                } elseif ($t['frequency'] === 'Monthly') {
                    $dateObj->modify('+1 month');
                } elseif ($t['frequency'] === 'Yearly') {
                    $dateObj->modify('+1 year');
                }
                $nextDate = $dateObj->format('Y-m-d');
            }

            // C. Update the template with the new future date so we don't process again
            $upd = $this->conn->prepare("UPDATE recurring_expenses SET next_due_date = ? WHERE id = ?");
            $upd->bind_param("si", $nextDate, $t['id']);
            $upd->execute();
        }

        return $count; // Return how many items were generated
    }
}
?>