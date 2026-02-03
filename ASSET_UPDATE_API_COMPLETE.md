# 📝 Asset Update API - Complete Reference

## 🎯 Overview

Complete documentation for updating assets with all possible scenarios, payloads, and responses.

**Endpoint:** `PUT /api/v1/assets/:id`

**Access:** Admin & Dealer (own assets only)

**Content-Type:** `multipart/form-data`

---

## 📋 Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fixtureNo` | String | No | Fixture number |
| `assetNo` | String | No | Asset number (must be unique) |
| `dimension` | JSON String | No | `{"length":100,"height":50,"depth":30,"unit":"cm"}` |
| `standType` | String | No | Stand type |
| `brandId` | String | No | Brand MongoDB ObjectId |
| `clientId` | String | No | Client MongoDB ObjectId (empty string to remove) |
| `installationDate` | String | No | ISO 8601 date format |
| `status` | String | No | ACTIVE, INACTIVE, MAINTENANCE, DAMAGED |
| `replaceImages` | Boolean/String | No | `true` to replace images, `false` or omit to append |
| `images` | File(s) | No | Up to 10 image files |

---

## 🔄 Image Update Modes

### Mode 1: Append Images (Default - Safe)
- **When:** `replaceImages` not provided or `false`
- **Behavior:** New images added to existing images
- **File Deletion:** No files deleted

### Mode 2: Replace Images (Destructive)
- **When:** `replaceImages` is `true`, `'true'`, `1`, or `'1'`
- **Behavior:** Old images deleted, replaced with new images
- **File Deletion:** All old image files permanently deleted from filesystem

---

## 📊 All Update Scenarios

### Scenario 1: Update Basic Fields Only

**Description:** Update asset information without touching images

**Current State:**
- Asset has 4 images
- standType: "Floor Stand"
- status: "ACTIVE"

**Request:**

```javascript
const formData = new FormData();
formData.append('standType', 'Wall Mount');
formData.append('status', 'MAINTENANCE');

fetch('/api/v1/assets/697dd514085d2ae73fa4338b', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "standType=Wall Mount" \
  -F "status=MAINTENANCE"
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "fixtureNo": "FIX-001",
    "assetNo": "AST-001",
    "dimension": {
      "length": 100,
      "height": 50,
      "depth": 30,
      "unit": "cm"
    },
    "standType": "Wall Mount",
    "brandId": {
      "_id": "697dd514085d2ae73fa4339a",
      "name": "Samsung Electronics",
      "isActive": true
    },
    "dealerId": {
      "_id": "697dd514085d2ae73fa4338b",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Electronics"
    },
    "clientId": {
      "_id": "697dd514085d2ae73fa433a0",
      "name": "Mohsin Haider Darwish LLC"
    },
    "images": [
      "uploads/assets/asset-old-image1.jpg",
      "uploads/assets/asset-old-image2.jpg",
      "uploads/assets/asset-old-image3.jpg",
      "uploads/assets/asset-old-image4.jpg"
    ],
    "imageUrls": [
      "http://localhost:5000/uploads/assets/asset-old-image1.jpg",
      "http://localhost:5000/uploads/assets/asset-old-image2.jpg",
      "http://localhost:5000/uploads/assets/asset-old-image3.jpg",
      "http://localhost:5000/uploads/assets/asset-old-image4.jpg"
    ],
    "status": "MAINTENANCE",
    "updatedBy": {
      "_id": "admin_id",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "updatedAt": "2026-02-03T10:04:00.000Z"
  }
}
```

**Result:** ✅ standType and status updated, 4 images unchanged

---

### Scenario 2: Add More Images (Append Mode)

**Description:** Add new images to existing images

**Current State:**
- Asset has 4 images

**Request:**

```javascript
const formData = new FormData();
// No replaceImages field (default append mode)
formData.append('images', imageFile1);
formData.append('images', imageFile2);

fetch('/api/v1/assets/697dd514085d2ae73fa4338b', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/new-image1.jpg" \
  -F "images=@/path/to/new-image2.jpg"
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "images": [
      "uploads/assets/asset-old-image1.jpg",
      "uploads/assets/asset-old-image2.jpg",
      "uploads/assets/asset-old-image3.jpg",
      "uploads/assets/asset-old-image4.jpg",
      "uploads/assets/asset-1738574640000-123456789.jpg",
      "uploads/assets/asset-1738574640001-987654321.jpg"
    ],
    "imageUrls": [
      "http://localhost:5000/uploads/assets/asset-old-image1.jpg",
      "http://localhost:5000/uploads/assets/asset-old-image2.jpg",
      "http://localhost:5000/uploads/assets/asset-old-image3.jpg",
      "http://localhost:5000/uploads/assets/asset-old-image4.jpg",
      "http://localhost:5000/uploads/assets/asset-1738574640000-123456789.jpg",
      "http://localhost:5000/uploads/assets/asset-1738574640001-987654321.jpg"
    ],
    "updatedAt": "2026-02-03T10:04:00.000Z"
  }
}
```

**Result:** ✅ Asset now has **6 images** (4 old + 2 new)

---

### Scenario 3: Replace All Images (4 → 2)

**Description:** Replace 4 existing images with 2 new images

**Current State:**
- Asset has 4 images

**Request:**

```javascript
const formData = new FormData();
formData.append('replaceImages', 'true'); // Enable replace mode
formData.append('images', imageFile1);
formData.append('images', imageFile2);

fetch('/api/v1/assets/697dd514085d2ae73fa4338b', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "replaceImages=true" \
  -F "images=@/path/to/new-image1.jpg" \
  -F "images=@/path/to/new-image2.jpg"
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "images": [
      "uploads/assets/asset-1738574640000-123456789.jpg",
      "uploads/assets/asset-1738574640001-987654321.jpg"
    ],
    "imageUrls": [
      "http://localhost:5000/uploads/assets/asset-1738574640000-123456789.jpg",
      "http://localhost:5000/uploads/assets/asset-1738574640001-987654321.jpg"
    ],
    "updatedAt": "2026-02-03T10:04:00.000Z"
  }
}
```

**Result:** 
- ✅ Old 4 images **deleted from filesystem**
- ✅ Asset now has **2 images** (only new ones)

---

### Scenario 4: Delete All Images

**Description:** Remove all images from asset

**Current State:**
- Asset has 4 images

**Request:**

```javascript
const formData = new FormData();
formData.append('replaceImages', 'true');
// Don't append any images

fetch('/api/v1/assets/697dd514085d2ae73fa4338b', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "replaceImages=true"
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "images": [],
    "imageUrls": [],
    "updatedAt": "2026-02-03T10:04:00.000Z"
  }
}
```

**Result:**
- ✅ All 4 images **deleted from filesystem**
- ✅ Asset now has **0 images**

---

### Scenario 5: Update Brand

**Description:** Change asset brand

**Current State:**
- brandId: Samsung Electronics

**Request:**

```javascript
const formData = new FormData();
formData.append('brandId', '697dd514085d2ae73fa4339b'); // LG Electronics

fetch('/api/v1/assets/697dd514085d2ae73fa4338b', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "brandId=697dd514085d2ae73fa4339b"
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "brandId": {
      "_id": "697dd514085d2ae73fa4339b",
      "name": "LG Electronics",
      "isActive": true
    },
    "updatedAt": "2026-02-03T10:04:00.000Z"
  }
}
```

**Result:** ✅ Brand updated to LG Electronics

---

### Scenario 6: Assign Client to Asset

**Description:** Add client to asset that has no client

**Current State:**
- clientId: null

**Request:**

```javascript
const formData = new FormData();
formData.append('clientId', '697dd514085d2ae73fa433a0');

fetch('/api/v1/assets/697dd514085d2ae73fa4338b', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "clientId=697dd514085d2ae73fa433a0"
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "clientId": {
      "_id": "697dd514085d2ae73fa433a0",
      "name": "Mohsin Haider Darwish LLC",
      "email": "contact@mhd.com",
      "phone": "+96812345678",
      "company": "Mohsin Haider Darwish LLC"
    },
    "updatedAt": "2026-02-03T10:04:00.000Z"
  }
}
```

**Result:** ✅ Client assigned to asset

---

### Scenario 7: Remove Client from Asset

**Description:** Remove client assignment from asset

**Current State:**
- clientId: Mohsin Haider Darwish LLC

**Request:**

```javascript
const formData = new FormData();
formData.append('clientId', ''); // Empty string to remove

fetch('/api/v1/assets/697dd514085d2ae73fa4338b', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "clientId="
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "clientId": null,
    "updatedAt": "2026-02-03T10:04:00.000Z"
  }
}
```

**Result:** ✅ Client removed from asset

---

### Scenario 8: Update Dimension

**Description:** Update asset dimensions

**Current State:**
- dimension: 100x50x30 cm

**Request:**

```javascript
const formData = new FormData();
formData.append('dimension', JSON.stringify({
  length: 120,
  height: 60,
  depth: 40,
  unit: 'cm'
}));

fetch('/api/v1/assets/697dd514085d2ae73fa4338b', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'dimension={"length":120,"height":60,"depth":40,"unit":"cm"}'
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "dimension": {
      "length": 120,
      "height": 60,
      "depth": 40,
      "unit": "cm"
    },
    "updatedAt": "2026-02-03T10:04:00.000Z"
  }
}
```

**Result:** ✅ Dimension updated to 120x60x40 cm

---

### Scenario 9: Update Multiple Fields + Replace Images

**Description:** Update several fields and replace images in one request

**Current State:**
- standType: "Floor Stand"
- status: "ACTIVE"
- brandId: Samsung
- 4 images

**Request:**

```javascript
const formData = new FormData();
formData.append('standType', 'Wall Mount');
formData.append('status', 'MAINTENANCE');
formData.append('brandId', '697dd514085d2ae73fa4339b'); // LG
formData.append('replaceImages', 'true');
formData.append('images', imageFile1);
formData.append('images', imageFile2);
formData.append('images', imageFile3);

fetch('/api/v1/assets/697dd514085d2ae73fa4338b', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "standType=Wall Mount" \
  -F "status=MAINTENANCE" \
  -F "brandId=697dd514085d2ae73fa4339b" \
  -F "replaceImages=true" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "images=@/path/to/image3.jpg"
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "standType": "Wall Mount",
    "status": "MAINTENANCE",
    "brandId": {
      "_id": "697dd514085d2ae73fa4339b",
      "name": "LG Electronics",
      "isActive": true
    },
    "images": [
      "uploads/assets/asset-1738574640000-111111111.jpg",
      "uploads/assets/asset-1738574640001-222222222.jpg",
      "uploads/assets/asset-1738574640002-333333333.jpg"
    ],
    "imageUrls": [
      "http://localhost:5000/uploads/assets/asset-1738574640000-111111111.jpg",
      "http://localhost:5000/uploads/assets/asset-1738574640001-222222222.jpg",
      "http://localhost:5000/uploads/assets/asset-1738574640002-333333333.jpg"
    ],
    "updatedAt": "2026-02-03T10:04:00.000Z"
  }
}
```

**Result:**
- ✅ standType updated
- ✅ status updated
- ✅ Brand changed to LG
- ✅ Old 4 images deleted
- ✅ Asset now has 3 new images

---

### Scenario 10: Update Installation Date

**Description:** Change installation date

**Current State:**
- installationDate: 2026-01-15

**Request:**

```javascript
const formData = new FormData();
formData.append('installationDate', '2026-02-01T00:00:00.000Z');

fetch('/api/v1/assets/697dd514085d2ae73fa4338b', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "installationDate=2026-02-01T00:00:00.000Z"
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "installationDate": "2026-02-01T00:00:00.000Z",
    "updatedAt": "2026-02-03T10:04:00.000Z"
  }
}
```

**Result:** ✅ Installation date updated

---

## ❌ Error Responses

### Error 1: Asset Not Found

**Status Code:** `404 Not Found`

```json
{
  "success": false,
  "message": "Asset not found"
}
```

---

### Error 2: Invalid Brand ID

**Status Code:** `404 Not Found`

```json
{
  "success": false,
  "message": "Brand not found"
}
```

---

### Error 3: Invalid Client ID

**Status Code:** `404 Not Found`

```json
{
  "success": false,
  "message": "Client not found"
}
```

---

### Error 4: Asset Number Already Exists

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Asset number already exists"
}
```

---

### Error 5: Fixture Number Already Exists for Dealer

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Fixture number already exists for this dealer"
}
```

---

### Error 6: Installation Date in Future

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Installation date cannot be in the future"
}
```

---

### Error 7: Invalid Dimension Format

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Invalid dimension format"
}
```

---

### Error 8: File Size Too Large

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "File size too large. Maximum size is 5MB per file."
}
```

---

### Error 9: Too Many Files

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Too many files. Maximum is 10 images."
}
```

---

### Error 10: Invalid File Type

**Status Code:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Only image files are allowed (jpeg, jpg, png, gif, webp, avif)"
}
```

---

### Error 11: Permission Denied (Dealer accessing other dealer's asset)

**Status Code:** `403 Forbidden`

```json
{
  "success": false,
  "message": "You can only update your own assets"
}
```

---

## 📊 Quick Reference Table

| Scenario | replaceImages | New Images | Old Images | Final Result |
|----------|---------------|------------|------------|--------------|
| Update fields only | Not set | 0 | 4 | **4 images** (unchanged) |
| Add more images | Not set or `false` | 2 | 4 | **6 images** (4 old + 2 new) |
| Replace images (4→2) | `true` | 2 | 4 | **2 images** (old deleted) |
| Delete all images | `true` | 0 | 4 | **0 images** (all deleted) |
| Update brand | Not set | 0 | 4 | **4 images** + brand updated |
| Assign client | Not set | 0 | 4 | **4 images** + client assigned |
| Remove client | Not set | 0 | 4 | **4 images** + client removed |
| Update dimension | Not set | 0 | 4 | **4 images** + dimension updated |
| Multiple updates | `true` | 3 | 4 | **3 images** (old deleted) + fields updated |

---

## 💡 Best Practices

### 1. Update Only What's Needed
```javascript
// Good - Only update what changed
formData.append('status', 'MAINTENANCE');
```

### 2. Use Replace Mode for Image Updates
```javascript
// Good - Clear intent to replace
formData.append('replaceImages', 'true');
formData.append('images', newImage);
```

### 3. Validate Before Sending
```javascript
// Good - Check file size and type before upload
if (file.size > 5 * 1024 * 1024) {
  alert('File too large');
  return;
}
```

### 4. Handle Errors Gracefully
```javascript
// Good - Proper error handling
try {
  const response = await fetch(url, { method: 'PUT', body: formData });
  const data = await response.json();
  
  if (!data.success) {
    console.error(data.message);
  }
} catch (error) {
  console.error('Update failed:', error);
}
```

---

## 🔐 Authentication

All requests require JWT token in Authorization header:

```javascript
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

---

## 📝 Notes

1. **Partial Updates:** All fields are optional - only provide what you want to update
2. **Image Modes:** Default is append (safe), use `replaceImages=true` for replacement
3. **File Deletion:** Replace mode permanently deletes old files from filesystem
4. **Client Removal:** Use empty string for clientId to remove client
5. **Dimension Format:** Must be valid JSON string when sent via FormData
6. **Image Limits:** Max 10 images, 5MB per file
7. **Dealer Restriction:** Dealers can only update their own assets
8. **Admin Access:** Admin can update any asset

---

**Complete asset update API reference!** 🎉
