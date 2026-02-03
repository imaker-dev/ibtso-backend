# 🚀 MongoDB Migration - Quick Installation

## ⚡ Quick Start (5 Steps)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Update .env File
```env
MONGO_URI=mongodb://localhost:27017/asset_tracking
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
DEFAULT_ADMIN_EMAIL=admin@ibtso.com
DEFAULT_ADMIN_PASSWORD=ibtso@$2026
```

### Step 3: Start MongoDB
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Step 4: Reset Database
```bash
node reset-database-mongodb.js
```

### Step 5: Start Server
```bash
npm run dev
```

---

## ✅ Verification

### Test Health Endpoint
```bash
curl http://localhost:5000/api/v1/health
```

### Login as Admin
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ibtso.com","password":"ibtso@$2026"}'
```

---

## 📚 Full Documentation

- **Installation Guide**: `MONGODB_INSTALLATION_GUIDE.md`
- **Migration Summary**: `MIGRATION_SUMMARY.md`
- **Environment Template**: `.env.example`

---

## ⚠️ Important

- All previous JWT tokens are invalid after database reset
- Must login again to get new token
- All API endpoints remain 100% compatible
- No changes needed to frontend/client code

---

## 🆘 Quick Troubleshooting

**MongoDB not starting?**
```bash
mongosh  # Test connection
```

**Old tokens not working?**
- Login again to get new token

**Validation errors?**
- Use MongoDB ObjectId format (24 hex chars)

---

**Migration Complete! All APIs working with MongoDB backend.**
