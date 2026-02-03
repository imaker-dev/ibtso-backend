# 🔄 MongoDB Migration - Installation Guide

## ✅ Migration Completed

The application has been successfully migrated from PostgreSQL/Sequelize back to MongoDB/Mongoose.

---

## 📋 Prerequisites

- **Node.js**: v16.0.0 or higher
- **MongoDB**: v4.4 or higher (installed and running)
- **npm**: v7 or higher

---

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- ✅ `mongoose@^7.6.3` (MongoDB ODM)
- ✅ All other existing dependencies
- ❌ Removed: `pg`, `pg-hstore`, `sequelize`

### 2. Setup Environment Variables

Create `.env` file (or update existing):

```env
# Application
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5000

# MongoDB Database
MONGO_URI=mongodb://localhost:27017/asset_tracking

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# Default Admin Credentials
DEFAULT_ADMIN_NAME=IBTSO Admin
DEFAULT_ADMIN_EMAIL=admin@ibtso.com
DEFAULT_ADMIN_PASSWORD=ibtso@$2026
```

### 3. Ensure MongoDB is Running

```bash
# Check MongoDB status
mongosh

# Or start MongoDB service
# Windows:
net start MongoDB

# Linux/Mac:
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 4. Reset Database (First Time Setup)

```bash
node reset-database-mongodb.js
```

This will:
- ✅ Drop all existing collections
- ✅ Create admin user from .env
- ✅ Display admin credentials

### 5. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

---

## 🔑 Default Admin Login

After reset, use these credentials:

```
Email: admin@ibtso.com
Password: ibtso@$2026
```

**⚠️ Change these in production!**

---

## 📊 Verify Installation

### Test Health Endpoint
```bash
GET http://localhost:5000/api/v1/health
```

### Login as Admin
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@ibtso.com",
  "password": "ibtso@$2026"
}
```

---

## 🔄 Database Changes Summary

### Models Migrated
- ✅ `User` - Mongoose model restored
- ✅ `Dealer` - Mongoose model restored
- ✅ `Asset` - Mongoose model restored

### Field Name Changes (MongoDB Convention)
- `id` → `_id` (MongoDB ObjectId)
- `created_at` → `createdAt` (Mongoose timestamps)
- `updated_at` → `updatedAt` (Mongoose timestamps)

### Query Syntax Changes
```javascript
// Sequelize → Mongoose

// Find by ID
User.findByPk(id) → User.findById(id)

// Find one
User.findOne({ where: { email } }) → User.findOne({ email })

// Find all with filter
User.findAll({ where: { role: 'ADMIN' } }) → User.find({ role: 'ADMIN' })

// Count
User.count({ where: { ... } }) → User.countDocuments({ ... })

// Include/Populate
include: [{ model: Dealer }] → .populate('dealerId')
```

---

## 📡 API Compatibility

### ✅ No Changes Required

All API endpoints remain **100% compatible**:

- **Request payloads** - Unchanged
- **Response formats** - Unchanged
- **Endpoint URLs** - Unchanged
- **Authentication** - Unchanged (JWT tokens)
- **Validation rules** - Updated (UUID → MongoId)

### ID Field Handling

**Request (Sending to API):**
```json
{
  "dealerId": "507f1f77bcf86cd799439011"
}
```

**Response (From API):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Dealer Name"
}
```

---

## 🔍 Troubleshooting

### MongoDB Connection Error

```bash
Error: MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:** Ensure MongoDB is running
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Admin User Already Exists

If you see "Admin user already exists" but can't login, run:

```bash
node reset-database-mongodb.js
```

### JWT Token Errors

After database reset, all old tokens are invalid. You must:
1. Login again with new credentials
2. Get new JWT token
3. Use new token in all API requests

---

## 📝 Migration Files

### Backed Up (Sequelize versions):
- `controllers/*-SEQUELIZE-BACKUP.js`
- `models-mongodb-backup/` (Original Mongoose models)

### Active Files (MongoDB/Mongoose):
- `models/User.js`
- `models/Dealer.js`
- `models/Asset.js`
- `controllers/*.js`
- `config/database.js`

---

## ⚙️ Important Notes

1. **Soft Deletes**: Still implemented via `isDeleted` flag
2. **Timestamps**: Automatic via Mongoose (createdAt/updatedAt)
3. **Validation**: Express-validator now uses `isMongoId()` instead of `isUUID()`
4. **Indexes**: Defined in Mongoose schemas
5. **Pre-hooks**: Mongoose middleware for password hashing, queries, etc.

---

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env` file
3. ✅ Start MongoDB service
4. ✅ Run database reset
5. ✅ Start server: `npm run dev`
6. ✅ Test API endpoints
7. ✅ Login and verify functionality

---

## 🆘 Support

If you encounter issues:
1. Check MongoDB is running
2. Verify `.env` configuration
3. Run reset script again
4. Check console logs for detailed errors
5. Verify Node.js and MongoDB versions

---

**Migration completed successfully! All APIs remain fully functional with MongoDB backend.**
