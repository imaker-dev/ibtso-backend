# IBTSO Asset Tracking Platform

> Production-ready backend API for managing assets, dealers, and barcode-based tracking system built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Role-Based Access Control** (ADMIN & DEALER)
- **JWT Authentication** with secure password management
- **Dealer Onboarding** with auto-generated credentials
- **Asset/Fixture Management** with location tracking
- **QR Code Generation** with high error correction
- **QR Code Scanning** for instant asset details retrieval
- **Dashboard Analytics** for both admin and dealers
- **Comprehensive Validations** and error handling
- **Pagination & Search** across all list endpoints
- **Soft Delete** implementation
- **Audit Trail** tracking

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Models](#database-models)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [User Roles](#user-roles)
- [QR Code Format](#qr-code-format)
- [Error Handling](#error-handling)
- [Security Features](#security-features)

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **QR Code Generation**: qrcode
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit

---

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd barcode
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```
Edit `.env` file with your configurations.

4. **Start MongoDB**
```bash
# If using local MongoDB
mongod
```

5. **Run the application**
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

6. **Server will start on**
```
http://localhost:5000
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000

# Base URL for barcode image URLs (IMPORTANT: Change in production)
APP_URL=http://localhost:5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/ibtso_asset_tracking

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Default Admin Credentials
DEFAULT_ADMIN_EMAIL=admin@ibtso.com
DEFAULT_ADMIN_PASSWORD=ibtso@$2026
DEFAULT_ADMIN_NAME=IBTSO Admin

# File Storage
BARCODE_STORAGE_PATH=./uploads/barcodes
```

**Important:** 
- `APP_URL` is used to generate full barcode image URLs in API responses
- In production, set this to your domain: `https://api.yourdomain.com` or `https://yourdomain.com`
- This ensures barcode images are accessible from anywhere

---

## 📊 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['ADMIN', 'DEALER'],
  dealerRef: ObjectId (ref: Dealer),
  isActive: Boolean,
  isDeleted: Boolean,
  lastLogin: Date,
  isTemporaryPassword: Boolean
}
```

### Dealer Model
```javascript
{
  dealerCode: String (unique, auto-generated),
  name: String,
  phone: String,
  email: String (unique),
  shopName: String,
  vatRegistration: String (unique),
  location: {
    address: String,
    latitude: Number,
    longitude: Number,
    googleMapLink: String
  },
  userId: ObjectId (ref: User),
  isActive: Boolean,
  isDeleted: Boolean,
  createdBy: ObjectId (ref: User)
}
```

### Asset Model
```javascript
{
  fixtureNo: String,
  assetNo: String (unique),
  dimension: {
    length: Number,
    height: Number,
    depth: Number,
    unit: String
  },
  standType: String,
  brand: String,
  dealerId: ObjectId (ref: Dealer),
  installationDate: Date,
  location: {
    address: String,
    latitude: Number,
    longitude: Number,
    googleMapLink: String
  },
  barcodeValue: String (unique, auto-generated),
  barcodeImagePath: String,
  barcodeImageUrl: String,
  status: Enum ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED'],
  isDeleted: Boolean,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User)
}
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Common Headers
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <JWT_TOKEN>"
}
```

---

## 🔑 Authentication APIs

### 1. Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "admin@ibtso.com",
  "password": "ibtso@$2026"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64abc123...",
    "name": "IBTSO Admin",
    "email": "admin@ibtso.com",
    "role": "ADMIN",
    "dealerRef": null,
    "isTemporaryPassword": false
  }
}
```

### 2. Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### 3. Change Password
```http
PUT /api/v1/auth/change-password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

### 4. Update Profile
```http
PUT /api/v1/auth/update-profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com"
}
```

---

## 👥 Dealer Management APIs

### 1. Create Dealer (ADMIN Only)
```http
POST /api/v1/dealers
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "shopName": "Doe Electronics",
  "vatRegistration": "VAT123456789",
  "location": {
    "address": "123 Main St, City, Country",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dealer created successfully",
  "data": {
    "dealer": {
      "_id": "64abc...",
      "dealerCode": "DLR-JOHN-1234-ABC",
      "name": "John Doe",
      "email": "john@example.com",
      ...
    },
    "credentials": {
      "email": "john@example.com",
      "temporaryPassword": "TempPass@123",
      "message": "Please share these credentials with the dealer..."
    }
  }
}
```

### 2. Get All Dealers
```http
GET /api/v1/dealers?page=1&limit=10&search=john&isActive=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by name, email, dealerCode, shopName
- `isActive` (optional): Filter by active status (true/false)

### 3. Get Dealer by ID (with all assets)
```http
GET /api/v1/dealers/:id
Authorization: Bearer <token>
```

**Returns:** Dealer information + complete list of all their assets

### 4. Update Dealer (ADMIN Only)
```http
PUT /api/v1/dealers/:id
Authorization: Bearer <admin_token>
```

### 5. Delete Dealer (ADMIN Only - Soft Delete)
```http
DELETE /api/v1/dealers/:id
Authorization: Bearer <admin_token>
```

### 6. Toggle Dealer Status (ADMIN Only)
```http
PATCH /api/v1/dealers/:id/toggle-status
Authorization: Bearer <admin_token>
```

### 7. Reset Dealer Password (ADMIN Only)
```http
POST /api/v1/dealers/:id/reset-password
Authorization: Bearer <admin_token>
```

### 8. Get Dealer Statistics
```http
GET /api/v1/dealers/stats/:id
Authorization: Bearer <token>

# For dealer's own stats
GET /api/v1/dealers/my-stats
Authorization: Bearer <dealer_token>
```

---

## 📦 Asset/Fixture Management APIs

### 1. Create Asset
```http
POST /api/v1/assets
Authorization: Bearer <token>
```

**Request Body:**
```json
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
  "dealerId": "64abc123...",
  "installationDate": "2024-01-15",
  "location": {
    "address": "123 Store Street",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
  },
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "_id": "64def...",
    "fixtureNo": "FIX-001",
    "assetNo": "ASSET-001",
    "barcodeValue": "IBTSO-DLR-JOHN-1234-ABC-FIX-001-2024-123456",
    "barcodeImageUrl": "http://localhost:5000/uploads/barcodes/...",
    "dealerId": { ... },
    ...
  }
}
```

### 2. Get All Assets
```http
GET /api/v1/assets?page=1&limit=10&search=samsung&brand=Samsung&status=ACTIVE&dealerId=64abc
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`, `limit`: Pagination
- `search`: Search by fixtureNo, assetNo, brand, barcodeValue
- `brand`: Filter by brand
- `status`: Filter by status (ACTIVE, INACTIVE, MAINTENANCE, DAMAGED)
- `dealerId`: Filter by dealer (ADMIN only)
- `startDate`, `endDate`: Filter by installation date range

### 3. Get Asset by ID
```http
GET /api/v1/assets/:id
Authorization: Bearer <token>
```

### 4. Update Asset
```http
PUT /api/v1/assets/:id
Authorization: Bearer <token>
```

### 5. Delete Asset (ADMIN Only - Soft Delete)
```http
DELETE /api/v1/assets/:id
Authorization: Bearer <admin_token>
```

### 6. Update Asset Status
```http
PATCH /api/v1/assets/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "MAINTENANCE"
}
```

### 7. Get Assets by Dealer
```http
GET /api/v1/assets/dealer/:dealerId?page=1&limit=10
Authorization: Bearer <token>
```

### 8. Get All Brands
```http
GET /api/v1/assets/brands
Authorization: Bearer <token>
```

---

## 📸 Barcode APIs

### 1. Scan Barcode
```http
GET /api/v1/barcodes/scan/:barcodeValue
Authorization: Bearer <token>
```

**Example:**
```http
GET /api/v1/barcodes/scan/IBTSO-DLR-JOHN-1234-ABC-FIX-001-2024-123456
```

**Response:**
```json
{
  "success": true,
  "message": "Asset details retrieved successfully",
  "data": {
    "asset": {
      "_id": "64def...",
      "fixtureNo": "FIX-001",
      "assetNo": "ASSET-001",
      "barcodeValue": "IBTSO-DLR-JOHN-1234-ABC-FIX-001-2024-123456",
      "barcodeImageUrl": "http://localhost:5000/uploads/barcodes/...",
      "dimension": { ... },
      "standType": "Wall Mount",
      "brand": "Samsung",
      "status": "ACTIVE",
      "installationDate": "2024-01-15",
      "location": { ... }
    },
    "dealer": {
      "dealerCode": "DLR-JOHN-1234-ABC",
      "name": "John Doe",
      "shopName": "Doe Electronics",
      "email": "john@example.com",
      "phone": "+1234567890",
      "location": { ... },
      "vatRegistration": "VAT123456789"
    },
    "audit": {
      "createdBy": { ... },
      "updatedBy": { ... }
    }
  }
}
```

### 2. Download Barcode
```http
GET /api/v1/barcodes/download/:assetId
Authorization: Bearer <token>
```

### 3. Regenerate Barcode (ADMIN Only)
```http
POST /api/v1/barcodes/regenerate/:assetId
Authorization: Bearer <admin_token>
```

### 4. Generate Barcode Preview (ADMIN Only)
```http
POST /api/v1/barcodes/preview
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "dealerCode": "DLR-JOHN-1234-ABC",
  "fixtureNo": "FIX-001"
}
```

### 5. Validate Barcode
```http
POST /api/v1/barcodes/validate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "barcodeValue": "IBTSO-DLR-JOHN-1234-ABC-FIX-001-2024-123456"
}
```

### 6. Get All Barcodes for Dealer (ADMIN Only) 🆕
```http
GET /api/v1/barcodes/dealer/:dealerId/all
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Barcodes retrieved successfully",
  "data": {
    "dealer": {
      "dealerId": "64def456789012",
      "dealerCode": "DLR-JOHN-1234-ABC",
      "name": "John Doe",
      "shopName": "Doe Electronics Store",
      "email": "john@example.com"
    },
    "totalBarcodes": 25,
    "barcodes": [
      {
        "assetId": "64xyz123456789",
        "fixtureNo": "FIX-001",
        "assetNo": "ASSET-001",
        "barcodeValue": "IBTSO-DLR-JOHN-1234-ABC-FIX-001-2024-123456",
        "barcodeImageUrl": "http://localhost:5000/uploads/barcodes/...",
        "brand": "Samsung",
        "status": "ACTIVE",
        "createdAt": "2024-01-29T10:00:00.000Z"
      }
    ]
  }
}
```

### 7. Download All Barcodes as PDF (ADMIN Only) 🆕
```http
GET /api/v1/barcodes/dealer/:dealerId/download-pdf
Authorization: Bearer <admin_token>
```

**Description:** Downloads a single PDF file containing all barcode images and asset details for a dealer

**Response:** PDF file with filename `barcodes_{dealerCode}_{timestamp}.pdf`

**PDF Contains:**
- Dealer information header
- List of all assets with details
- Embedded barcode images
- 3 assets per page with automatic pagination

### 8. Download All Barcodes as ZIP (ADMIN Only) 🆕
```http
GET /api/v1/barcodes/dealer/:dealerId/download-zip
Authorization: Bearer <admin_token>
```

**Description:** Downloads a ZIP archive containing individual PNG files for each barcode plus a README.txt

**Response:** ZIP file with filename `barcodes_{dealerCode}_{timestamp}.zip`

**ZIP Contains:**
- `README.txt` - Dealer information and asset list
- Individual PNG files named as `{assetNo}_{fixtureNo}.png`

---

## 📊 Dashboard APIs

### 1. Admin Dashboard
```http
GET /api/v1/dashboard/admin
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "dealers": {
      "total": 50,
      "active": 45,
      "inactive": 5
    },
    "assets": {
      "total": 500,
      "active": 450,
      "inactive": 30,
      "maintenance": 15,
      "damaged": 5
    },
    "analytics": {
      "assetsByBrand": [...],
      "assetsByDealer": [...],
      "assetsCreatedPerMonth": [...]
    },
    "recent": {
      "assets": [...],
      "dealers": [...]
    }
  }
}
```

### 2. Dealer Dashboard
```http
GET /api/v1/dashboard/dealer
Authorization: Bearer <dealer_token>
```

### 3. System Statistics (ADMIN Only)
```http
GET /api/v1/dashboard/system-stats
Authorization: Bearer <admin_token>
```

---

## 🎯 QR Code Format

QR codes are automatically generated containing unique identifiers in the following format:

```
IBTSO-{DEALER_CODE}-{FIXTURE_NO}-{YEAR}-{TIMESTAMP}
```

**Example Value Encoded in QR Code:**
```
IBTSO-DLR-JOHN-1234-ABC-FIX-001-2024-123456
```

**Components:**
- `IBTSO`: Platform identifier
- `DLR-JOHN-1234-ABC`: Auto-generated dealer code
- `FIX-001`: Fixture number
- `2024`: Current year
- `123456`: Timestamp for uniqueness

**QR Code Specifications:**
- **Format**: PNG image (300x300px)
- **Error Correction**: Level H (High - 30% recovery)
- **Color**: Black on white background
- **Margin**: 2 modules

---

## 🔒 Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based auth
3. **Role-Based Access Control**: ADMIN and DEALER roles
4. **Input Validation**: express-validator on all inputs
5. **Helmet**: Security headers
6. **CORS**: Configurable cross-origin requests
7. **Rate Limiting**: Express rate limiter
8. **Soft Delete**: Data retention for audit
9. **Password Change Tracking**: Invalidates old tokens
10. **Temporary Password System**: First-login password change

---

## ⚠ Validations & Edge Cases

### Validations Implemented

✅ **Barcode uniqueness** - Prevents duplicate barcodes  
✅ **Dealer existence** - Asset creation requires valid dealer  
✅ **Installation date validation** - Cannot be in future  
✅ **Soft delete only** - Data retention for audit trails  
✅ **Email uniqueness** - Per user and dealer  
✅ **VAT registration uniqueness** - Per dealer  
✅ **Phone format validation** - Valid phone numbers  
✅ **Latitude/Longitude validation** - Valid coordinates  
✅ **Asset ownership** - Dealers can only modify their assets  
✅ **Pagination limits** - Max 100 items per page  

### Edge Cases Handled

1. **Duplicate Fixture Numbers**: Prevented per dealer
2. **Barcode Collision**: Auto-retry with timestamp
3. **Deleted Asset Scan**: Returns 404 with appropriate message
4. **Ownership Validation**: Only asset owner/admin can modify
5. **Inactive Dealer**: Cannot create assets for inactive dealers
6. **Password Change Token Invalidation**: Old tokens become invalid
7. **Dealer Deletion with Assets**: Prevents deletion if active assets exist
8. **Concurrent QR Code Generation**: Timestamp ensures uniqueness
9. **Location Auto-fill**: Inherits from dealer if not provided
10. **Search Optimization**: Case-insensitive, indexed queries

---

## 🚦 Error Handling

All errors follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "status": "fail",
  "message": "Detailed error message"
}
```

### Common Error Codes
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## 👤 User Roles

### ADMIN Capabilities
- ✅ Login
- ✅ Create/Update/Disable/Delete dealers
- ✅ CRUD all assets
- ✅ View dashboard analytics
- ✅ Generate barcodes
- ✅ Scan barcodes
- ✅ Regenerate barcodes
- ✅ Reset dealer passwords
- ✅ View system statistics

### DEALER Capabilities
- ✅ Login
- ✅ Create assets (fixtures) for their dealership
- ✅ View own assets only
- ✅ Update own assets
- ✅ Generate barcodes for own assets
- ✅ Scan barcodes (own assets only)
- ✅ View dealer dashboard
- ❌ Cannot delete assets
- ❌ Cannot access other dealers' data

---

## 📁 Project Structure

```
barcode/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── dealerController.js  # Dealer management
│   ├── assetController.js   # Asset management
│   ├── barcodeController.js # Barcode operations
│   └── dashboardController.js # Analytics
├── middleware/
│   ├── auth.js              # JWT & role verification
│   ├── errorHandler.js      # Global error handling
│   └── validator.js         # Input validation
├── models/
│   ├── User.js              # User schema
│   ├── Dealer.js            # Dealer schema
│   └── Asset.js             # Asset schema
├── routes/
│   ├── authRoutes.js
│   ├── dealerRoutes.js
│   ├── assetRoutes.js
│   ├── barcodeRoutes.js
│   └── dashboardRoutes.js
├── services/
│   └── barcodeService.js    # QR code generation logic
├── utils/
│   ├── jwtToken.js          # JWT utilities
│   ├── seedAdmin.js         # Default admin creation
│   └── generatePassword.js  # Password & code generation
├── uploads/
│   └── barcodes/            # Generated barcode images
├── .env.example
├── .gitignore
├── package.json
├── server.js                # Entry point
└── README.md
```

---

## 🧪 Testing the API

### Using the Default Admin

1. Start the server: `npm run dev`
2. Default admin is auto-created:
   - Email: `admin@ibtso.com`
   - Password: `ibtso@$2026`

### Sample Workflow

1. **Login as Admin**
```bash
POST /api/v1/auth/login
{
  "email": "admin@ibtso.com",
  "password": "ibtso@$2026"
}
```

2. **Create a Dealer**
```bash
POST /api/v1/dealers
Authorization: Bearer <admin_token>
```

3. **Login as Dealer** (using temporary password from step 2)

4. **Create an Asset**
```bash
POST /api/v1/assets
Authorization: Bearer <dealer_token>
```

5. **Scan the Barcode**
```bash
GET /api/v1/barcodes/scan/<barcodeValue>
```

---

## 🔄 Future Enhancements

- [ ] Email notifications for dealer onboarding
- [ ] Asset transfer between dealers
- [ ] Bulk asset upload (CSV/Excel)
- [ ] QR code support alongside barcodes
- [ ] Asset maintenance scheduling
- [ ] Mobile app integration
- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics & reporting
- [ ] Multi-language support
- [ ] Asset warranty tracking
- [ ] Image upload for assets
- [ ] Geofencing for asset location
- [ ] Audit log export

---

## 📝 License

ISC

---

## 👨‍💻 Support

For support and queries, contact: **IBTSO Support Team**

---

## 🙏 Acknowledgments

Built with ❤️ for IBTSO Asset Tracking Platform

---

**Version**: 1.0.0  
**Last Updated**: 2024
