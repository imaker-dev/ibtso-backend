-- Reset Database - Clear all data and keep only admin user
-- Database: asset_tracking

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Delete all assets
DELETE FROM assets;

-- Delete all dealers
DELETE FROM dealers;

-- Delete all users except admin
DELETE FROM users WHERE role != 'ADMIN';

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Verify remaining data
SELECT 'Users count:' as info, COUNT(*) as count FROM users;
SELECT 'Dealers count:' as info, COUNT(*) as count FROM dealers;
SELECT 'Assets count:' as info, COUNT(*) as count FROM assets;

-- Show admin user
SELECT id, name, email, role, is_active, created_at FROM users WHERE role = 'ADMIN';
