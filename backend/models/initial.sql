CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gateway ENUM('Chapa', 'Tele Birr') NOT NULL,
    tx_ref VARCHAR(255) NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
    status ENUM('Paid', 'Pending', 'Failed') NOT NULL,
    user_name VARCHAR(255) NOT NULL,  -- Added field for user name
    email VARCHAR(255) NOT NULL,  -- Added field for user name
    phone_number VARCHAR(20) NOT NULL,  -- Added field for phone number
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_id INT DEFAULT NULL
);
