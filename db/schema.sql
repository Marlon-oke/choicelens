-- ChoiceLens schema (MySQL/MariaDB). Bisa dijalankan dari phpMyAdmin (tab SQL)
-- atau via: node db/setup.mjs
CREATE DATABASE IF NOT EXISTS choicelens
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE choicelens;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wallets (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY,
  balance INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallets_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS token_orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nota VARCHAR(32) NOT NULL DEFAULT '',
  user_id INT UNSIGNED NOT NULL,
  qty INT NOT NULL,
  amount_rp INT NOT NULL,
  status ENUM('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  INDEX idx_orders_user (user_id, status),
  UNIQUE KEY uq_orders_nota (nota)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS compare_history (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  kind ENUM('curated','custom') NOT NULL,
  ref_a VARCHAR(120) NOT NULL,
  ref_b VARCHAR(120) NOT NULL,
  summary VARCHAR(255) NOT NULL DEFAULT '',
  cost INT NOT NULL DEFAULT 2,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_history_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE,
  UNIQUE KEY uq_history_view (user_id, kind, ref_a, ref_b),
  INDEX idx_history_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlist (
  user_id INT UNSIGNED NOT NULL,
  product_id VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  CONSTRAINT fk_wishlist_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Katalog produk (sumber utama; lib/data.ts hanya fallback).
-- Kolom *_json menyimpan objek JSON: {"Chipset": "..."} / {"Chipset": 90}.
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(120) NOT NULL PRIMARY KEY,
  category ENUM('smartphones','laptops','shoes') NOT NULL,
  name VARCHAR(150) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  img VARCHAR(255) NOT NULL DEFAULT '',
  score INT NOT NULL DEFAULT 0,
  keywords VARCHAR(255) NOT NULL DEFAULT '',
  strengths_json TEXT NOT NULL,
  specs_json TEXT NOT NULL,
  ratings_json TEXT NOT NULL,
  variants_json TEXT NULL,
  affiliate_json TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
