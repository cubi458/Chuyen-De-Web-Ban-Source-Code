CREATE DATABASE IF NOT EXISTS sourcecode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sourcecode;

CREATE TABLE IF NOT EXISTS user_accounts (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  email_verified TINYINT(1) NOT NULL DEFAULT 0,
  role VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(128) NOT NULL UNIQUE,
  user_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_user FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(128) NOT NULL,
  quantity INT NOT NULL,
  license VARCHAR(32) NOT NULL,
  support_plan VARCHAR(32) NOT NULL,
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE,
  INDEX idx_cart_user (user_id)
);

CREATE TABLE IF NOT EXISTS order_records (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  subtotal DOUBLE NOT NULL,
  discount_code VARCHAR(64),
  discount_amount DOUBLE NOT NULL,
  total DOUBLE NOT NULL,
  payment_method VARCHAR(64),
  status VARCHAR(32) NOT NULL,
  note TEXT,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE,
  INDEX idx_order_user_created (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(128) NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  price DOUBLE NOT NULL,
  quantity INT NOT NULL,
  license VARCHAR(32) NOT NULL,
  CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES order_records(id) ON DELETE CASCADE,
  INDEX idx_order_item_order (order_id)
);

CREATE TABLE IF NOT EXISTS review_records (
  id VARCHAR(64) PRIMARY KEY,
  product_id VARCHAR(128) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES user_accounts(id) ON DELETE CASCADE,
  INDEX idx_review_product_created (product_id, created_at)
);

CREATE TABLE IF NOT EXISTS product_records (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  price DOUBLE NOT NULL,
  category_id VARCHAR(64) NOT NULL,
  tech_stack TEXT,
  repository VARCHAR(500),
  description TEXT,
  zip_file_name VARCHAR(255),
  zip_file_path VARCHAR(500),
  created_by VARCHAR(64),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_created_by FOREIGN KEY (created_by) REFERENCES user_accounts(id) ON DELETE SET NULL,
  INDEX idx_product_category_created (category_id, created_at)
);
