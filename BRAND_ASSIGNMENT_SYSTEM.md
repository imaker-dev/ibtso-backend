# 🏷️ Brand Assignment System - Complete Guide

## 🎯 Overview

**New System:** Admin creates brands independently, then assigns them to multiple dealers (many-to-many relationship).

**Key Changes:**
- ✅ Brands are created without dealer assignment
- ✅ One brand can be assigned to multiple dealers
- ✅ One dealer can have multiple brands
- ✅ Assignment tracking with history
- ✅ Soft delete for unassignments

---

## 📦 New Architecture

### 1. Brand Model (Updated)

**File:** `models/Brand.js`

```javascript
{
  name: String (optional, auto-generated if not provided),
  isActive: Boolean (default: true),
  isDeleted: Boolean (default: false),
  createdBy: ObjectId (ref: User),
  updatedBy: ObjectId (ref: User),
  timestamps: true
}
```

**Changes:**
- ❌ Removed `dealerId` field
- ✅ Brands are now independent entities
- ✅ No dealer reference in brand model

---

### 2. BrandAssignment Model (New)

**File:** `models/BrandAssignment.js`

```javascript
{
  brandId: ObjectId (required, ref: Brand),
  dealerId: ObjectId (required, ref: Dealer),
  isActive: Boolean (default: true),
  assignedBy: ObjectId (required, ref: User),
  unassignedBy: ObjectId (ref: User),
  unassignedAt: Date,
  timestamps: true
}
```

**Features:**
- ✅ Many-to-many relationship between brands and dealers
- ✅ Unique compound index on `(brandId, dealerId)`
- ✅ Tracks who assigned/unassigned
- ✅ Soft delete support (isActive flag)
- ✅ Assignment history preserved

---

## 🔄 Workflow

### Step 1: Admin Creates Brand
```
Admin creates brand "Samsung" (no dealer specified)
```

### Step 2: Admin Assigns Brand to Dealers
```
Admin assigns "Samsung" to:
- Dealer A
- Dealer B
- Dealer C
```

### Step 3: Multiple Dealers Have Same Brand
```
Dealer A has: Samsung, LG, Sony
Dealer B has: Samsung, Apple
Dealer C has: Samsung, Xiaomi
```

---

## 🏷️ Brand API (Updated)

### Base URL: `/api/v1/brands`

---

## 1. Create Brand

**Endpoint:** `POST /api/v1/brands`

**Access:** Admin Only

**Description:** Create a new brand (independent of dealers).

### Request Body

```json
{
  "name": "Samsung Electronics"  // Optional
}
```

### Possible Payloads

#### Payload 1: With Name
```json
{
  "name": "Samsung Electronics"
}
```

#### Payload 2: Without Name (Auto-generated)
```json
{}
```

### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Brand created successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4339a",
    "name": "Samsung Electronics",
    "isActive": true,
    "isDeleted": false,
    "createdBy": {
      "_id": "697dd514085d2ae73fa43380",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-02T10:15:30.000Z",
    "updatedAt": "2026-02-02T10:15:30.000Z"
  }
}
```

### Error Responses

#### Unauthorized
**Status Code:** `403 Forbidden`
```json
{
  "success": false,
  "message": "Access denied. Admin role required"
}
```

---

## 2. Get All Brands

**Endpoint:** `GET /api/v1/brands`

**Access:** Admin Only

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name
- `isActive` - Filter by active status

### Request Examples

```http
GET /api/v1/brands
GET /api/v1/brands?search=Samsung
GET /api/v1/brands?isActive=true&page=1&limit=20
```

### Success Response

```json
{
  "success": true,
  "data": {
    "brands": [
      {
        "_id": "697dd514085d2ae73fa4339a",
        "name": "Samsung Electronics",
        "isActive": true,
        "createdBy": {
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "createdAt": "2026-02-02T10:15:30.000Z"
      }
    ],
    "totalPages": 5,
    "currentPage": 1,
    "totalBrands": 47
  }
}
```

---

## 3. Get Brand by ID

**Endpoint:** `GET /api/v1/brands/:id`

**Access:** Admin Only

**Description:** Get brand details with all assigned dealers.

### Request Example

```http
GET /api/v1/brands/697dd514085d2ae73fa4339a
```

### Success Response

```json
{
  "success": true,
  "data": {
    "_id": "697dd514085d2ae73fa4339a",
    "name": "Samsung Electronics",
    "isActive": true,
    "isDeleted": false,
    "createdBy": {
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "updatedBy": {
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-02T10:15:30.000Z",
    "updatedAt": "2026-02-02T11:30:00.000Z",
    "assignedDealers": [
      {
        "dealer": {
          "_id": "697dd514085d2ae73fa4338b",
          "dealerCode": "JOHN-ABC123XYZ",
          "name": "John's Shop",
          "shopName": "Electronics Hub",
          "email": "john@shop.com"
        },
        "assignedBy": {
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "assignedAt": "2026-02-02T11:00:00.000Z"
      },
      {
        "dealer": {
          "_id": "697dd514085d2ae73fa4338c",
          "dealerCode": "MARY-DEF456GHI",
          "name": "Mary's Store",
          "shopName": "Tech Store",
          "email": "mary@store.com"
        },
        "assignedBy": {
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "assignedAt": "2026-02-02T11:05:00.000Z"
      }
    ],
    "totalAssignedDealers": 2
  }
}
```

---

## 4. Update Brand

**Endpoint:** `PUT /api/v1/brands/:id`

**Access:** Admin Only

### Request Body

```json
{
  "name": "Samsung Electronics Global",
  "isActive": true
}
```

### Success Response

```json
{
  "success": true,
  "message": "Brand updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4339a",
    "name": "Samsung Electronics Global",
    "isActive": true,
    "updatedBy": {
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "updatedAt": "2026-02-02T12:00:00.000Z"
  }
}
```

---

## 5. Delete Brand

**Endpoint:** `DELETE /api/v1/brands/:id`

**Access:** Admin Only

**Description:** Soft delete brand (marks as deleted).

### Request Example

```http
DELETE /api/v1/brands/697dd514085d2ae73fa4339a
```

### Success Response

```json
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

---

## 🔗 Brand Assignment API (New)

### Base URL: `/api/v1/brands`

---

## 6. Assign Brand to Dealers

**Endpoint:** `POST /api/v1/brands/:brandId/assign-dealers`

**Access:** Admin Only

**Description:** Assign a brand to one or more dealers. Prevents duplicates automatically.

### Request Body

```json
{
  "dealerIds": ["dealer1_id", "dealer2_id", "dealer3_id"]
}
```

### Possible Payloads

#### Payload 1: Assign to Single Dealer
```json
{
  "dealerIds": ["697dd514085d2ae73fa4338b"]
}
```

#### Payload 2: Assign to Multiple Dealers
```json
{
  "dealerIds": [
    "697dd514085d2ae73fa4338b",
    "697dd514085d2ae73fa4338c",
    "697dd514085d2ae73fa4338d"
  ]
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Brand assigned to 2 new dealer(s). 1 dealer(s) already assigned.",
  "data": {
    "brand": {
      "_id": "697dd514085d2ae73fa4339a",
      "name": "Samsung Electronics"
    },
    "totalAssignedDealers": 3,
    "assignedDealers": [
      {
        "dealer": {
          "_id": "697dd514085d2ae73fa4338b",
          "dealerCode": "JOHN-ABC123XYZ",
          "name": "John's Shop",
          "shopName": "Electronics Hub",
          "email": "john@shop.com"
        },
        "assignedBy": {
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "assignedAt": "2026-02-02T11:00:00.000Z"
      },
      {
        "dealer": {
          "_id": "697dd514085d2ae73fa4338c",
          "dealerCode": "MARY-DEF456GHI",
          "name": "Mary's Store",
          "shopName": "Tech Store",
          "email": "mary@store.com"
        },
        "assignedBy": {
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "assignedAt": "2026-02-02T11:05:00.000Z"
      }
    ]
  }
}
```

### Error Responses

#### Brand Not Found
```json
{
  "success": false,
  "message": "Brand not found"
}
```

#### Missing dealerIds
```json
{
  "success": false,
  "message": "Please provide an array of dealer IDs"
}
```

#### Invalid Dealer IDs
```json
{
  "success": false,
  "message": "One or more dealer IDs are invalid"
}
```

---

## 7. Unassign Brand from Dealers

**Endpoint:** `POST /api/v1/brands/:brandId/unassign-dealers`

**Access:** Admin Only

**Description:** Remove brand assignment from one or more dealers (soft delete).

### Request Body

```json
{
  "dealerIds": ["dealer1_id", "dealer2_id"]
}
```

### Possible Payloads

#### Payload 1: Unassign from Single Dealer
```json
{
  "dealerIds": ["697dd514085d2ae73fa4338b"]
}
```

#### Payload 2: Unassign from Multiple Dealers
```json
{
  "dealerIds": [
    "697dd514085d2ae73fa4338b",
    "697dd514085d2ae73fa4338c"
  ]
}
```

### Success Response

```json
{
  "success": true,
  "message": "Brand unassigned from 2 dealer(s)",
  "data": {
    "brand": {
      "_id": "697dd514085d2ae73fa4339a",
      "name": "Samsung Electronics"
    },
    "totalAssignedDealers": 1,
    "assignedDealers": [
      {
        "dealer": {
          "_id": "697dd514085d2ae73fa4338d",
          "dealerCode": "PETE-JKL789MNO",
          "name": "Pete's Electronics"
        },
        "assignedBy": {
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "assignedAt": "2026-02-02T11:10:00.000Z"
      }
    ]
  }
}
```

---

## 8. Get Dealers for Brand

**Endpoint:** `GET /api/v1/brands/:brandId/dealers`

**Access:** Admin Only

**Description:** Get all dealers assigned to a specific brand.

### Request Example

```http
GET /api/v1/brands/697dd514085d2ae73fa4339a/dealers
```

### Success Response

```json
{
  "success": true,
  "data": {
    "brand": {
      "_id": "697dd514085d2ae73fa4339a",
      "name": "Samsung Electronics",
      "isActive": true
    },
    "totalAssignedDealers": 3,
    "dealers": [
      {
        "dealer": {
          "_id": "697dd514085d2ae73fa4338b",
          "dealerCode": "JOHN-ABC123XYZ",
          "name": "John's Shop",
          "shopName": "Electronics Hub",
          "email": "john@shop.com",
          "phone": "+1234567890",
          "location": {
            "address": "123 Main St"
          }
        },
        "assignedBy": {
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "assignedAt": "2026-02-02T11:00:00.000Z"
      }
    ]
  }
}
```

---

## 9. Get Brands by Dealer

**Endpoint:** `GET /api/v1/brands/dealer/:dealerId`

**Access:** Admin Only

**Description:** Get all brands assigned to a specific dealer.

### Request Example

```http
GET /api/v1/brands/dealer/697dd514085d2ae73fa4338b
```

### Success Response

```json
{
  "success": true,
  "data": {
    "dealer": {
      "dealerId": "697dd514085d2ae73fa4338b",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Shop",
      "shopName": "Electronics Hub"
    },
    "totalBrands": 3,
    "brands": [
      {
        "_id": "697dd514085d2ae73fa4339a",
        "name": "Samsung Electronics",
        "isActive": true,
        "assignedBy": {
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "assignedAt": "2026-02-02T11:00:00.000Z"
      },
      {
        "_id": "697dd514085d2ae73fa4339b",
        "name": "LG Electronics",
        "isActive": true,
        "assignedBy": {
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "assignedAt": "2026-02-02T11:05:00.000Z"
      }
    ]
  }
}
```

---

## 10. Get All Brand Assignments

**Endpoint:** `GET /api/v1/brands/assignments/all`

**Access:** Admin Only

**Description:** Get all brand-dealer assignments with pagination.

### Query Parameters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `brandId` - Filter by brand ID
- `dealerId` - Filter by dealer ID

### Request Examples

```http
GET /api/v1/brands/assignments/all
GET /api/v1/brands/assignments/all?brandId=697dd514085d2ae73fa4339a
GET /api/v1/brands/assignments/all?dealerId=697dd514085d2ae73fa4338b
GET /api/v1/brands/assignments/all?page=2&limit=20
```

### Success Response

```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "_id": "assignment_id_1",
        "brandId": {
          "_id": "697dd514085d2ae73fa4339a",
          "name": "Samsung Electronics",
          "isActive": true
        },
        "dealerId": {
          "_id": "697dd514085d2ae73fa4338b",
          "dealerCode": "JOHN-ABC123XYZ",
          "name": "John's Shop",
          "shopName": "Electronics Hub",
          "email": "john@shop.com"
        },
        "assignedBy": {
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "isActive": true,
        "createdAt": "2026-02-02T11:00:00.000Z",
        "updatedAt": "2026-02-02T11:00:00.000Z"
      }
    ],
    "totalPages": 8,
    "currentPage": 1,
    "totalAssignments": 75
  }
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Create Brand and Assign to Multiple Dealers

**Step 1: Create Brand**
```bash
POST /api/v1/brands
{
  "name": "Samsung Electronics"
}
```

**Step 2: Assign to 3 Dealers**
```bash
POST /api/v1/brands/{brandId}/assign-dealers
{
  "dealerIds": [
    "dealer1_id",
    "dealer2_id",
    "dealer3_id"
  ]
}
```

**Result:** ✅ Samsung assigned to 3 dealers

---

### Scenario 2: Assign Same Brand to More Dealers

**Step 1: Brand already assigned to 3 dealers**

**Step 2: Assign to 2 more dealers**
```bash
POST /api/v1/brands/{brandId}/assign-dealers
{
  "dealerIds": [
    "dealer4_id",
    "dealer5_id"
  ]
}
```

**Result:** ✅ Samsung now assigned to 5 dealers total

---

### Scenario 3: Try to Assign Duplicate

**Step 1: Brand already assigned to dealer1**

**Step 2: Try to assign again**
```bash
POST /api/v1/brands/{brandId}/assign-dealers
{
  "dealerIds": ["dealer1_id"]
}
```

**Result:** ✅ Message: "0 new dealer(s). 1 dealer(s) already assigned."

---

### Scenario 4: Unassign from Some Dealers

**Step 1: Brand assigned to 5 dealers**

**Step 2: Unassign from 2 dealers**
```bash
POST /api/v1/brands/{brandId}/unassign-dealers
{
  "dealerIds": [
    "dealer1_id",
    "dealer2_id"
  ]
}
```

**Result:** ✅ Brand now assigned to 3 dealers

---

### Scenario 5: View All Brands for a Dealer

```bash
GET /api/v1/brands/dealer/{dealerId}
```

**Result:** ✅ Returns all brands assigned to that dealer

---

### Scenario 6: View All Dealers for a Brand

```bash
GET /api/v1/brands/{brandId}/dealers
```

**Result:** ✅ Returns all dealers assigned to that brand

---

## 📊 Database Structure

### Before (Old System)
```
Brand
├── _id
├── name
├── dealerId  ← One-to-one relationship
└── ...
```

### After (New System)
```
Brand                    BrandAssignment              Dealer
├── _id                  ├── _id                      ├── _id
├── name                 ├── brandId ────────────────>├── dealerCode
└── ...                  ├── dealerId ───────────────>├── name
                         ├── assignedBy               └── ...
                         ├── isActive
                         └── ...
```

**Many-to-Many Relationship:**
- One brand → Many dealers
- One dealer → Many brands

---

## ✅ Summary

| Feature | Status |
|---------|--------|
| Independent brand creation | ✅ Working |
| Assign brand to multiple dealers | ✅ Working |
| Unassign brand from dealers | ✅ Working |
| View dealers for brand | ✅ Working |
| View brands for dealer | ✅ Working |
| Prevent duplicate assignments | ✅ Working |
| Assignment history tracking | ✅ Working |
| Soft delete for unassignments | ✅ Working |
| Pagination support | ✅ Working |

---

## 📝 Files Modified/Created

| File | Action | Description |
|------|--------|-------------|
| `models/Brand.js` | Modified | Removed dealerId field |
| `models/BrandAssignment.js` | Created | New many-to-many model |
| `controllers/brandController.js` | Modified | Updated all functions |
| `controllers/brandAssignmentController.js` | Created | New assignment logic |
| `middleware/validator.js` | Modified | Updated validation |
| `routes/brandRoutes.js` | Modified | Added assignment routes |

**Total:** 2 new files, 4 modified files

---

**System is now ready for brand-dealer many-to-many assignments!** 🎉
