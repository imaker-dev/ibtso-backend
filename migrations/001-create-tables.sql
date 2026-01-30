-- PostgreSQL Migration Script
-- Creates all tables for IBTSO Barcode Application
-- Database: asset_tracking

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'DEALER' CHECK (role IN ('ADMIN', 'DEALER')),
  dealer_ref UUID,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  password_changed_at TIMESTAMP,
  is_temporary_password BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Dealers table
CREATE TABLE IF NOT EXISTS dealers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dealer_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  vat_registration VARCHAR(100) UNIQUE NOT NULL,
  location JSONB NOT NULL,
  user_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dealer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_dealer_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

-- Create Assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fixture_no VARCHAR(100) NOT NULL,
  asset_no VARCHAR(100) UNIQUE NOT NULL,
  dimension JSONB NOT NULL,
  stand_type VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  dealer_id UUID NOT NULL,
  installation_date DATE NOT NULL,
  location JSONB NOT NULL,
  barcode_value VARCHAR(100) UNIQUE NOT NULL,
  barcode_image_path VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED')),
  is_deleted BOOLEAN DEFAULT false,
  created_by UUID NOT NULL,
  updated_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_asset_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asset_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_asset_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_installation_date CHECK (installation_date <= CURRENT_DATE)
);

-- Add foreign key for dealer_ref in users (after dealers table exists)
ALTER TABLE users
ADD CONSTRAINT fk_user_dealer_ref FOREIGN KEY (dealer_ref) REFERENCES dealers(id) ON DELETE SET NULL;

-- Create indexes for Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);

-- Create indexes for Dealers
CREATE INDEX IF NOT EXISTS idx_dealers_dealer_code ON dealers(dealer_code);
CREATE INDEX IF NOT EXISTS idx_dealers_email ON dealers(email);
CREATE INDEX IF NOT EXISTS idx_dealers_vat_registration ON dealers(vat_registration);
CREATE INDEX IF NOT EXISTS idx_dealers_is_deleted ON dealers(is_deleted);
CREATE INDEX IF NOT EXISTS idx_dealers_user_id ON dealers(user_id);
CREATE INDEX IF NOT EXISTS idx_dealers_created_by ON dealers(created_by);

-- Create indexes for Assets
CREATE INDEX IF NOT EXISTS idx_assets_barcode_value ON assets(barcode_value);
CREATE INDEX IF NOT EXISTS idx_assets_asset_no ON assets(asset_no);
CREATE INDEX IF NOT EXISTS idx_assets_dealer_id ON assets(dealer_id);
CREATE INDEX IF NOT EXISTS idx_assets_fixture_no_dealer ON assets(fixture_no, dealer_id);
CREATE INDEX IF NOT EXISTS idx_assets_brand ON assets(brand);
CREATE INDEX IF NOT EXISTS idx_assets_is_deleted ON assets(is_deleted);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at BEFORE UPDATE ON dealers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify tables created
SELECT 'Users table created' as message WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users');
SELECT 'Dealers table created' as message WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dealers');
SELECT 'Assets table created' as message WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assets');

-- Show table structure
\d users
\d dealers
\d assets
