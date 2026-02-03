# 🏪 Dealer Brand Assignment - Complete Guide

## 🎯 Overview

Admin can now assign brands to dealers during dealer creation or update operations.

**Key Features:**
- ✅ Assign brands when creating a dealer
- ✅ Update brand assignments when updating a dealer
- ✅ View assigned brands in dealer details
- ✅ Automatic validation of brand IDs
- ✅ Assignment history tracking

---

## 📦 What Changed

### 1. Dealer Create (Enhanced)

**File:** `controllers/dealerController.js`

**New Field:** `brandIds` (optional array)

Admin can now provide an array of brand IDs when creating a dealer. The system will:
1. Validate all brand IDs exist
2. Create brand assignments automatically
3. Return assigned brands in response

---

### 2. Dealer Update (Enhanced)

**File:** `controllers/dealerController.js`

**New Field:** `brandIds` (optional array)

Admin can update brand assignments when updating a dealer. The system will:
1. Deactivate all existing brand assignments
2. Create new assignments for provided brand IDs
3. Reactivate existing assignments if brand was previously assigned
4. Return updated brand assignments in response

---

### 3. Dealer Details (Enhanced)

**File:** `controllers/dealerController.js`

**New Response Fields:**
- `assignedBrands` - Array of assigned brands with details
- `totalAssignedBrands` - Count of assigned brands

---

## 🔄 API Usage

### Base URL: `/api/v1/dealers`

---

## 1. Create Dealer with Brands

**Endpoint:** `POST /api/v1/dealers`

**Access:** Admin Only

### Request Body

```json
{
  "name": "John's Electronics",
  "email": "john@electronics.com",
  "phone": "+1234567890",
  "shopName": "Electronics Hub",
  "vatRegistration": "VAT123456",
  "location": {
    "address": "123 Main St, City",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "brandIds": [
    "697dd514085d2ae73fa4339a",
    "697dd514085d2ae73fa4339b",
    "697dd514085d2ae73fa4339c"
  ]
}
```

### Possible Payloads

#### Payload 1: Create Dealer Without Brands
```json
{
  "name": "John's Electronics",
  "email": "john@electronics.com"
}
```

#### Payload 2: Create Dealer with Single Brand
```json
{
  "name": "John's Electronics",
  "email": "john@electronics.com",
  "brandIds": ["697dd514085d2ae73fa4339a"]
}
```

#### Payload 3: Create Dealer with Multiple Brands
```json
{
  "name": "John's Electronics",
  "email": "john@electronics.com",
  "phone": "+1234567890",
  "shopName": "Electronics Hub",
  "brandIds": [
    "697dd514085d2ae73fa4339a",
    "697dd514085d2ae73fa4339b",
    "697dd514085d2ae73fa4339c"
  ]
}
```

#### Payload 4: Minimal with Brands (Name Optional)
```json
{
  "brandIds": [
    "697dd514085d2ae73fa4339a",
    "697dd514085d2ae73fa4339b"
  ]
}
```

### Success Response

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
        "address": "123 Main St, City",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
      },
      "isActive": true,
      "isDeleted": false,
      "userId": "user_id",
      "createdBy": "admin_id",
      "createdAt": "2026-02-02T16:00:00.000Z",
      "updatedAt": "2026-02-02T16:00:00.000Z"
    },
    "assignedBrands": [
      {
        "_id": "697dd514085d2ae73fa4339a",
        "name": "Samsung Electronics",
        "isActive": true
      },
      {
        "_id": "697dd514085d2ae73fa4339b",
        "name": "LG Electronics",
        "isActive": true
      },
      {
        "_id": "697dd514085d2ae73fa4339c",
        "name": "Sony",
        "isActive": true
      }
    ],
    "totalAssignedBrands": 3,
    "credentials": {
      "email": "john@electronics.com",
      "temporaryPassword": "Temp@1234",
      "message": "Please share these credentials with the dealer. Password must be changed on first login."
    }
  }
}
```

### Error Responses

#### Invalid Brand IDs
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "One or more brand IDs are invalid"
}
```

#### brandIds Not Array
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "brandIds must be an array"
}
```

#### Invalid Brand ID Format
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Invalid brand ID in array"
}
```

---

## 2. Update Dealer with Brands

**Endpoint:** `PUT /api/v1/dealers/:id`

**Access:** Admin Only

**Description:** Update dealer information and/or brand assignments.

### Request Body

```json
{
  "name": "Updated Electronics",
  "phone": "+9876543210",
  "brandIds": [
    "697dd514085d2ae73fa4339a",
    "697dd514085d2ae73fa4339d"
  ]
}
```

### Possible Payloads

#### Payload 1: Update Only Dealer Info (No Brand Changes)
```json
{
  "name": "Updated Electronics",
  "phone": "+9876543210",
  "shopName": "New Shop Name"
}
```

#### Payload 2: Update Only Brands
```json
{
  "brandIds": [
    "697dd514085d2ae73fa4339a",
    "697dd514085d2ae73fa4339d"
  ]
}
```

#### Payload 3: Add More Brands
```json
{
  "brandIds": [
    "697dd514085d2ae73fa4339a",
    "697dd514085d2ae73fa4339b",
    "697dd514085d2ae73fa4339c",
    "697dd514085d2ae73fa4339d",
    "697dd514085d2ae73fa4339e"
  ]
}
```

#### Payload 4: Remove All Brands
```json
{
  "brandIds": []
}
```

#### Payload 5: Update Dealer Info and Brands Together
```json
{
  "name": "Updated Electronics",
  "phone": "+9876543210",
  "shopName": "New Shop Name",
  "isActive": true,
  "brandIds": [
    "697dd514085d2ae73fa4339a",
    "697dd514085d2ae73fa4339b"
  ]
}
```

### Success Response (With Brand Update)

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "dealerCode": "JOHN-ABC123XYZ",
    "name": "Updated Electronics",
    "email": "john@electronics.com",
    "phone": "+9876543210",
    "shopName": "New Shop Name",
    "isActive": true,
    "updatedAt": "2026-02-02T17:00:00.000Z",
    "assignedBrands": [
      {
        "_id": "697dd514085d2ae73fa4339a",
        "name": "Samsung Electronics",
        "isActive": true
      },
      {
        "_id": "697dd514085d2ae73fa4339d",
        "name": "Apple",
        "isActive": true
      }
    ],
    "totalAssignedBrands": 2
  }
}
```

### Success Response (Without Brand Update)

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dealer updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4338b",
    "dealerCode": "JOHN-ABC123XYZ",
    "name": "Updated Electronics",
    "phone": "+9876543210",
    "updatedAt": "2026-02-02T17:00:00.000Z"
  }
}
```

---

## 3. Get Dealer by ID (Enhanced)

**Endpoint:** `GET /api/v1/dealers/:id`

**Access:** Admin Only

**Description:** Get dealer details with assigned brands.

### Request Example

```http
GET /api/v1/dealers/697dd514085d2ae73fa4338b
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
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
        "address": "123 Main St, City",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
      },
      "isActive": true,
      "isDeleted": false,
      "userId": "user_id",
      "createdBy": {
        "_id": "admin_id",
        "name": "Admin User",
        "email": "admin@ibtso.com"
      },
      "createdAt": "2026-02-02T16:00:00.000Z",
      "updatedAt": "2026-02-02T16:00:00.000Z"
    },
    "assetCount": 15,
    "assets": [...],
    "assignedBrands": [
      {
        "brand": {
          "_id": "697dd514085d2ae73fa4339a",
          "name": "Samsung Electronics",
          "isActive": true
        },
        "assignedBy": {
          "_id": "admin_id",
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "assignedAt": "2026-02-02T16:00:00.000Z"
      },
      {
        "brand": {
          "_id": "697dd514085d2ae73fa4339b",
          "name": "LG Electronics",
          "isActive": true
        },
        "assignedBy": {
          "_id": "admin_id",
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "assignedAt": "2026-02-02T16:00:00.000Z"
      }
    ],
    "totalAssignedBrands": 2
  }
}
```

---

## 4. Get All Dealers (Enhanced)

**Endpoint:** `GET /api/v1/dealers`

**Access:** Admin Only

**Description:** Get all dealers with brand count for each dealer.

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Integer | No | 1 | Page number |
| `limit` | Integer | No | 10 | Items per page |
| `search` | String | No | - | Search by name, dealerCode, email, or shopName |
| `isActive` | Boolean | No | - | Filter by active status |

### Request Examples

```http
GET /api/v1/dealers
GET /api/v1/dealers?page=1&limit=20
GET /api/v1/dealers?search=Electronics
GET /api/v1/dealers?isActive=true
GET /api/v1/dealers?search=John&isActive=true&page=1&limit=10
```

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
      "_id": "697dd514085d2ae73fa4338b",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Electronics",
      "email": "john@electronics.com",
      "phone": "+1234567890",
      "shopName": "Electronics Hub",
      "vatRegistration": "VAT123456",
      "location": {
        "address": "123 Main St, City",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
      },
      "isActive": true,
      "isDeleted": false,
      "userId": "user_id",
      "createdBy": {
        "_id": "admin_id",
        "name": "Admin User",
        "email": "admin@ibtso.com"
      },
      "totalAssignedBrands": 3,
      "createdAt": "2026-02-02T16:00:00.000Z",
      "updatedAt": "2026-02-02T16:00:00.000Z"
    },
    {
      "_id": "697dd514085d2ae73fa4338c",
      "dealerCode": "MARY-DEF456GHI",
      "name": "Mary's Store",
      "email": "mary@store.com",
      "phone": "+9876543210",
      "shopName": "Tech Store",
      "isActive": true,
      "isDeleted": false,
      "totalAssignedBrands": 5,
      "createdAt": "2026-02-02T16:30:00.000Z",
      "updatedAt": "2026-02-02T16:30:00.000Z"
    }
  ]
}
```

**New Field:**
- `totalAssignedBrands` - Number of brands assigned to each dealer

---

## 🧪 Testing Scenarios

### Scenario 1: Create Dealer with Brands

**Step 1: Create Dealer with 3 Brands**
```bash
POST /api/v1/dealers
{
  "name": "Tech Store",
  "email": "tech@store.com",
  "brandIds": [
    "brand1_id",
    "brand2_id",
    "brand3_id"
  ]
}
```

**Expected Result:**
- ✅ Dealer created
- ✅ 3 brand assignments created
- ✅ Response includes assigned brands
- ✅ Credentials generated

---

### Scenario 2: Create Dealer Without Brands, Add Later

**Step 1: Create Dealer**
```bash
POST /api/v1/dealers
{
  "name": "Tech Store",
  "email": "tech@store.com"
}
```

**Step 2: Update to Add Brands**
```bash
PUT /api/v1/dealers/{dealerId}
{
  "brandIds": [
    "brand1_id",
    "brand2_id"
  ]
}
```

**Expected Result:**
- ✅ Dealer created without brands
- ✅ Brands assigned in update
- ✅ Response shows 2 assigned brands

---

### Scenario 3: Update Dealer Brands (Replace)

**Step 1: Dealer has 3 brands**

**Step 2: Update with 2 Different Brands**
```bash
PUT /api/v1/dealers/{dealerId}
{
  "brandIds": [
    "brand4_id",
    "brand5_id"
  ]
}
```

**Expected Result:**
- ✅ Old 3 brands deactivated
- ✅ New 2 brands assigned
- ✅ Response shows 2 assigned brands

---

### Scenario 4: Remove All Brands

**Step 1: Dealer has 3 brands**

**Step 2: Update with Empty Array**
```bash
PUT /api/v1/dealers/{dealerId}
{
  "brandIds": []
}
```

**Expected Result:**
- ✅ All 3 brands deactivated
- ✅ Response shows 0 assigned brands

---

### Scenario 5: Invalid Brand ID

**Step 1: Try to Assign Non-existent Brand**
```bash
POST /api/v1/dealers
{
  "name": "Tech Store",
  "brandIds": ["invalid_brand_id"]
}
```

**Expected Result:**
- ❌ Error: "One or more brand IDs are invalid"
- ❌ Dealer not created

---

### Scenario 6: View Dealer with Brands

**Step 1: Get Dealer Details**
```bash
GET /api/v1/dealers/{dealerId}
```

**Expected Result:**
- ✅ Dealer details returned
- ✅ Assigned brands array included
- ✅ Total assigned brands count
- ✅ Assignment history (who assigned, when)

---

## 📊 Response Fields

### Create/Update Dealer Response (With Brands)

| Field | Type | Description |
|-------|------|-------------|
| `dealer` | Object | Dealer information |
| `assignedBrands` | Array | List of assigned brands |
| `totalAssignedBrands` | Number | Count of assigned brands |
| `credentials` | Object | Login credentials (create only) |

### Get Dealer Response

| Field | Type | Description |
|-------|------|-------------|
| `dealer` | Object | Dealer information |
| `assetCount` | Number | Number of assets |
| `assets` | Array | List of assets |
| `assignedBrands` | Array | Brands with assignment details |
| `totalAssignedBrands` | Number | Count of assigned brands |

---

## 🔄 Brand Assignment Logic

### On Create Dealer
1. Validate all `brandIds` exist
2. Create dealer
3. Create `BrandAssignment` records for each brand
4. Return dealer with assigned brands

### On Update Dealer
1. If `brandIds` provided:
   - Validate all `brandIds` exist
   - Deactivate all existing assignments
   - Create new assignments for provided brands
   - Reactivate if brand was previously assigned
   - Return dealer with updated brands
2. If `brandIds` not provided:
   - Update dealer info only
   - Don't touch brand assignments

### On Get Dealer
1. Fetch dealer details
2. Fetch active brand assignments
3. Populate brand and assignedBy details
4. Return complete information

---

## ✅ Features Summary

| Feature | Status |
|---------|--------|
| Assign brands on dealer create | ✅ Working |
| Update brand assignments | ✅ Working |
| Remove all brands | ✅ Working |
| View assigned brands | ✅ Working |
| Validate brand IDs | ✅ Working |
| Assignment history tracking | ✅ Working |
| Reactivate previous assignments | ✅ Working |
| Soft delete on unassign | ✅ Working |

---

## 📝 Files Modified

| File | Changes |
|------|---------|
| `middleware/validator.js` | Added `brandIds` validation to create/update dealer |
| `controllers/dealerController.js` | Added brand assignment logic to create/update/get |

**Total:** 2 files modified

---

## 🔗 Related Documentation

- **Brand Assignment System:** `BRAND_ASSIGNMENT_SYSTEM.md`
- **Brand & Client API:** `BRAND_CLIENT_API_REFERENCE.md`

---

## 💡 Key Points

1. **Optional Field:** `brandIds` is completely optional in both create and update
2. **Validation:** All brand IDs are validated before assignment
3. **Atomic Operations:** Brand assignments are created/updated atomically
4. **History Preserved:** Old assignments are deactivated, not deleted
5. **Reactivation:** If a brand was previously assigned and unassigned, it will be reactivated instead of creating a duplicate
6. **No Breaking Changes:** Existing dealer create/update functionality unchanged

---

**Dealer brand assignment system is ready!** 🎉
