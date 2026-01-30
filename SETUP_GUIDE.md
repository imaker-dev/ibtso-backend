# IBTSO Asset Tracking - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
Copy the example environment file and update with your settings:
```bash
cp .env.example .env
```

**Edit `.env` file:**
```env
NODE_ENV=development
PORT=5000
APP_URL=http://localhost:5000

MONGO_URI=mongodb://localhost:27017/ibtso_asset_tracking
JWT_SECRET=change_this_to_a_random_secret_string
JWT_EXPIRE=7d
DEFAULT_ADMIN_EMAIL=admin@ibtso.com
DEFAULT_ADMIN_PASSWORD=Admin@123
DEFAULT_ADMIN_NAME=IBTSO Admin
```

**Important Configuration Notes:**
- `APP_URL`: Base URL for generating barcode image URLs. Change this to your production domain (e.g., `https://api.yourdomain.com`)
- `JWT_SECRET`: Change to a strong random string in production
- `PORT`: Default is 5000, change if needed

### Step 3: Start MongoDB
Make sure MongoDB is running on your system:

**Windows:**
```bash
# Start MongoDB service
net start MongoDB
```

**Mac/Linux:**
```bash
# Start MongoDB
mongod
# OR if using brew
brew services start mongodb-community
```

**Using Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Run the Application
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### Step 5: Verify Installation
Open your browser or API client and visit:
```
http://localhost:5000/api/v1/health
```

You should see:
```json
{
  "success": true,
  "message": "IBTSO Asset Tracking API is running",
  "timestamp": "2024-01-29T..."
}
```

---

## 🔐 Default Admin Login

The system automatically creates a default admin account on first run:

**Credentials:**
- Email: `admin@ibtso.com`
- Password: `Admin@123`

**First Login:**
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@ibtso.com",
  "password": "Admin@123"
}
```

**Response will include:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Save this token!** Use it in Authorization header for all subsequent requests:
```
Authorization: Bearer <your_token_here>
```

---

## 📝 Testing Workflow

### 1. Login as Admin
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@ibtso.com",
  "password": "Admin@123"
}
```

### 2. Create a Dealer
```http
POST http://localhost:5000/api/v1/dealers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Test Dealer",
  "phone": "+1234567890",
  "email": "dealer@test.com",
  "shopName": "Test Electronics Shop",
  "vatRegistration": "VAT12345",
  "location": {
    "address": "123 Test Street, Test City",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response includes temporary password for the dealer!**

### 3. Login as Dealer
Use the temporary password from step 2:
```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "dealer@test.com",
  "password": "<temporary_password_from_step_2>"
}
```

### 4. Change Dealer Password (First Login)
```http
PUT http://localhost:5000/api/v1/auth/change-password
Authorization: Bearer <dealer_token>
Content-Type: application/json

{
  "currentPassword": "<temporary_password>",
  "newPassword": "NewSecurePassword@123"
}
```

### 5. Create an Asset
```http
POST http://localhost:5000/api/v1/assets
Authorization: Bearer <dealer_token>
Content-Type: application/json

{
  "fixtureNo": "FIX-001",
  "assetNo": "ASSET-001",
  "dimension": {
    "length": 100,
    "height": 200,
    "depth": 50,
    "unit": "cm"
  },
  "standType": "Wall Mount",
  "brand": "Samsung",
  "dealerId": "<dealer_id_from_step_2>",
  "installationDate": "2024-01-15",
  "location": {
    "address": "Store Location",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**Response includes barcode image URL and barcode value!**

### 6. Scan the Barcode
```http
GET http://localhost:5000/api/v1/barcodes/scan/<barcodeValue_from_step_5>
Authorization: Bearer <token>
```

---

## 🎨 API Testing Tools

### Option 1: Using Postman

1. Download Postman: https://www.postman.com/downloads/
2. Create a new collection named "IBTSO Asset Tracking"
3. Set base URL as environment variable: `{{base_url}}` = `http://localhost:5000/api/v1`
4. Set token as environment variable: `{{token}}` = `<your_jwt_token>`
5. Add Authorization header: `Bearer {{token}}`

### Option 2: Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ibtso.com","password":"Admin@123"}'
```

**Create Dealer:**
```bash
curl -X POST http://localhost:5000/api/v1/dealers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Dealer",
    "phone": "+1234567890",
    "email": "dealer@test.com",
    "shopName": "Test Shop",
    "vatRegistration": "VAT12345",
    "location": {
      "address": "123 Test St",
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }'
```

### Option 3: Using VS Code REST Client

Install "REST Client" extension and create a file `api-tests.http`:

```http
### Variables
@baseUrl = http://localhost:5000/api/v1
@token = your_token_here

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "admin@ibtso.com",
  "password": "Admin@123"
}

### Get Dashboard
GET {{baseUrl}}/dashboard/admin
Authorization: Bearer {{token}}
```

---

## 🗂️ Database Management

### View Data in MongoDB

**Using MongoDB Compass:**
1. Download: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Database: `ibtso_asset_tracking`
4. Collections: `users`, `dealers`, `assets`

**Using Mongo Shell:**
```bash
mongo
use ibtso_asset_tracking
db.users.find().pretty()
db.dealers.find().pretty()
db.assets.find().pretty()
```

### Reset Database
```bash
mongo
use ibtso_asset_tracking
db.dropDatabase()
```

Then restart the server to recreate the default admin.

---

## 🐛 Troubleshooting

### Issue: MongoDB Connection Error
**Error:** `MongoNetworkError: failed to connect to server`

**Solution:**
1. Make sure MongoDB is running
2. Check `MONGO_URI` in `.env` file
3. Verify MongoDB port (default: 27017)

### Issue: Port Already in Use
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
1. Change `PORT` in `.env` file
2. Or kill the process using port 5000:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:5000 | xargs kill -9
   ```

### Issue: JWT Token Expired
**Error:** `Your token has expired. Please log in again`

**Solution:**
1. Login again to get a new token
2. Increase `JWT_EXPIRE` in `.env` (e.g., `30d`)

### Issue: Barcode Image Not Loading
**Error:** 404 on barcode image URL

**Solution:**
1. Check if `uploads/barcodes` folder exists
2. Verify file permissions
3. Make sure server is serving static files from `/uploads`

---

## 📊 Production Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/ibtso_asset_tracking
JWT_SECRET=use_a_very_strong_random_secret_here
JWT_EXPIRE=7d
```

### Security Checklist
- [ ] Change default admin password
- [ ] Use strong JWT secret (min 32 characters)
- [ ] Use MongoDB Atlas or managed database
- [ ] Enable HTTPS/SSL
- [ ] Set up rate limiting
- [ ] Configure CORS for specific domains
- [ ] Set up monitoring and logging
- [ ] Regular database backups
- [ ] Environment variables in secure vault

### Recommended Hosting Platforms
- **Backend**: Heroku, Railway, DigitalOcean, AWS EC2
- **Database**: MongoDB Atlas (free tier available)
- **File Storage**: AWS S3, Cloudinary (for barcode images)

---

## 📈 Performance Tips

1. **Enable MongoDB Indexes** (already configured in models)
2. **Use Pagination** on all list endpoints
3. **Cache frequently accessed data** (Redis)
4. **Compress responses** (compression middleware)
5. **Limit request size** (body-parser limits)
6. **Monitor with PM2** in production

---

## 🔄 Updates and Maintenance

### Update Dependencies
```bash
npm update
npm audit fix
```

### Backup Database
```bash
mongodump --db ibtso_asset_tracking --out ./backup
```

### Restore Database
```bash
mongorestore --db ibtso_asset_tracking ./backup/ibtso_asset_tracking
```

---

## 📞 Need Help?

- **Documentation**: See README.md
- **API Docs**: See README.md API section
- **Issues**: Create an issue in the repository

---

**Happy Coding! 🚀**
