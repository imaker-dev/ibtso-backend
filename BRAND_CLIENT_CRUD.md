# 🏷️ Brand & Client CRUD - Complete Guide

## 🎯 Overview

Two new modules added to the system:

1. **Brand CRUD** - Admin creates and manages brands on behalf of dealers
2. **Client CRUD** - Admin manages clients and assigns multiple dealers to each client

---

## 📦 New Models

### 1. Brand Model

**File:** `models/Brand.js`

```javascript
{
  name: String (optional),
  dealerId: ObjectId (required, ref: Dealer),
  isActive: Boolean (default: true),
  isDeleted: Boolean (default: false),
  createdBy: ObjectId (required, ref: User),
  updatedBy: ObjectId (ref: User),
  timestamps: true
}
```

**Features:**
- ✅ Name is optional (auto-generated if not provided)
- ✅ Belongs to a dealer
- ✅ Soft delete support
- ✅ Automatic filtering of deleted brands

---

### 2. Client Model

**File:** `models/Client.js`

```javascript
{
  name: String (required),
  email: String (optional, unique, sparse),
  phone: String (optional),
  company: String (optional),
  address: String (optional),
  vatin: String (optional, uppercase),
  placeOfSupply: String (optional),
  country: String (optional),
  dealerIds: [ObjectId] (array, ref: Dealer),
  isActive: Boolean (default: true),
  isDeleted: Boolean (default: false),
  createdBy: ObjectId (required, ref: User),
  updatedBy: ObjectId (ref: User),
  timestamps: true
}
```

**Features:**
- ✅ Only name is required
- ✅ Can assign multiple dealers
- ✅ Email is unique with sparse index
- ✅ VATIN (VAT Identification Number) support
- ✅ Place of supply and country fields
- ✅ Soft delete support

---

## 🏷️ Brand CRUD API

### Base URL: `/api/v1/brands`

**⚠️ All brand operations are ADMIN ONLY**

### 1. Create Brand

**Endpoint:** `POST /api/v1/brands`

**Access:** Admin Only

**Request Body:**
```json
{
  "name": "Samsung",           // Optional (auto-generated if not provided)
  "dealerId": "dealer_id"      // Required
}
```

**Example 1: Create Brand with Name**
```bash
POST /api/v1/brands
{
  "name": "LG Electronics",
  "dealerId": "697dd514085d2ae73fa4338b"
}
```

**Example 2: Create Brand without Name (Auto-generated)**
```bash
POST /api/v1/brands
{
  "dealerId": "697dd514085d2ae73fa4338b"
  // name will be auto-generated like "Brand_1738483200000"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Brand created successfully",
  "data": {
    "_id": "brand_id",
    "name": "Samsung",
    "dealerId": {
      "_id": "dealer_id",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Shop",
      "shopName": "Electronics Hub"
    },
    "isActive": true,
    "createdBy": {
      "_id": "user_id",
      "name": "Admin",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-02T07:12:00.000Z",
    "updatedAt": "2026-02-02T07:12:00.000Z"
  }
}
```

---

### 2. Get All Brands

**Endpoint:** `GET /api/v1/brands`

**Access:** Admin Only

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by name
- `dealerId` - Filter by dealer
- `isActive` - Filter by active status

**Examples:**

```bash
# Get all brands
GET /api/v1/brands

# Get brands for specific dealer
GET /api/v1/brands?dealerId=697dd514085d2ae73fa4338b

# Search brands
GET /api/v1/brands?search=Samsung

# Get inactive brands
GET /api/v1/brands?isActive=false

# Pagination
GET /api/v1/brands?page=2&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "brands": [
      {
        "_id": "brand_id",
        "name": "Samsung",
        "dealerId": {
          "dealerCode": "JOHN-ABC123XYZ",
          "name": "John's Shop"
        },
        "isActive": true,
        "createdAt": "2026-02-02T07:12:00.000Z"
      }
    ],
    "totalPages": 5,
    "currentPage": 1,
    "totalBrands": 47
  }
}
```

---

### 3. Get Brand by ID

**Endpoint:** `GET /api/v1/brands/:id`

**Access:** Admin Only

**Example:**
```bash
GET /api/v1/brands/brand_id_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "brand_id",
    "name": "Samsung",
    "dealerId": {
      "_id": "dealer_id",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Shop",
      "email": "john@shop.com"
    },
    "isActive": true,
    "createdBy": {
      "name": "Admin",
      "email": "admin@ibtso.com"
    },
    "updatedBy": {
      "name": "John Dealer",
      "email": "john@shop.com"
    },
    "createdAt": "2026-02-02T07:12:00.000Z",
    "updatedAt": "2026-02-02T08:30:00.000Z"
  }
}
```

---

### 4. Update Brand

**Endpoint:** `PUT /api/v1/brands/:id`

**Access:** Admin Only

**Request Body:**
```json
{
  "name": "Samsung Electronics",
  "isActive": false
}
```

**Example:**
```bash
PUT /api/v1/brands/brand_id_here
{
  "name": "Updated Brand Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Brand updated successfully",
  "data": {
    "_id": "brand_id",
    "name": "Samsung Electronics",
    "isActive": false,
    "updatedBy": {
      "name": "John Dealer",
      "email": "john@shop.com"
    },
    "updatedAt": "2026-02-02T09:00:00.000Z"
  }
}
```

---

### 5. Delete Brand

**Endpoint:** `DELETE /api/v1/brands/:id`

**Access:** Admin Only

**Example:**
```bash
DELETE /api/v1/brands/brand_id_here
```

**Response:**
```json
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

**Note:** Soft delete - brand is marked as deleted but not removed from database.

---

### 6. Get Brands by Dealer

**Endpoint:** `GET /api/v1/brands/dealer/:dealerId`

**Access:** Admin Only

**Example:**
```bash
GET /api/v1/brands/dealer/697dd514085d2ae73fa4338b
```

**Response:**
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
    "totalBrands": 5,
    "brands": [
      {
        "_id": "brand1_id",
        "name": "Samsung",
        "isActive": true,
        "createdAt": "2026-02-02T07:12:00.000Z"
      },
      {
        "_id": "brand2_id",
        "name": "LG",
        "isActive": true,
        "createdAt": "2026-02-02T07:15:00.000Z"
      }
    ]
  }
}
```

---

## 👥 Client CRUD API

### Base URL: `/api/v1/clients`

### 1. Create Client

**Endpoint:** `POST /api/v1/clients`

**Access:** Admin Only

**Request Body:**
```json
{
  "name": "ABC Corporation",
  "email": "contact@abc.com",
  "phone": "+1234567890",
  "company": "ABC Corp Ltd",
  "address": "P.O.Box:880, P.C 112, Ruwi",
  "vatin": "OM1100001389",
  "placeOfSupply": "Sultanate of Oman",
  "country": "Sultanate of Oman",
  "dealerIds": ["dealer1_id", "dealer2_id"]
}
```

**Minimal (Name Only):**
```bash
POST /api/v1/clients
{
  "name": "Quick Client"
}
```

**Full Example:**
```bash
POST /api/v1/clients
{
  "name": "Tech Solutions Inc",
  "email": "info@techsolutions.com",
  "phone": "+9876543210",
  "company": "Tech Solutions Incorporated",
  "address": "456 Tech Avenue, Silicon Valley",
  "vatin": "US1234567890",
  "placeOfSupply": "California, USA",
  "country": "United States",
  "dealerIds": [
    "697dd514085d2ae73fa4338b",
    "697dd514085d2ae73fa4338c"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "_id": "client_id",
    "name": "Tech Solutions Inc",
    "email": "info@techsolutions.com",
    "phone": "+9876543210",
    "company": "Tech Solutions Incorporated",
    "address": "456 Tech Avenue, Silicon Valley",
    "dealerIds": [
      {
        "_id": "dealer1_id",
        "dealerCode": "JOHN-ABC123XYZ",
        "name": "John's Shop",
        "shopName": "Electronics Hub",
        "email": "john@shop.com"
      },
      {
        "_id": "dealer2_id",
        "dealerCode": "MARY-DEF456GHI",
        "name": "Mary's Store",
        "shopName": "Tech Store",
        "email": "mary@store.com"
      }
    ],
    "isActive": true,
    "createdBy": {
      "name": "Admin",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-02T10:00:00.000Z"
  }
}
```

---

### 2. Get All Clients

**Endpoint:** `GET /api/v1/clients`

**Access:** Admin Only

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search by name, email, or company
- `isActive` - Filter by active status

**Examples:**

```bash
# Get all clients
GET /api/v1/clients

# Search clients
GET /api/v1/clients?search=Tech

# Get inactive clients
GET /api/v1/clients?isActive=false

# Pagination
GET /api/v1/clients?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "_id": "client_id",
        "name": "Tech Solutions Inc",
        "email": "info@techsolutions.com",
        "company": "Tech Solutions Incorporated",
        "dealerIds": [
          {
            "dealerCode": "JOHN-ABC123XYZ",
            "name": "John's Shop"
          }
        ],
        "isActive": true,
        "createdAt": "2026-02-02T10:00:00.000Z"
      }
    ],
    "totalPages": 3,
    "currentPage": 1,
    "totalClients": 28
  }
}
```

---

### 3. Get Client by ID

**Endpoint:** `GET /api/v1/clients/:id`

**Access:** Admin Only

**Example:**
```bash
GET /api/v1/clients/client_id_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "client_id",
    "name": "Tech Solutions Inc",
    "email": "info@techsolutions.com",
    "phone": "+9876543210",
    "company": "Tech Solutions Incorporated",
    "address": "456 Tech Avenue, Silicon Valley",
    "vatin": "US1234567890",
    "placeOfSupply": "California, USA",
    "country": "United States",
    "dealerIds": [
      {
        "_id": "dealer_id",
        "dealerCode": "JOHN-ABC123XYZ",
        "name": "John's Shop",
        "shopName": "Electronics Hub",
        "email": "john@shop.com",
        "phone": "+1234567890",
        "location": {
          "address": "123 Main St"
        }
      }
    ],
    "isActive": true,
    "createdBy": {
      "name": "Admin",
      "email": "admin@ibtso.com"
    },
    "updatedBy": {
      "name": "Admin",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-02T10:00:00.000Z",
    "updatedAt": "2026-02-02T11:30:00.000Z"
  }
}
```

---

### 4. Update Client

**Endpoint:** `PUT /api/v1/clients/:id`

**Access:** Admin Only

**Request Body:**
```json
{
  "name": "Updated Client Name",
  "email": "newemail@client.com",
  "phone": "+9999999999",
  "company": "New Company Name",
  "address": "New Address",
  "vatin": "OM9999999999",
  "placeOfSupply": "Muscat, Oman",
  "country": "Oman",
  "dealerIds": ["dealer1_id", "dealer2_id", "dealer3_id"],
  "isActive": false
}
```

**Example:**
```bash
PUT /api/v1/clients/client_id_here
{
  "phone": "+1111111111",
  "address": "789 New Street, New City"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "_id": "client_id",
    "name": "Tech Solutions Inc",
    "phone": "+1111111111",
    "address": "789 New Street, New City",
    "updatedBy": {
      "name": "Admin",
      "email": "admin@ibtso.com"
    },
    "updatedAt": "2026-02-02T12:00:00.000Z"
  }
}
```

---

### 5. Delete Client

**Endpoint:** `DELETE /api/v1/clients/:id`

**Access:** Admin Only

**Example:**
```bash
DELETE /api/v1/clients/client_id_here
```

**Response:**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

**Note:** Soft delete - client is marked as deleted but not removed.

---

### 6. Assign Dealers to Client

**Endpoint:** `POST /api/v1/clients/:clientId/assign-dealers`

**Access:** Admin Only

**Request Body:**
```json
{
  "dealerIds": ["dealer1_id", "dealer2_id", "dealer3_id"]
}
```

**Example:**
```bash
POST /api/v1/clients/client_id_here/assign-dealers
{
  "dealerIds": [
    "697dd514085d2ae73fa4338b",
    "697dd514085d2ae73fa4338c"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 dealer(s) assigned to client",
  "data": {
    "_id": "client_id",
    "name": "Tech Solutions Inc",
    "dealerIds": [
      {
        "_id": "dealer1_id",
        "dealerCode": "JOHN-ABC123XYZ",
        "name": "John's Shop",
        "shopName": "Electronics Hub",
        "email": "john@shop.com"
      },
      {
        "_id": "dealer2_id",
        "dealerCode": "MARY-DEF456GHI",
        "name": "Mary's Store",
        "shopName": "Tech Store",
        "email": "mary@store.com"
      }
    ]
  }
}
```

**Features:**
- ✅ Adds new dealers to existing list
- ✅ Avoids duplicates automatically
- ✅ Validates all dealer IDs before assignment

---

### 7. Remove Dealers from Client

**Endpoint:** `POST /api/v1/clients/:clientId/remove-dealers`

**Access:** Admin Only

**Request Body:**
```json
{
  "dealerIds": ["dealer1_id", "dealer2_id"]
}
```

**Example:**
```bash
POST /api/v1/clients/client_id_here/remove-dealers
{
  "dealerIds": ["697dd514085d2ae73fa4338b"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dealers removed from client",
  "data": {
    "_id": "client_id",
    "name": "Tech Solutions Inc",
    "dealerIds": [
      {
        "_id": "dealer2_id",
        "dealerCode": "MARY-DEF456GHI",
        "name": "Mary's Store"
      }
    ]
  }
}
```

---

### 8. Get Clients by Dealer

**Endpoint:** `GET /api/v1/clients/dealer/:dealerId`

**Access:** Admin Only

**Example:**
```bash
GET /api/v1/clients/dealer/697dd514085d2ae73fa4338b
```

**Response:**
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
    "totalClients": 3,
    "clients": [
      {
        "_id": "client1_id",
        "name": "Tech Solutions Inc",
        "email": "info@techsolutions.com",
        "company": "Tech Solutions Incorporated",
        "isActive": true
      },
      {
        "_id": "client2_id",
        "name": "ABC Corporation",
        "email": "contact@abc.com",
        "company": "ABC Corp Ltd",
        "isActive": true
      }
    ]
  }
}
```

---

## 🔒 Permissions Matrix

### Brand Operations

| Operation | Admin | Dealer | Notes |
|-----------|-------|--------|-------|
| Create Brand | ✅ | ❌ | Admin creates on behalf of dealer |
| Get All Brands | ✅ | ❌ | Admin only |
| Get Brand by ID | ✅ | ❌ | Admin only |
| Update Brand | ✅ | ❌ | Admin only |
| Delete Brand | ✅ | ❌ | Admin only |
| Get Brands by Dealer | ✅ | ❌ | Admin only |

### Client Operations

| Operation | Admin | Dealer | Notes |
|-----------|-------|--------|-------|
| Create Client | ✅ | ❌ | Admin only |
| Get All Clients | ✅ | ❌ | Admin only |
| Get Client by ID | ✅ | ❌ | Admin only |
| Update Client | ✅ | ❌ | Admin only |
| Delete Client | ✅ | ❌ | Admin only |
| Assign Dealers | ✅ | ❌ | Admin only |
| Remove Dealers | ✅ | ❌ | Admin only |
| Get Clients by Dealer | ✅ | ❌ | Admin only |

---

## 🧪 Testing Scenarios

### Brand Testing

#### Test 1: Admin Creates Brand for Dealer
```bash
curl -X POST http://localhost:5000/api/v1/brands \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LG",
    "dealerId": "697dd514085d2ae73fa4338b"
  }'
```

**Expected:** ✅ Brand created for specified dealer

---

#### Test 4: Dealer Tries to View Another Dealer's Brand
```bash
curl -X GET http://localhost:5000/api/v1/brands/other_dealer_brand_id \
  -H "Authorization: Bearer {dealer_token}"
```

**Expected:** ❌ Error: "You can only view your own brands"

---

#### Test 5: Get All Brands (Dealer)
```bash
curl -X GET http://localhost:5000/api/v1/brands \
  -H "Authorization: Bearer {dealer_token}"
```

**Expected:** ✅ Returns only dealer's own brands

---

### Client Testing

#### Test 6: Admin Creates Client
```bash
curl -X POST http://localhost:5000/api/v1/clients \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Corp",
    "email": "info@techcorp.com",
    "dealerIds": ["dealer1_id", "dealer2_id"]
  }'
```

**Expected:** ✅ Client created with 2 dealers assigned

---

#### Test 7: Admin Assigns More Dealers
```bash
curl -X POST http://localhost:5000/api/v1/clients/client_id/assign-dealers \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "dealerIds": ["dealer3_id", "dealer4_id"]
  }'
```

**Expected:** ✅ 2 new dealers added (total 4 dealers)

---

#### Test 8: Admin Removes Dealer
```bash
curl -X POST http://localhost:5000/api/v1/clients/client_id/remove-dealers \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "dealerIds": ["dealer1_id"]
  }'
```

**Expected:** ✅ Dealer removed (total 3 dealers)

---

#### Test 9: Dealer Tries to Create Client
```bash
curl -X POST http://localhost:5000/api/v1/clients \
  -H "Authorization: Bearer {dealer_token}" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Client"}'
```

**Expected:** ❌ Error: "Access denied. Admin role required"

---

#### Test 10: Assign Invalid Dealer ID
```bash
curl -X POST http://localhost:5000/api/v1/clients/client_id/assign-dealers \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "dealerIds": ["invalid_dealer_id"]
  }'
```

**Expected:** ❌ Error: "One or more dealer IDs are invalid"

---

## 📝 Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `models/Brand.js` | Brand schema | ~45 |
| `models/Client.js` | Client schema | ~75 |
| `controllers/brandController.js` | Brand CRUD logic | ~210 |
| `controllers/clientController.js` | Client CRUD logic | ~310 |
| `routes/brandRoutes.js` | Brand API routes | ~27 |
| `routes/clientRoutes.js` | Client API routes | ~34 |
| `middleware/validator.js` | Validation rules (updated) | +74 |
| `server.js` | Route registration (updated) | +2 |

**Total:** ~777 new lines of code

---

## ✅ Features Summary

### Brand Features
- ✅ Admin creates brands on behalf of dealers
- ✅ Brand name is optional (auto-generated)
- ✅ dealerId is required
- ✅ Admin-only management
- ✅ Full CRUD operations
- ✅ Soft delete support
- ✅ Search and pagination

### Client Features
- ✅ Admin-only management
- ✅ Multiple dealer assignment
- ✅ Add/remove dealers dynamically
- ✅ Email uniqueness with sparse index
- ✅ Full CRUD operations
- ✅ Soft delete support
- ✅ Search by name, email, or company
- ✅ View clients by dealer

---

## 🔄 No Breaking Changes

- ✅ All existing APIs unchanged
- ✅ No database migrations required
- ✅ New routes added independently
- ✅ Existing models unaffected
- ✅ Backward compatible

---

## 🚀 Quick Start

### 1. Restart Server
```bash
npm run dev
```

### 2. Test Brand Creation (Admin)
```bash
POST /api/v1/brands
{
  "name": "My Brand",
  "dealerId": "dealer_id_here"
}
```

### 3. Test Client Creation (Admin)
```bash
POST /api/v1/clients
{
  "name": "My Client",
  "dealerIds": ["dealer_id"]
}
```

---

**All features implemented and ready to use!** 🎉
