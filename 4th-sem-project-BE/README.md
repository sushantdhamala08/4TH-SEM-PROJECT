# 4th-sem-project-BE

Step 1: Clone this repository if not created

````bash

git clone https://github.com/questraj/4th-sem-project-BE.git

````
Step 2: If already cloned then run 
````bash 

git pull

````
This will update your code to the latest version that is pushed to origin. Note: It is always a good practice to run git pull before working on a project

Step 3: Open the repository in VS code or your text editor and run 
```` bash

php -v

````
If you get an error saying php is not recognized add the folder that contains php.exe to your environment

Step 4: If you have already created the database skip this step else Open XAMPP and run MYSQL and Apache and go to 

````bash
localhost/phpmyadmin
````
and create a new database called expense_tracker and in the SQL section paste this code and run

````bash

-- =============================================
-- 1. DATABASE SETUP
-- =============================================
DROP DATABASE IF EXISTS expense_tracker;
CREATE DATABASE expense_tracker;
USE expense_tracker;

-- =============================================
-- 2. USERS TABLE (UPDATED WITH OTP COLUMNS)
-- =============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'parent', 'admin') NOT NULL DEFAULT 'student',
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) DEFAULT NULL,
    bank_account_no VARCHAR(50) DEFAULT NULL,
    is_verified TINYINT(1) DEFAULT 0,   -- NEW: 0 = unverified, 1 = verified
    otp VARCHAR(6) DEFAULT NULL,        -- NEW: Stores the 6-digit code
    otp_expiry DATETIME DEFAULT NULL,   -- NEW: Stores when the OTP expires
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 3. FAMILY LINKING
-- =============================================
CREATE TABLE family_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('PENDING', 'ACTIVE') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_family_link (parent_id, student_id)
);

-- =============================================
-- 4. LOGGING & AUDIT
-- =============================================
CREATE TABLE transaction_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 5. CATEGORIES & SUB-CATEGORIES
-- =============================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL, 
    category_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE sub_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- 6. BUDGETING
-- =============================================
CREATE TABLE monthly_budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    week1 DECIMAL(10, 2) DEFAULT 0,
    week2 DECIMAL(10, 2) DEFAULT 0,
    week3 DECIMAL(10, 2) DEFAULT 0,
    week4 DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_month_year_budget (user_id, year, month)
);

CREATE TABLE category_budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_category (user_id, category_id)
);

CREATE TABLE budgets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(20) DEFAULT 'Monthly',
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_budget_type (user_id, type)
);

-- =============================================
-- 7. INCOME MODULE
-- =============================================
CREATE TABLE incomes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    source VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE monthly_income_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    year INT NOT NULL,
    month INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_month_year_income (user_id, year, month)
);

-- =============================================
-- 8. EXPENSES
-- =============================================
CREATE TABLE future_expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    sub_category_id INT DEFAULT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL, 
    description TEXT,
    source VARCHAR(50) DEFAULT 'Cash',
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    sub_category_id INT DEFAULT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    source VARCHAR(50) DEFAULT 'Cash',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE recurring_expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    sub_category_id INT DEFAULT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    frequency ENUM('Weekly', 'Monthly', 'Yearly') NOT NULL,
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    description TEXT,
    source VARCHAR(50) DEFAULT 'Cash',
    status ENUM('ACTIVE', 'PAUSED', 'CANCELLED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE expense_bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    expense_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

-- =============================================
-- 9. SEED DATA
-- =============================================
INSERT INTO categories (id, category_name) VALUES 
(1, 'Food'), (2, 'Transport'), (3, 'Utilities'), (4, 'Entertainment'), 
(5, 'Health'), (6, 'Shopping'), (7, 'Education');

-- Add an admin user (Password: password). Set to is_verified = 1 automatically.
INSERT INTO users (email, password, role, first_name, last_name, is_verified) VALUES 
('admin@admin.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'System', 'Admin', 1);

````
Step 5: Run this in terminal to start server

````bash
php -S localhost:8000
````