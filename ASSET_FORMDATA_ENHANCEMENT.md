# 🎨 Asset FormData Enhancement - Complete Guide

## 🎯 Overview

Complete overhaul of Asset CRUD system with:
- ✅ FormData support for all operations
- ✅ Multiple image uploads (up to 10 images per asset)
- ✅ Brand reference (brandId instead of brand name string)
- ✅ Client assignment (clientId)
- ✅ Enhanced barcode scan with deep details
- ✅ Admin provides dealerId and clientId explicitly

---

## 📦 Major Changes

### 1. Asset Model Updates

**File:** `models/Asset.js`

**Changes:**
- ❌ Removed `brand` (String)
- ✅ Added `brandId` (ObjectId ref: Brand)
- ✅ Added `clientId` (ObjectId ref: Client, optional)
- ✅ Added `images` (Array of image paths)

**New Schema:**
```javascript
{
  fixtureNo: String (required),
  assetNo: String (required, unique),
  dimension: {
    length: Number,
    height: Number,
    depth: Number,
    unit: String (enum: ['cm', 'inch', 'mm', 'm'])
  },
  standType: String (required),
  brandId: ObjectId (required, ref: Brand),
  dealerId: ObjectId (required, ref: Dealer),
  clientId: ObjectId (optional, ref: Client),
  images: [String],
  installationDate: Date (required),
  location: { address, latitude, longitude, googleMapLink },
  barcodeValue: String (required, unique, uppercase),
  barcodeImagePath: String (required),
  status: String (enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED']),
  isDeleted: Boolean,
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  timestamps: true
}
```

---

### 2. Upload Middleware

**File:** `middleware/upload.js` (NEW)

**Features:**
- ✅ Multer configuration for image uploads
- ✅ Storage in `uploads/assets/` directory
- ✅ File filter (jpeg, jpg, png, gif, webp only)
- ✅ Size limit: 5MB per file
- ✅ Max 10 images per request
- ✅ Error handling for multer errors

**Usage:**
```javascript
const { uploadAssetImages, handleMulterError } = require('../middleware/upload');

router.post('/', uploadAssetImages, handleMulterError, createAsset);
```

---

### 3. Asset Validation Updates

**File:** `middleware/validator.js`

**Changes:**
- ❌ Removed `brand` validation
- ✅ Added `brandId` validation (required, MongoDB ObjectId)
- ✅ Added `clientId` validation (optional, MongoDB ObjectId)

**New Validation:**
```javascript
body('brandId')
  .notEmpty()
  .withMessage('Brand ID is required')
  .isMongoId()
  .withMessage('Invalid brand ID'),
body('clientId')
  .optional()
  .isMongoId()
  .withMessage('Invalid client ID'),
```

---

## 🔄 API Changes

### Base URL: `/api/v1/assets`

---

## 1. Create Asset (Enhanced)

**Endpoint:** `POST /api/v1/assets`

**Access:** Admin & Dealer

**Content-Type:** `multipart/form-data`

### Request Body (FormData)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fixtureNo` | String | Yes | Fixture number |
| `assetNo` | String | Yes | Asset number (unique) |
| `dimension` | JSON String | Yes | `{"length":100,"height":50,"depth":30,"unit":"cm"}` |
| `standType` | String | Yes | Stand type |
| `brandId` | String | Yes | Brand MongoDB ObjectId |
| `dealerId` | String | Yes | Dealer MongoDB ObjectId |
| `clientId` | String | No | Client MongoDB ObjectId |
| `installationDate` | String | Yes | ISO 8601 date format |
| `status` | String | No | ACTIVE, INACTIVE, MAINTENANCE, DAMAGED |
| `images` | File(s) | No | Up to 10 image files |

### Example Request (JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('fixtureNo', 'FIX-001');
formData.append('assetNo', 'AST-001');
formData.append('dimension', JSON.stringify({
  length: 100,
  height: 50,
  depth: 30,
  unit: 'cm'
}));
formData.append('standType', 'Floor Stand');
formData.append('brandId', '697dd514085d2ae73fa4339a');
formData.append('dealerId', '697dd514085d2ae73fa4338b');
formData.append('clientId', '697dd514085d2ae73fa433a0');
formData.append('installationDate', '2026-01-15T00:00:00.000Z');
formData.append('status', 'ACTIVE');

// Add multiple images
formData.append('images', imageFile1);
formData.append('images', imageFile2);
formData.append('images', imageFile3);

const response = await fetch('/api/v1/assets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Example Request (cURL)

```bash
curl -X POST http://localhost:5000/api/v1/assets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "fixtureNo=FIX-001" \
  -F "assetNo=AST-001" \
  -F 'dimension={"length":100,"height":50,"depth":30,"unit":"cm"}' \
  -F "standType=Floor Stand" \
  -F "brandId=697dd514085d2ae73fa4339a" \
  -F "dealerId=697dd514085d2ae73fa4338b" \
  -F "clientId=697dd514085d2ae73fa433a0" \
  -F "installationDate=2026-01-15T00:00:00.000Z" \
  -F "status=ACTIVE" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Asset created successfully",
  "data": {
    "_id": "asset_id",
    "fixtureNo": "FIX-001",
    "assetNo": "AST-001",
    "dimension": {
      "length": 100,
      "height": 50,
      "depth": 30,
      "unit": "cm"
    },
    "standType": "Floor Stand",
    "brandId": {
      "_id": "697dd514085d2ae73fa4339a",
      "name": "Samsung Electronics",
      "isActive": true
    },
    "dealerId": {
      "_id": "697dd514085d2ae73fa4338b",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Electronics",
      "shopName": "Electronics Hub",
      "email": "john@electronics.com",
      "phone": "+1234567890",
      "location": {
        "address": "123 Main St",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
      }
    },
    "clientId": {
      "_id": "697dd514085d2ae73fa433a0",
      "name": "Mohsin Haider Darwish LLC",
      "email": "contact@mhd.com",
      "phone": "+96812345678",
      "company": "Mohsin Haider Darwish LLC"
    },
    "images": [
      "uploads/assets/asset-1738483200000-123456789.jpg",
      "uploads/assets/asset-1738483200001-987654321.jpg"
    ],
    "installationDate": "2026-01-15T00:00:00.000Z",
    "location": {
      "address": "123 Main St",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
    },
    "barcodeValue": "JOHN-FIX001",
    "barcodeImagePath": "uploads/barcodes/barcode-xyz.png",
    "status": "ACTIVE",
    "isDeleted": false,
    "createdBy": {
      "_id": "admin_id",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-03T04:23:00.000Z",
    "updatedAt": "2026-02-03T04:23:00.000Z"
  }
}
```

### Error Responses

#### Missing Required Fields
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Brand ID is required"
}
```

#### Invalid Brand ID
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Brand not found"
}
```

#### Invalid Client ID
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Client not found"
}
```

#### File Size Too Large
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "File size too large. Maximum size is 5MB per file."
}
```

#### Too Many Files
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Too many files. Maximum is 10 images."
}
```

#### Invalid File Type
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp)"
}
```

---

## 2. Update Asset (Enhanced)

**Endpoint:** `PUT /api/v1/assets/:id`

**Access:** Admin & Dealer (own assets only)

**Content-Type:** `multipart/form-data`

### Request Body (FormData)

All fields are optional. Only provide fields you want to update.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fixtureNo` | String | No | Fixture number |
| `assetNo` | String | No | Asset number |
| `dimension` | JSON String | No | Dimension object |
| `standType` | String | No | Stand type |
| `brandId` | String | No | Brand MongoDB ObjectId |
| `clientId` | String | No | Client MongoDB ObjectId (empty string to remove) |
| `installationDate` | String | No | ISO 8601 date |
| `status` | String | No | Status |
| `images` | File(s) | No | New images to add (appends to existing) |

### Example Request

```javascript
const formData = new FormData();
formData.append('standType', 'Wall Mount');
formData.append('brandId', '697dd514085d2ae73fa4339b');
formData.append('status', 'MAINTENANCE');
formData.append('images', newImageFile1);
formData.append('images', newImageFile2);

const response = await fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "asset_id",
    "fixtureNo": "FIX-001",
    "assetNo": "AST-001",
    "standType": "Wall Mount",
    "brandId": {
      "_id": "697dd514085d2ae73fa4339b",
      "name": "LG Electronics",
      "isActive": true
    },
    "images": [
      "uploads/assets/asset-old-image.jpg",
      "uploads/assets/asset-new-image1.jpg",
      "uploads/assets/asset-new-image2.jpg"
    ],
    "status": "MAINTENANCE",
    "updatedBy": {
      "_id": "admin_id",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "updatedAt": "2026-02-03T05:00:00.000Z"
  }
}
```

**Note:** New images are **appended** to existing images, not replaced.

---

## 3. Get All Assets (Enhanced)

**Endpoint:** `GET /api/v1/assets`

**Access:** Admin & Dealer

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by fixtureNo, assetNo, barcodeValue
- `dealerId` - Filter by dealer (Admin only)
- `brand` - Filter by brandId
- `status` - Filter by status
- `startDate` - Filter by installation date (from)
- `endDate` - Filter by installation date (to)

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "count": 10,
  "total": 47,
  "totalPages": 5,
  "currentPage": 1,
  "data": [
    {
      "_id": "asset_id",
      "fixtureNo": "FIX-001",
      "assetNo": "AST-001",
      "brandId": {
        "_id": "brand_id",
        "name": "Samsung Electronics",
        "isActive": true
      },
      "dealerId": {
        "_id": "dealer_id",
        "dealerCode": "JOHN-ABC123XYZ",
        "name": "John's Electronics"
      },
      "clientId": {
        "_id": "client_id",
        "name": "Mohsin Haider Darwish LLC",
        "email": "contact@mhd.com"
      },
      "images": [
        "uploads/assets/asset-image1.jpg",
        "uploads/assets/asset-image2.jpg"
      ],
      "status": "ACTIVE",
      "createdAt": "2026-02-03T04:23:00.000Z"
    }
  ]
}
```

---

## 4. Get Asset by ID (Enhanced)

**Endpoint:** `GET /api/v1/assets/:id`

**Access:** Admin & Dealer (own assets only)

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "asset_id",
    "fixtureNo": "FIX-001",
    "assetNo": "AST-001",
    "dimension": {
      "length": 100,
      "height": 50,
      "depth": 30,
      "unit": "cm"
    },
    "standType": "Floor Stand",
    "brandId": {
      "_id": "brand_id",
      "name": "Samsung Electronics",
      "isActive": true
    },
    "dealerId": {
      "_id": "dealer_id",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Electronics",
      "shopName": "Electronics Hub",
      "email": "john@electronics.com",
      "phone": "+1234567890",
      "location": {
        "address": "123 Main St",
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "vatRegistration": "VAT123456"
    },
    "clientId": {
      "_id": "client_id",
      "name": "Mohsin Haider Darwish LLC",
      "email": "contact@mhd.com",
      "phone": "+96812345678",
      "company": "Mohsin Haider Darwish LLC",
      "address": "P.O.Box:880, P.C 112, Ruwi",
      "vatin": "OM1100001389",
      "placeOfSupply": "Sultanate of Oman",
      "country": "Sultanate of Oman"
    },
    "images": [
      "uploads/assets/asset-image1.jpg",
      "uploads/assets/asset-image2.jpg",
      "uploads/assets/asset-image3.jpg"
    ],
    "installationDate": "2026-01-15T00:00:00.000Z",
    "location": {
      "address": "123 Main St",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
    },
    "barcodeValue": "JOHN-FIX001",
    "barcodeImagePath": "uploads/barcodes/barcode-xyz.png",
    "barcodeImageUrl": "http://localhost:5000/uploads/barcodes/barcode-xyz.png",
    "status": "ACTIVE",
    "isDeleted": false,
    "createdBy": {
      "_id": "admin_id",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "updatedBy": {
      "_id": "admin_id",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-03T04:23:00.000Z",
    "updatedAt": "2026-02-03T05:00:00.000Z"
  }
}
```

---

## 5. Barcode Scan (Enhanced)

**Endpoint:** `GET /api/v1/barcode/scan/public/:barcodeValue`

**Access:** Public (No authentication required)

**Description:** Renders HTML page with complete asset details including brand, client, dealer, and images.

### New Sections in HTML Response

1. **📦 Asset Information**
   - Fixture No/Asset No
   - Dimension
   - Dealer
   - Stand Type
   - **Brand** (from brandId)
   - Installation Date
   - Status
   - Days Since Installation

2. **📍 Asset Location Coordinates**
   - Address
   - Latitude/Longitude
   - Google Maps Link

3. **🏪 Dealer Details**
   - Name
   - Phone
   - Email
   - Shop Name
   - VAT Registration
   - Location

4. **👤 Client Details** (NEW - if clientId exists)
   - Name
   - Company
   - Email
   - Phone
   - Address
   - VATIN
   - Place of Supply
   - Country

5. **📷 Asset Images** (NEW - if images exist)
   - Grid display of all uploaded images
   - Responsive layout
   - Error handling for missing images

6. **⏱️ Timeline Information**
   - Created Date
   - Last Updated
   - Created By
   - Updated By

### Example URL

```
http://localhost:5000/api/v1/barcode/scan/public/JOHN-FIX001
```

### Response

Beautiful HTML page with all asset details, brand information, client information, and image gallery.

---

## 🧪 Testing Scenarios

### Scenario 1: Create Asset with All Fields

**Step 1: Create Asset with Brand, Client, and Images**
```bash
POST /api/v1/assets
FormData:
  - fixtureNo: FIX-001
  - assetNo: AST-001
  - dimension: {"length":100,"height":50,"depth":30,"unit":"cm"}
  - standType: Floor Stand
  - brandId: 697dd514085d2ae73fa4339a
  - dealerId: 697dd514085d2ae73fa4338b
  - clientId: 697dd514085d2ae73fa433a0
  - installationDate: 2026-01-15T00:00:00.000Z
  - images: [image1.jpg, image2.jpg, image3.jpg]
```

**Expected Result:**
- ✅ Asset created with all fields
- ✅ 3 images uploaded and saved
- ✅ Brand and client populated in response

---

### Scenario 2: Create Asset Without Client

```bash
POST /api/v1/assets
FormData:
  - fixtureNo: FIX-002
  - assetNo: AST-002
  - brandId: 697dd514085d2ae73fa4339a
  - dealerId: 697dd514085d2ae73fa4338b
  - (no clientId)
```

**Expected Result:**
- ✅ Asset created without client
- ✅ clientId is null

---

### Scenario 3: Update Asset - Add Images

```bash
PUT /api/v1/assets/asset_id
FormData:
  - images: [image4.jpg, image5.jpg]
```

**Expected Result:**
- ✅ New images appended to existing images
- ✅ Asset now has 5 images total

---

### Scenario 4: Update Asset - Change Brand and Client

```bash
PUT /api/v1/assets/asset_id
FormData:
  - brandId: 697dd514085d2ae73fa4339b
  - clientId: 697dd514085d2ae73fa433a1
```

**Expected Result:**
- ✅ Brand updated to LG
- ✅ Client updated to new client

---

### Scenario 5: Remove Client from Asset

```bash
PUT /api/v1/assets/asset_id
FormData:
  - clientId: "" (empty string)
```

**Expected Result:**
- ✅ clientId set to null
- ✅ Asset no longer associated with client

---

### Scenario 6: Scan Barcode - View Full Details

```bash
GET /api/v1/barcode/scan/public/JOHN-FIX001
```

**Expected Result:**
- ✅ HTML page displays
- ✅ Asset details shown
- ✅ Brand name displayed
- ✅ Client section shown (if clientId exists)
- ✅ Image gallery shown (if images exist)
- ✅ Dealer details shown

---

### Scenario 7: Upload Maximum Images

```bash
POST /api/v1/assets
FormData:
  - images: [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10]
```

**Expected Result:**
- ✅ All 10 images uploaded successfully

---

### Scenario 8: Exceed Image Limit

```bash
POST /api/v1/assets
FormData:
  - images: [img1, img2, ..., img11] (11 images)
```

**Expected Result:**
- ❌ Error: "Too many files. Maximum is 10 images."

---

### Scenario 9: Upload Invalid File Type

```bash
POST /api/v1/assets
FormData:
  - images: [document.pdf]
```

**Expected Result:**
- ❌ Error: "Only image files are allowed (jpeg, jpg, png, gif, webp)"

---

### Scenario 10: Upload Oversized Image

```bash
POST /api/v1/assets
FormData:
  - images: [large-image-6mb.jpg]
```

**Expected Result:**
- ❌ Error: "File size too large. Maximum size is 5MB per file."

---

## 📊 Key Features Summary

| Feature | Status |
|---------|--------|
| FormData support | ✅ Working |
| Multiple image uploads | ✅ Working (max 10) |
| Brand reference (brandId) | ✅ Working |
| Client assignment (clientId) | ✅ Working |
| Image size validation | ✅ Working (5MB max) |
| Image type validation | ✅ Working |
| Enhanced barcode scan | ✅ Working |
| Client details in scan | ✅ Working |
| Image gallery in scan | ✅ Working |
| Append images on update | ✅ Working |

---

## 📝 Files Modified/Created

| File | Action | Description |
|------|--------|-------------|
| `models/Asset.js` | Modified | Added brandId, clientId, images fields |
| `middleware/upload.js` | **Created** | Multer configuration for image uploads |
| `middleware/validator.js` | Modified | Updated validation for brandId, clientId |
| `controllers/assetController.js` | Modified | FormData handling, image uploads, new populates |
| `controllers/barcodeController.js` | Modified | Enhanced HTML with client and images |
| `routes/assetRoutes.js` | Modified | Added multer middleware |

**Total:** 1 new file, 5 modified files

---

## 🔗 Related Documentation

- **Brand Assignment System:** `BRAND_ASSIGNMENT_SYSTEM.md`
- **Dealer Brand Assignment:** `DEALER_BRAND_ASSIGNMENT.md`
- **Brand & Client API:** `BRAND_CLIENT_API_REFERENCE.md`

---

## 💡 Important Notes

1. **FormData Required:** All asset create/update operations now use `multipart/form-data`
2. **Dimension Format:** Must be JSON string when sent via FormData
3. **Image Append:** Update operation appends new images, doesn't replace
4. **Client Optional:** clientId is completely optional
5. **Brand Required:** brandId is required for all assets
6. **Admin Control:** Admin explicitly provides dealerId and clientId
7. **Image Limit:** Maximum 10 images per asset
8. **File Size:** Maximum 5MB per image
9. **Supported Formats:** jpeg, jpg, png, gif, webp only

---

**Asset FormData system with image uploads is complete and ready!** 🎉
