# 🏪 Dealer Brand Assignment API - Complete Reference

## 🎯 Overview

Complete documentation for creating and updating dealers with brand assignments.

**Base URL:** `/api/v1/dealers`

**Access:** Admin only

**Content-Type:** `application/json`

---

## 📋 API Endpoints

### 1. Create Dealer with Brand Assignment
**Endpoint:** `POST /api/v1/dealers`

### 2. Update Dealer with Brand Assignment
**Endpoint:** `PUT /api/v1/dealers/:id`

---

## 1️⃣ Create Dealer with Brand Assignment

**Endpoint:** `POST /api/v1/dealers`

**Access:** Admin only

**Authentication:** Required (JWT Bearer token)

---

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | No | Dealer name |
| `email` | String | No | Dealer email (must be unique) |
| `phone` | String | No | Dealer phone number |
| `shopName` | String | No | Shop name |
| `vatRegistration` | String | No | VAT registration number (must be unique) |
| `location` | Object | No | Location details |
| `location.address` | String | No | Physical address |
| `location.latitude` | Number | No | Latitude coordinate |
| `location.longitude` | Number | No | Longitude coordinate |
| `location.googleMapLink` | String | No | Google Maps link |
| `brandIds` | Array | No | Array of brand MongoDB ObjectIds to assign |

---

### Scenario 1: Create Dealer Without Brands

**Request:**

```javascript
POST /api/v1/dealers
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John's Electronics",
  "email": "john@electronics.com",
  "phone": "+1234567890",
  "shopName": "Electronics Hub",
  "vatRegistration": "VAT123456",
  "location": {
    "address": "123 Main St, New York, NY",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/dealers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John'\''s Electronics",
    "email": "john@electronics.com",
    "phone": "+1234567890",
    "shopName": "Electronics Hub",
    "vatRegistration": "VAT123456",
    "location": {
      "address": "123 Main St, New York, NY",
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }'
```

**Success Response:**

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Dealer created successfully",
  "data": {
    "dealer": {
      "_id": "697dd514085d2ae73fa4338b",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Electronics",
      "email": "john@electronics.com",
      "phone": "+1234567890",
      "shopName": "Electronics Hub",
      "vatRegistration": "VAT123456",
      "location": {
        "address": "123 Main St, New York, NY",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
      },
      "userId": "user_id",
      "isActive": true,
      "isDeleted": false,
      "createdBy": "admin_id",
      "createdAt": "2026-02-03T10:28:00.000Z",
      "updatedAt": "2026-02-03T10:28:00.000Z"
    },
    "assignedBrands": [],
    "totalAssignedBrands": 0,
    "credentials": {
      "email": "john@electronics.com",
      "temporaryPassword": "Temp@1234",
      "message": "Please share these credentials with the dealer. Password must be changed on first login."
    }
  }
}
```

---

### Scenario 2: Create Dealer With Multiple Brands

**Request:**

```javascript
POST /api/v1/dealers
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Mike's Store",
  "email": "mike@store.com",
  "phone": "+9876543210",
  "shopName": "Tech Store",
  "vatRegistration": "VAT789012",
  "location": {
    "address": "456 Tech Ave",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "brandIds": [
    "69807f4393eef0e11c337c44",
    "69807f4393eef0e11c337c45",
    "69807f4393eef0e11c337c46"
  ]
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/v1/dealers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike'\''s Store",
    "email": "mike@store.com",
    "phone": "+9876543210",
    "shopName": "Tech Store",
    "vatRegistration": "VAT789012",
    "location": {
      "address": "456 Tech Ave",
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "brandIds": [
      "69807f4393eef0e11c337c44",
      "69807f4393eef0e11c337c45",
      "69807f4393eef0e11c337c46"
    ]
  }'
```

**Success Response:**

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Dealer created successfully",
  "data": {
    "dealer": {
      "_id": "697dd514085d2ae73fa4339c",
      "dealerCode": "MIKE-DEF456UVW",
      "name": "Mike's Store",
      "email": "mike@store.com",
      "phone": "+9876543210",
      "shopName": "Tech Store",
      "vatRegistration": "VAT789012",
      "location": {
        "address": "456 Tech Ave",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "googleMapLink": "https://maps.google.com/?q=37.7749,-122.4194"
      },
      "userId": "user_id_2",
      "isActive": true,
      "isDeleted": false,
      "createdBy": "admin_id",
      "createdAt": "2026-02-03T10:28:00.000Z",
      "updatedAt": "2026-02-03T10:28:00.000Z"
    },
    "assignedBrands": [
      {
        "_id": "69807f4393eef0e11c337c44",
        "name": "Samsung Electronics",
        "isActive": true
      },
      {
        "_id": "69807f4393eef0e11c337c45",
        "name": "LG Electronics",
        "isActive": true
      },
      {
        "_id": "69807f4393eef0e11c337c46",
        "name": "Sony Corporation",
        "isActive": true
      }
    ],
    "totalAssignedBrands": 3,
    "credentials": {
      "email": "mike@store.com",
      "temporaryPassword": "Temp@5678",
      "message": "Please share these credentials with the dealer. Password must be changed on first login."
    }
  }
}
```

---

### Scenario 3: Create Dealer Without Email (Auto-Generated)

**Request:**

```javascript
POST /api/v1/dealers
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Sarah's Shop",
  "phone": "+1122334455",
  "shopName": "Electronics Plus"
}
```

**Success Response:**

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Dealer created successfully",
  "data": {
    "dealer": {
      "_id": "697dd514085d2ae73fa4339d",
      "dealerCode": "SARA-GHI789XYZ",
      "name": "Sarah's Shop",
      "email": "dealer_1738574880000@generated.com",
      "phone": "+1122334455",
      "shopName": "Electronics Plus",
      "isActive": true,
      "createdAt": "2026-02-03T10:28:00.000Z"
    },
    "assignedBrands": [],
    "totalAssignedBrands": 0,
    "credentials": {
      "email": "dealer_1738574880000@generated.com",
      "temporaryPassword": "Temp@9012",
      "message": "Auto-generated email used. Please update dealer email and share credentials. Password must be changed on first login."
    }
  }
}
```

---

### Create Dealer - Error Responses

#### Error 1: Invalid Brand IDs
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "One or more brand IDs are invalid"
}
```

#### Error 2: Email Already Exists
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Email already in use"
}
```

#### Error 3: VAT Registration Already Exists
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "VAT registration already in use"
}
```

#### Error 4: brandIds Not Array
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "brandIds must be an array"
}
```

---

## 2️⃣ Update Dealer with Brand Assignment

**Endpoint:** `PUT /api/v1/dealers/:id`

**Access:** Admin only

**Authentication:** Required (JWT Bearer token)

---

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | No | Dealer name |
| `email` | String | No | Dealer email (must be unique) |
| `phone` | String | No | Dealer phone number |
| `shopName` | String | No | Shop name |
| `vatRegistration` | String | No | VAT registration number (must be unique) |
| `location` | Object | No | Location details |
| `isActive` | Boolean | No | Active status |
| `brandIds` | Array | No | Array of brand IDs (replaces all existing assignments) |

**Important:** When `brandIds` is provided, it **replaces** all existing brand assignments.

---

### Scenario 1: Update Dealer Info Without Touching Brands

**Request:**

```javascript
PUT /api/v1/dealers/697dd514085d2ae73fa4338b
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "shopName": "Electronics Hub Premium",
  "phone": "+1234567899"
}
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/dealers/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shopName": "Electronics Hub Premium",
    "phone": "+1234567899"
  }'
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "dealerCode": "JOHN-ABC123XYZ",
    "name": "John's Electronics",
    "email": "john@electronics.com",
    "phone": "+1234567899",
    "shopName": "Electronics Hub Premium",
    "vatRegistration": "VAT123456",
    "location": {
      "address": "123 Main St, New York, NY",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
    },
    "isActive": true,
    "updatedAt": "2026-02-03T10:58:00.000Z"
  }
}
```

**Note:** Brands unchanged when `brandIds` not provided

---

### Scenario 2: Add Brands to Dealer (First Time)

**Current State:** Dealer has 0 brands

**Request:**

```javascript
PUT /api/v1/dealers/697dd514085d2ae73fa4338b
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "brandIds": [
    "69807f4393eef0e11c337c44",
    "69807f4393eef0e11c337c45"
  ]
}
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/dealers/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brandIds": [
      "69807f4393eef0e11c337c44",
      "69807f4393eef0e11c337c45"
    ]
  }'
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "dealerCode": "JOHN-ABC123XYZ",
    "name": "John's Electronics",
    "email": "john@electronics.com",
    "assignedBrands": [
      {
        "_id": "69807f4393eef0e11c337c44",
        "name": "Samsung Electronics",
        "isActive": true
      },
      {
        "_id": "69807f4393eef0e11c337c45",
        "name": "LG Electronics",
        "isActive": true
      }
    ],
    "totalAssignedBrands": 2,
    "updatedAt": "2026-02-03T10:58:00.000Z"
  }
}
```

---

### Scenario 3: Update Brands (Replace Existing)

**Current State:** Dealer has 2 brands (Samsung, LG)

**Request:**

```javascript
PUT /api/v1/dealers/697dd514085d2ae73fa4338b
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "brandIds": [
    "69807f4393eef0e11c337c46",
    "69807f4393eef0e11c337c47",
    "69807f4393eef0e11c337c48"
  ]
}
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "dealerCode": "JOHN-ABC123XYZ",
    "name": "John's Electronics",
    "assignedBrands": [
      {
        "_id": "69807f4393eef0e11c337c46",
        "name": "Sony Corporation",
        "isActive": true
      },
      {
        "_id": "69807f4393eef0e11c337c47",
        "name": "Panasonic",
        "isActive": true
      },
      {
        "_id": "69807f4393eef0e11c337c48",
        "name": "Toshiba",
        "isActive": true
      }
    ],
    "totalAssignedBrands": 3,
    "updatedAt": "2026-02-03T10:58:00.000Z"
  }
}
```

**Result:**
- ✅ Old brands (Samsung, LG) deactivated
- ✅ New brands (Sony, Panasonic, Toshiba) assigned

---

### Scenario 4: Re-assign Previously Assigned Brand (No Error)

**Current State:** Dealer previously had Samsung (deactivated)

**Request:**

```javascript
PUT /api/v1/dealers/697dd514085d2ae73fa4338b
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "brandIds": [
    "69807f4393eef0e11c337c44"
  ]
}
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "assignedBrands": [
      {
        "_id": "69807f4393eef0e11c337c44",
        "name": "Samsung Electronics",
        "isActive": true
      }
    ],
    "totalAssignedBrands": 1,
    "updatedAt": "2026-02-03T10:58:00.000Z"
  }
}
```

**Result:**
- ✅ **Reactivated** existing Samsung assignment
- ✅ **No duplicate key error**
- ✅ Old assignments deactivated

---

### Scenario 5: Remove All Brands from Dealer

**Current State:** Dealer has 3 brands

**Request:**

```javascript
PUT /api/v1/dealers/697dd514085d2ae73fa4338b
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "brandIds": []
}
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/dealers/697dd514085d2ae73fa4338b \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brandIds": []
  }'
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "dealerCode": "JOHN-ABC123XYZ",
    "name": "John's Electronics",
    "assignedBrands": [],
    "totalAssignedBrands": 0,
    "updatedAt": "2026-02-03T10:58:00.000Z"
  }
}
```

**Result:**
- ✅ All brand assignments deactivated
- ✅ Dealer has 0 active brands

---

### Scenario 6: Update Dealer Info + Brands Together

**Request:**

```javascript
PUT /api/v1/dealers/697dd514085d2ae73fa4338b
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "shopName": "Electronics Mega Store",
  "phone": "+1234567800",
  "isActive": true,
  "brandIds": [
    "69807f4393eef0e11c337c44",
    "69807f4393eef0e11c337c45",
    "69807f4393eef0e11c337c46"
  ]
}
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "dealerCode": "JOHN-ABC123XYZ",
    "name": "John's Electronics",
    "email": "john@electronics.com",
    "phone": "+1234567800",
    "shopName": "Electronics Mega Store",
    "isActive": true,
    "assignedBrands": [
      {
        "_id": "69807f4393eef0e11c337c44",
        "name": "Samsung Electronics",
        "isActive": true
      },
      {
        "_id": "69807f4393eef0e11c337c45",
        "name": "LG Electronics",
        "isActive": true
      },
      {
        "_id": "69807f4393eef0e11c337c46",
        "name": "Sony Corporation",
        "isActive": true
      }
    ],
    "totalAssignedBrands": 3,
    "updatedAt": "2026-02-03T10:58:00.000Z"
  }
}
```

**Result:**
- ✅ Dealer info updated
- ✅ Brands replaced with new assignments

---

### Scenario 7: Deactivate Dealer

**Request:**

```javascript
PUT /api/v1/dealers/697dd514085d2ae73fa4338b
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "isActive": false
}
```

**Success Response:**

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "dealerCode": "JOHN-ABC123XYZ",
    "isActive": false,
    "updatedAt": "2026-02-03T10:58:00.000Z"
  }
}
```

**Result:**
- ✅ Dealer deactivated
- ✅ Associated user account also deactivated

---

### Update Dealer - Error Responses

#### Error 1: Dealer Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Dealer not found"
}
```

#### Error 2: Invalid Brand IDs
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "One or more brand IDs are invalid"
}
```

#### Error 3: Email Already in Use
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Email already in use by another dealer"
}
```

#### Error 4: VAT Already in Use
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "VAT registration already in use"
}
```

#### Error 5: brandIds Not Array
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "brandIds must be an array"
}
```

---

## 📊 Brand Assignment Logic Summary

### How It Works

1. **Deactivate All Current Assignments**
   - Sets `isActive: false` on all current brand assignments
   - Adds `unassignedBy` and `unassignedAt` metadata

2. **Check for Existing Assignments**
   - Fetches ALL assignments (active + inactive)
   - Identifies which brands were previously assigned

3. **Reactivate or Create**
   - **Previously assigned brand:** Reactivate existing assignment
   - **New brand:** Create new assignment
   - **No duplicate key errors**

---

## 🔄 Comparison Table

| Scenario | Current Brands | New brandIds | Result |
|----------|----------------|--------------|--------|
| First time assignment | 0 | [A, B] | Create A, B |
| Add more brands | [A, B] | [A, B, C] | Keep A, B; Create C |
| Replace brands | [A, B] | [C, D] | Deactivate A, B; Create C, D |
| Re-assign old brand | [C, D] (A deactivated) | [A, C] | Reactivate A; Keep C; Deactivate D |
| Remove all brands | [A, B, C] | [] | Deactivate A, B, C |
| No change to brands | [A, B] | not provided | Keep A, B unchanged |

---

## 💡 Important Notes

1. **brandIds is Optional:** If not provided, brand assignments remain unchanged
2. **brandIds Replaces All:** When provided, it deactivates old assignments and creates/reactivates new ones
3. **No Duplicates:** System intelligently reactivates existing assignments instead of creating duplicates
4. **Soft Delete:** Old assignments are deactivated, not deleted (audit trail preserved)
5. **Email Auto-Generation:** If email not provided, system generates one
6. **User Account:** Creating a dealer also creates a user account with temporary password
7. **isActive Sync:** Dealer's isActive status syncs with user account

---

## 🔐 Authentication

All requests require Admin authentication:

```javascript
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

---

## 📝 Best Practices

### Creating Dealers

```javascript
// Good - Provide all necessary info
{
  "name": "Dealer Name",
  "email": "dealer@example.com",
  "phone": "+1234567890",
  "shopName": "Shop Name",
  "brandIds": ["brand_id_1", "brand_id_2"]
}
```

### Updating Brands

```javascript
// Good - Replace all brands
{
  "brandIds": ["new_brand_1", "new_brand_2", "new_brand_3"]
}

// Good - Remove all brands
{
  "brandIds": []
}

// Good - Don't touch brands
{
  "shopName": "New Shop Name"
}
// Don't include brandIds field
```

---

## 🧪 Testing Checklist

- ✅ Create dealer without brands
- ✅ Create dealer with brands
- ✅ Create dealer without email (auto-generated)
- ✅ Update dealer info without touching brands
- ✅ Assign brands to dealer (first time)
- ✅ Update brands (replace existing)
- ✅ Re-assign previously assigned brand (no error)
- ✅ Remove all brands from dealer
- ✅ Update dealer info + brands together
- ✅ Deactivate dealer
- ✅ Handle invalid brand IDs error
- ✅ Handle duplicate email error
- ✅ Handle duplicate VAT error

---

**Dealer brand assignment API is complete and working!** 🎉
