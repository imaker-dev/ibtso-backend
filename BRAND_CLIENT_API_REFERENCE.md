# 🏷️ Brand & Client API Reference

Complete API documentation with all possible payloads and responses.

---

## 📋 Table of Contents

- [Brand API](#brand-api)
  - [Create Brand](#1-create-brand)
  - [Get All Brands](#2-get-all-brands)
  - [Get Brand by ID](#3-get-brand-by-id)
  - [Update Brand](#4-update-brand)
  - [Delete Brand](#5-delete-brand)
  - [Get Brands by Dealer](#6-get-brands-by-dealer)
- [Client API](#client-api)
  - [Create Client](#1-create-client)
  - [Get All Clients](#2-get-all-clients)
  - [Get Client by ID](#3-get-client-by-id)
  - [Update Client](#4-update-client)
  - [Delete Client](#5-delete-client)
  - [Assign Dealers to Client](#6-assign-dealers-to-client)
  - [Remove Dealers from Client](#7-remove-dealers-from-client)
  - [Get Clients by Dealer](#8-get-clients-by-dealer)

---

# Brand API

**Base URL:** `/api/v1/brands`

**Authentication:** Required (Admin only)

**Authorization Header:**
```
Authorization: Bearer {admin_token}
```

---

## 1. Create Brand

**Endpoint:** `POST /api/v1/brands`

**Access:** Admin Only

**Description:** Create a new brand on behalf of a dealer.

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer {admin_token}
```

### Request Body

**Schema:**
```json
{
  "name": "string (optional)",
  "dealerId": "string (required, MongoDB ObjectId)"
}
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | No | Brand name. Auto-generated if not provided (format: `Brand_{timestamp}`) |
| `dealerId` | String | Yes | MongoDB ObjectId of the dealer |

### Possible Payloads

#### Payload 1: With Brand Name
```json
{
  "name": "Samsung Electronics",
  "dealerId": "697dd514085d2ae73fa4338b"
}
```

#### Payload 2: Without Brand Name (Auto-generated)
```json
{
  "dealerId": "697dd514085d2ae73fa4338b"
}
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
    "dealerId": {
      "_id": "697dd514085d2ae73fa4338b",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Shop",
      "shopName": "Electronics Hub"
    },
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

#### Missing dealerId
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Dealer ID is required"
}
```

#### Invalid dealerId Format
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Invalid dealer ID"
}
```

#### Dealer Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Dealer not found"
}
```

#### Unauthorized (Not Admin)
**Status Code:** `403 Forbidden`
```json
{
  "success": false,
  "message": "Access denied. Admin role required"
}
```

#### No Token Provided
**Status Code:** `401 Unauthorized`
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

## 2. Get All Brands

**Endpoint:** `GET /api/v1/brands`

**Access:** Admin Only

**Description:** Retrieve all brands with optional filtering and pagination.

### Request Headers
```http
Authorization: Bearer {admin_token}
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Integer | No | 1 | Page number |
| `limit` | Integer | No | 10 | Items per page (max: 100) |
| `search` | String | No | - | Search by brand name (case-insensitive) |
| `dealerId` | String | No | - | Filter by dealer ID |
| `isActive` | Boolean | No | - | Filter by active status |

### Possible Requests

#### Request 1: Get All Brands (Default)
```http
GET /api/v1/brands
```

#### Request 2: With Pagination
```http
GET /api/v1/brands?page=2&limit=20
```

#### Request 3: Search by Name
```http
GET /api/v1/brands?search=Samsung
```

#### Request 4: Filter by Dealer
```http
GET /api/v1/brands?dealerId=697dd514085d2ae73fa4338b
```

#### Request 5: Filter by Active Status
```http
GET /api/v1/brands?isActive=true
```

#### Request 6: Combined Filters
```http
GET /api/v1/brands?dealerId=697dd514085d2ae73fa4338b&search=Sam&page=1&limit=10
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "brands": [
      {
        "_id": "697dd514085d2ae73fa4339a",
        "name": "Samsung Electronics",
        "dealerId": {
          "_id": "697dd514085d2ae73fa4338b",
          "dealerCode": "JOHN-ABC123XYZ",
          "name": "John's Shop",
          "shopName": "Electronics Hub"
        },
        "isActive": true,
        "createdBy": {
          "_id": "697dd514085d2ae73fa43380",
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "createdAt": "2026-02-02T10:15:30.000Z",
        "updatedAt": "2026-02-02T10:15:30.000Z"
      },
      {
        "_id": "697dd514085d2ae73fa4339b",
        "name": "LG Electronics",
        "dealerId": {
          "_id": "697dd514085d2ae73fa4338b",
          "dealerCode": "JOHN-ABC123XYZ",
          "name": "John's Shop",
          "shopName": "Electronics Hub"
        },
        "isActive": true,
        "createdBy": {
          "_id": "697dd514085d2ae73fa43380",
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "createdAt": "2026-02-02T10:20:00.000Z",
        "updatedAt": "2026-02-02T10:20:00.000Z"
      }
    ],
    "totalPages": 5,
    "currentPage": 1,
    "totalBrands": 47
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

## 3. Get Brand by ID

**Endpoint:** `GET /api/v1/brands/:id`

**Access:** Admin Only

**Description:** Retrieve a specific brand by its ID.

### Request Headers
```http
Authorization: Bearer {admin_token}
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Brand MongoDB ObjectId |

### Request Example
```http
GET /api/v1/brands/697dd514085d2ae73fa4339a
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "697dd514085d2ae73fa4339a",
    "name": "Samsung Electronics",
    "dealerId": {
      "_id": "697dd514085d2ae73fa4338b",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Shop",
      "shopName": "Electronics Hub",
      "email": "john@shop.com"
    },
    "isActive": true,
    "isDeleted": false,
    "createdBy": {
      "_id": "697dd514085d2ae73fa43380",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "updatedBy": {
      "_id": "697dd514085d2ae73fa43380",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-02T10:15:30.000Z",
    "updatedAt": "2026-02-02T11:30:00.000Z"
  }
}
```

### Error Responses

#### Brand Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Brand not found"
}
```

#### Invalid Brand ID
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Invalid brand ID"
}
```

---

## 4. Update Brand

**Endpoint:** `PUT /api/v1/brands/:id`

**Access:** Admin Only

**Description:** Update a brand's information.

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer {admin_token}
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Brand MongoDB ObjectId |

### Request Body

**Schema:**
```json
{
  "name": "string (optional)",
  "isActive": "boolean (optional)"
}
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | No | Updated brand name |
| `isActive` | Boolean | No | Active status (true/false) |

### Possible Payloads

#### Payload 1: Update Name Only
```json
{
  "name": "Samsung Electronics Global"
}
```

#### Payload 2: Update Active Status Only
```json
{
  "isActive": false
}
```

#### Payload 3: Update Both Fields
```json
{
  "name": "Samsung Electronics Global",
  "isActive": true
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Brand updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa4339a",
    "name": "Samsung Electronics Global",
    "dealerId": {
      "_id": "697dd514085d2ae73fa4338b",
      "dealerCode": "JOHN-ABC123XYZ",
      "name": "John's Shop",
      "shopName": "Electronics Hub"
    },
    "isActive": true,
    "createdBy": {
      "_id": "697dd514085d2ae73fa43380",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "updatedBy": {
      "_id": "697dd514085d2ae73fa43380",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-02T10:15:30.000Z",
    "updatedAt": "2026-02-02T12:00:00.000Z"
  }
}
```

### Error Responses

#### Brand Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Brand not found"
}
```

#### Invalid isActive Value
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "isActive must be a boolean"
}
```

---

## 5. Delete Brand

**Endpoint:** `DELETE /api/v1/brands/:id`

**Access:** Admin Only

**Description:** Soft delete a brand (marks as deleted, doesn't remove from database).

### Request Headers
```http
Authorization: Bearer {admin_token}
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Brand MongoDB ObjectId |

### Request Example
```http
DELETE /api/v1/brands/697dd514085d2ae73fa4339a
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

### Error Responses

#### Brand Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Brand not found"
}
```

---

## 6. Get Brands by Dealer

**Endpoint:** `GET /api/v1/brands/dealer/:dealerId`

**Access:** Admin Only

**Description:** Retrieve all brands for a specific dealer.

### Request Headers
```http
Authorization: Bearer {admin_token}
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dealerId` | String | Yes | Dealer MongoDB ObjectId |

### Request Example
```http
GET /api/v1/brands/dealer/697dd514085d2ae73fa4338b
```

### Success Response

**Status Code:** `200 OK`

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
        "_id": "697dd514085d2ae73fa4339a",
        "name": "Samsung Electronics",
        "isActive": true,
        "createdBy": {
          "_id": "697dd514085d2ae73fa43380",
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "createdAt": "2026-02-02T10:15:30.000Z",
        "updatedAt": "2026-02-02T10:15:30.000Z"
      },
      {
        "_id": "697dd514085d2ae73fa4339b",
        "name": "LG Electronics",
        "isActive": true,
        "createdBy": {
          "_id": "697dd514085d2ae73fa43380",
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "createdAt": "2026-02-02T10:20:00.000Z",
        "updatedAt": "2026-02-02T10:20:00.000Z"
      }
    ]
  }
}
```

### Error Responses

#### Dealer Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Dealer not found"
}
```

---

# Client API

**Base URL:** `/api/v1/clients`

**Authentication:** Required (Admin only)

**Authorization Header:**
```
Authorization: Bearer {admin_token}
```

---

## 1. Create Client

**Endpoint:** `POST /api/v1/clients`

**Access:** Admin Only

**Description:** Create a new client with optional dealer assignments.

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer {admin_token}
```

### Request Body

**Schema:**
```json
{
  "name": "string (required)",
  "email": "string (optional, unique)",
  "phone": "string (optional)",
  "company": "string (optional)",
  "address": "string (optional)",
  "vatin": "string (optional, auto-uppercase)",
  "placeOfSupply": "string (optional)",
  "country": "string (optional)",
  "dealerIds": "array of strings (optional, MongoDB ObjectIds)"
}
```

**Field Details:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Client name |
| `email` | String | No | Email address (must be unique) |
| `phone` | String | No | Phone number |
| `company` | String | No | Company name |
| `address` | String | No | Full address |
| `vatin` | String | No | VAT Identification Number (auto-converted to uppercase) |
| `placeOfSupply` | String | No | Place of supply/business location |
| `country` | String | No | Country |
| `dealerIds` | Array | No | Array of dealer MongoDB ObjectIds |

### Possible Payloads

#### Payload 1: Minimal (Name Only)
```json
{
  "name": "Quick Client"
}
```

#### Payload 2: With Contact Info
```json
{
  "name": "Tech Solutions Inc",
  "email": "info@techsolutions.com",
  "phone": "+9876543210"
}
```

#### Payload 3: Complete Information
```json
{
  "name": "Mohsin Haider Darwish LLC",
  "email": "contact@mhd.com",
  "phone": "+96812345678",
  "company": "Mohsin Haider Darwish LLC",
  "address": "P.O.Box:880, P.C 112, Ruwi",
  "vatin": "om1100001389",
  "placeOfSupply": "Sultanate of Oman",
  "country": "Sultanate of Oman",
  "dealerIds": [
    "697dd514085d2ae73fa4338b",
    "697dd514085d2ae73fa4338c"
  ]
}
```

#### Payload 4: With Multiple Dealers
```json
{
  "name": "ABC Corporation",
  "email": "contact@abc.com",
  "dealerIds": [
    "697dd514085d2ae73fa4338b",
    "697dd514085d2ae73fa4338c",
    "697dd514085d2ae73fa4338d"
  ]
}
```

### Success Response

**Status Code:** `201 Created`

```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "_id": "697dd514085d2ae73fa433a0",
    "name": "Mohsin Haider Darwish LLC",
    "email": "contact@mhd.com",
    "phone": "+96812345678",
    "company": "Mohsin Haider Darwish LLC",
    "address": "P.O.Box:880, P.C 112, Ruwi",
    "vatin": "OM1100001389",
    "placeOfSupply": "Sultanate of Oman",
    "country": "Sultanate of Oman",
    "dealerIds": [
      {
        "_id": "697dd514085d2ae73fa4338b",
        "dealerCode": "JOHN-ABC123XYZ",
        "name": "John's Shop",
        "shopName": "Electronics Hub",
        "email": "john@shop.com"
      },
      {
        "_id": "697dd514085d2ae73fa4338c",
        "dealerCode": "MARY-DEF456GHI",
        "name": "Mary's Store",
        "shopName": "Tech Store",
        "email": "mary@store.com"
      }
    ],
    "isActive": true,
    "isDeleted": false,
    "createdBy": {
      "_id": "697dd514085d2ae73fa43380",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-02T13:00:00.000Z",
    "updatedAt": "2026-02-02T13:00:00.000Z"
  }
}
```

### Error Responses

#### Missing Client Name
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Client name is required"
}
```

#### Duplicate Email
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Client with this email already exists"
}
```

#### Invalid Email Format
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Invalid value",
  "errors": [
    {
      "field": "email",
      "message": "Invalid value"
    }
  ]
}
```

#### Invalid Dealer IDs
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "One or more dealer IDs are invalid"
}
```

#### dealerIds Not Array
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "dealerIds must be an array"
}
```

---

## 2. Get All Clients

**Endpoint:** `GET /api/v1/clients`

**Access:** Admin Only

**Description:** Retrieve all clients with optional filtering and pagination.

### Request Headers
```http
Authorization: Bearer {admin_token}
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | Integer | No | 1 | Page number |
| `limit` | Integer | No | 10 | Items per page (max: 100) |
| `search` | String | No | - | Search by name, email, or company |
| `isActive` | Boolean | No | - | Filter by active status |

### Possible Requests

#### Request 1: Get All Clients (Default)
```http
GET /api/v1/clients
```

#### Request 2: With Pagination
```http
GET /api/v1/clients?page=2&limit=20
```

#### Request 3: Search Clients
```http
GET /api/v1/clients?search=Tech
```

#### Request 4: Filter by Active Status
```http
GET /api/v1/clients?isActive=true
```

#### Request 5: Combined Filters
```http
GET /api/v1/clients?search=Corp&isActive=true&page=1&limit=15
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "_id": "697dd514085d2ae73fa433a0",
        "name": "Mohsin Haider Darwish LLC",
        "email": "contact@mhd.com",
        "company": "Mohsin Haider Darwish LLC",
        "dealerIds": [
          {
            "_id": "697dd514085d2ae73fa4338b",
            "dealerCode": "JOHN-ABC123XYZ",
            "name": "John's Shop",
            "shopName": "Electronics Hub",
            "email": "john@shop.com"
          }
        ],
        "isActive": true,
        "createdBy": {
          "_id": "697dd514085d2ae73fa43380",
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "createdAt": "2026-02-02T13:00:00.000Z",
        "updatedAt": "2026-02-02T13:00:00.000Z"
      },
      {
        "_id": "697dd514085d2ae73fa433a1",
        "name": "Tech Solutions Inc",
        "email": "info@techsolutions.com",
        "company": "Tech Solutions Incorporated",
        "dealerIds": [
          {
            "_id": "697dd514085d2ae73fa4338c",
            "dealerCode": "MARY-DEF456GHI",
            "name": "Mary's Store",
            "shopName": "Tech Store",
            "email": "mary@store.com"
          }
        ],
        "isActive": true,
        "createdBy": {
          "_id": "697dd514085d2ae73fa43380",
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "createdAt": "2026-02-02T13:15:00.000Z",
        "updatedAt": "2026-02-02T13:15:00.000Z"
      }
    ],
    "totalPages": 3,
    "currentPage": 1,
    "totalClients": 28
  }
}
```

---

## 3. Get Client by ID

**Endpoint:** `GET /api/v1/clients/:id`

**Access:** Admin Only

**Description:** Retrieve a specific client by its ID with full details.

### Request Headers
```http
Authorization: Bearer {admin_token}
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Client MongoDB ObjectId |

### Request Example
```http
GET /api/v1/clients/697dd514085d2ae73fa433a0
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "data": {
    "_id": "697dd514085d2ae73fa433a0",
    "name": "Mohsin Haider Darwish LLC",
    "email": "contact@mhd.com",
    "phone": "+96812345678",
    "company": "Mohsin Haider Darwish LLC",
    "address": "P.O.Box:880, P.C 112, Ruwi",
    "vatin": "OM1100001389",
    "placeOfSupply": "Sultanate of Oman",
    "country": "Sultanate of Oman",
    "dealerIds": [
      {
        "_id": "697dd514085d2ae73fa4338b",
        "dealerCode": "JOHN-ABC123XYZ",
        "name": "John's Shop",
        "shopName": "Electronics Hub",
        "email": "john@shop.com",
        "phone": "+1234567890",
        "location": {
          "address": "123 Main St, City",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "googleMapLink": "https://maps.google.com/?q=40.7128,-74.0060"
        }
      }
    ],
    "isActive": true,
    "isDeleted": false,
    "createdBy": {
      "_id": "697dd514085d2ae73fa43380",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "updatedBy": {
      "_id": "697dd514085d2ae73fa43380",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-02T13:00:00.000Z",
    "updatedAt": "2026-02-02T14:30:00.000Z"
  }
}
```

### Error Responses

#### Client Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Client not found"
}
```

---

## 4. Update Client

**Endpoint:** `PUT /api/v1/clients/:id`

**Access:** Admin Only

**Description:** Update client information.

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer {admin_token}
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Client MongoDB ObjectId |

### Request Body

**Schema:**
```json
{
  "name": "string (optional)",
  "email": "string (optional)",
  "phone": "string (optional)",
  "company": "string (optional)",
  "address": "string (optional)",
  "vatin": "string (optional)",
  "placeOfSupply": "string (optional)",
  "country": "string (optional)",
  "dealerIds": "array of strings (optional)",
  "isActive": "boolean (optional)"
}
```

### Possible Payloads

#### Payload 1: Update Contact Info
```json
{
  "email": "newemail@client.com",
  "phone": "+1111111111"
}
```

#### Payload 2: Update Address & VAT
```json
{
  "address": "New Address, City",
  "vatin": "OM9999999999",
  "placeOfSupply": "Muscat, Oman",
  "country": "Oman"
}
```

#### Payload 3: Update Dealers
```json
{
  "dealerIds": [
    "697dd514085d2ae73fa4338b",
    "697dd514085d2ae73fa4338c",
    "697dd514085d2ae73fa4338d"
  ]
}
```

#### Payload 4: Deactivate Client
```json
{
  "isActive": false
}
```

#### Payload 5: Complete Update
```json
{
  "name": "Updated Client Name",
  "email": "updated@client.com",
  "phone": "+9999999999",
  "company": "Updated Company Ltd",
  "address": "Updated Address",
  "vatin": "OM8888888888",
  "placeOfSupply": "Salalah, Oman",
  "country": "Oman",
  "dealerIds": ["697dd514085d2ae73fa4338b"],
  "isActive": true
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "_id": "697dd514085d2ae73fa433a0",
    "name": "Updated Client Name",
    "email": "updated@client.com",
    "phone": "+9999999999",
    "company": "Updated Company Ltd",
    "address": "Updated Address",
    "vatin": "OM8888888888",
    "placeOfSupply": "Salalah, Oman",
    "country": "Oman",
    "dealerIds": [
      {
        "_id": "697dd514085d2ae73fa4338b",
        "dealerCode": "JOHN-ABC123XYZ",
        "name": "John's Shop",
        "shopName": "Electronics Hub",
        "email": "john@shop.com"
      }
    ],
    "isActive": true,
    "createdBy": {
      "_id": "697dd514085d2ae73fa43380",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "updatedBy": {
      "_id": "697dd514085d2ae73fa43380",
      "name": "Admin User",
      "email": "admin@ibtso.com"
    },
    "createdAt": "2026-02-02T13:00:00.000Z",
    "updatedAt": "2026-02-02T15:00:00.000Z"
  }
}
```

### Error Responses

#### Client Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Client not found"
}
```

#### Email Already in Use
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Email already in use by another client"
}
```

#### Invalid Dealer IDs
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "One or more dealer IDs are invalid"
}
```

---

## 5. Delete Client

**Endpoint:** `DELETE /api/v1/clients/:id`

**Access:** Admin Only

**Description:** Soft delete a client (marks as deleted, doesn't remove from database).

### Request Headers
```http
Authorization: Bearer {admin_token}
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | String | Yes | Client MongoDB ObjectId |

### Request Example
```http
DELETE /api/v1/clients/697dd514085d2ae73fa433a0
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

### Error Responses

#### Client Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Client not found"
}
```

---

## 6. Assign Dealers to Client

**Endpoint:** `POST /api/v1/clients/:clientId/assign-dealers`

**Access:** Admin Only

**Description:** Assign one or more dealers to a client. Avoids duplicates automatically.

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer {admin_token}
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | String | Yes | Client MongoDB ObjectId |

### Request Body

**Schema:**
```json
{
  "dealerIds": "array of strings (required, MongoDB ObjectIds)"
}
```

### Possible Payloads

#### Payload 1: Assign Single Dealer
```json
{
  "dealerIds": ["697dd514085d2ae73fa4338b"]
}
```

#### Payload 2: Assign Multiple Dealers
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
  "message": "2 dealer(s) assigned to client",
  "data": {
    "_id": "697dd514085d2ae73fa433a0",
    "name": "Mohsin Haider Darwish LLC",
    "dealerIds": [
      {
        "_id": "697dd514085d2ae73fa4338b",
        "dealerCode": "JOHN-ABC123XYZ",
        "name": "John's Shop",
        "shopName": "Electronics Hub",
        "email": "john@shop.com"
      },
      {
        "_id": "697dd514085d2ae73fa4338c",
        "dealerCode": "MARY-DEF456GHI",
        "name": "Mary's Store",
        "shopName": "Tech Store",
        "email": "mary@store.com"
      }
    ]
  }
}
```

### Error Responses

#### Client Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Client not found"
}
```

#### Missing dealerIds
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "Please provide an array of dealer IDs"
}
```

#### Empty dealerIds Array
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "dealerIds array cannot be empty"
}
```

#### Invalid Dealer IDs
**Status Code:** `400 Bad Request`
```json
{
  "success": false,
  "message": "One or more dealer IDs are invalid"
}
```

---

## 7. Remove Dealers from Client

**Endpoint:** `POST /api/v1/clients/:clientId/remove-dealers`

**Access:** Admin Only

**Description:** Remove one or more dealers from a client.

### Request Headers
```http
Content-Type: application/json
Authorization: Bearer {admin_token}
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | String | Yes | Client MongoDB ObjectId |

### Request Body

**Schema:**
```json
{
  "dealerIds": "array of strings (required, MongoDB ObjectIds)"
}
```

### Possible Payloads

#### Payload 1: Remove Single Dealer
```json
{
  "dealerIds": ["697dd514085d2ae73fa4338b"]
}
```

#### Payload 2: Remove Multiple Dealers
```json
{
  "dealerIds": [
    "697dd514085d2ae73fa4338b",
    "697dd514085d2ae73fa4338c"
  ]
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "success": true,
  "message": "Dealers removed from client",
  "data": {
    "_id": "697dd514085d2ae73fa433a0",
    "name": "Mohsin Haider Darwish LLC",
    "dealerIds": [
      {
        "_id": "697dd514085d2ae73fa4338d",
        "dealerCode": "PETE-JKL789MNO",
        "name": "Pete's Electronics",
        "shopName": "Electronics World",
        "email": "pete@electronics.com"
      }
    ]
  }
}
```

### Error Responses

Same as "Assign Dealers to Client" endpoint.

---

## 8. Get Clients by Dealer

**Endpoint:** `GET /api/v1/clients/dealer/:dealerId`

**Access:** Admin Only

**Description:** Retrieve all clients assigned to a specific dealer.

### Request Headers
```http
Authorization: Bearer {admin_token}
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dealerId` | String | Yes | Dealer MongoDB ObjectId |

### Request Example
```http
GET /api/v1/clients/dealer/697dd514085d2ae73fa4338b
```

### Success Response

**Status Code:** `200 OK`

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
        "_id": "697dd514085d2ae73fa433a0",
        "name": "Mohsin Haider Darwish LLC",
        "email": "contact@mhd.com",
        "company": "Mohsin Haider Darwish LLC",
        "isActive": true,
        "createdBy": {
          "_id": "697dd514085d2ae73fa43380",
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "createdAt": "2026-02-02T13:00:00.000Z",
        "updatedAt": "2026-02-02T13:00:00.000Z"
      },
      {
        "_id": "697dd514085d2ae73fa433a1",
        "name": "Tech Solutions Inc",
        "email": "info@techsolutions.com",
        "company": "Tech Solutions Incorporated",
        "isActive": true,
        "createdBy": {
          "_id": "697dd514085d2ae73fa43380",
          "name": "Admin User",
          "email": "admin@ibtso.com"
        },
        "createdAt": "2026-02-02T13:15:00.000Z",
        "updatedAt": "2026-02-02T13:15:00.000Z"
      }
    ]
  }
}
```

### Error Responses

#### Dealer Not Found
**Status Code:** `404 Not Found`
```json
{
  "success": false,
  "message": "Dealer not found"
}
```

---

## 📊 Common HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | No authentication token provided |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## 🔐 Authentication

All endpoints require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### How to Get Token

**Login Endpoint:** `POST /api/v1/auth/login`

**Request:**
```json
{
  "email": "admin@ibtso.com",
  "password": "ibtso@#2026"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "697dd514085d2ae73fa43380",
    "name": "Admin User",
    "email": "admin@ibtso.com",
    "role": "ADMIN"
  }
}
```

---

## 📝 Notes

1. **VATIN Auto-Uppercase:** The `vatin` field is automatically converted to uppercase when saved.
2. **Soft Delete:** Delete operations mark records as deleted but don't remove them from the database.
3. **Pagination:** Default page size is 10, maximum is 100.
4. **Search:** Search is case-insensitive and uses regex matching.
5. **Dealer Assignment:** Assigning dealers to a client automatically avoids duplicates.
6. **Timestamps:** All records include `createdAt` and `updatedAt` timestamps.

---

**API Version:** v1  
**Last Updated:** February 2, 2026  
**Base URL:** `http://localhost:5000/api/v1`
