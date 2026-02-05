# Client API Documentation

## Overview

This document describes the APIs available for client users in the IBTSO Asset Tracking system. All client APIs require authentication with a CLIENT role user account.

## Base URL
```
http://localhost:5656/api/v1
```

## Authentication

All client APIs require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

## API Endpoints

### 1. Client Dashboard Stats

**GET** `/dashboard/client`

Get dashboard statistics for the logged-in client including asset counts, profile completion, and recent activity.

#### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Response
```json
{
  "success": true,
  "data": {
    "assets": {
      "total": 25,
      "active": 20,
      "maintenance": 3,
      "inactive": 2
    },
    "profile": {
      "completionPercentage": 85,
      "lastLogin": "2026-02-05T11:05:22.010Z"
    },
    "recentActivity": [
      {
        "_id": "asset123",
        "name": "Asset Name",
        "status": "active",
        "updatedAt": "2026-02-05T10:00:00.000Z"
      }
    ]
  }
}
```

#### Response Fields
- `assets.total`: Total number of assets across all client dealers
- `assets.active`: Number of assets with ACTIVE status
- `assets.maintenance`: Number of assets with MAINTENANCE status
- `assets.inactive`: Number of assets with INACTIVE status
- `profile.completionPercentage`: Profile completion percentage (0-100)
- `profile.lastLogin`: Last login timestamp of the user
- `recentActivity`: Array of recently updated assets

---

### 2. Client Assets

**GET** `/assets/client/me`

Get all assets assigned to the logged-in client with pagination, search, and filtering capabilities.

#### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Query Parameters (Optional)
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| page | number | Page number for pagination | 1 |
| limit | number | Items per page (max 100) | 10 |
| search | string | Search term for assetNo, fixtureNo, or barcodeValue | "ASSET001" |
| status | string | Filter by asset status | "active" |

#### Status Values
- `active` - ACTIVE assets
- `maintenance` - MAINTENANCE assets  
- `inactive` - INACTIVE assets

#### Response
```json
{
  "success": true,
  "data": {
    "assets": [
      {
        "_id": "asset123",
        "name": "Asset Name",
        "qrCode": "QR123456",
        "status": "active",
        "brand": {
          "_id": "brand123",
          "name": "Brand Name"
        },
        "assignedDate": "2026-01-15T00:00:00.000Z",
        "lastScanned": "2026-02-05T10:00:00.000Z",
        "createdAt": "2026-01-15T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "pages": 3,
      "limit": 10
    }
  }
}
```

#### Response Fields
- `assets`: Array of asset objects
- `assets[].name`: Asset name (assetNo or fixtureNo)
- `assets[].qrCode`: Barcode value for the asset
- `assets[].status`: Asset status (lowercase)
- `assets[].brand`: Brand information if available
- `assets[].assignedDate`: Installation date or creation date
- `assets[].lastScanned`: Last update timestamp
- `pagination`: Pagination information

#### Example Requests
```bash
# Get all assets
GET /api/v1/assets/client/me

# Get page 2 with 20 items per page
GET /api/v1/assets/client/me?page=2&limit=20

# Search for assets with "ASSET001"
GET /api/v1/assets/client/me?search=ASSET001

# Filter by active status
GET /api/v1/assets/client/me?status=active

# Combined search and pagination
GET /api/v1/assets/client/me?search=FIX&page=1&limit=5&status=maintenance
```

---

### 3. Update Client Profile

**PUT** `/clients/me/profile`

Update the logged-in client's profile information.

#### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "company": "Company Name",
  "address": "Full Address"
}
```

#### Request Fields (Optional)
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| name | string | Client name | "John Doe" |
| phone | string | Phone number | "+1234567890" |
| company | string | Company name | "ABC Corporation" |
| address | string | Full address | "123 Main St, City, Country" |

#### Response
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "client123",
    "name": "Updated Name",
    "email": "client@example.com",
    "phone": "+1234567890",
    "company": "Company Name",
    "address": "Full Address",
    "role": "CLIENT",
    "updatedAt": "2026-02-05T11:30:00.000Z"
  }
}
```

#### Response Fields
- `data`: Updated client profile information
- `data.updatedAt`: Timestamp of the update

---

### 4. Change Client Password

**PUT** `/clients/me/change-password`

Change the logged-in client's password.

#### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Request Body
```json
{
  "newPassword": "newPassword456"
}
```

#### Request Fields (Required)
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| newPassword | string | New password (min 6 characters) | "newPassword456" |

#### Response
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### Notes
- The `isTemporaryPassword` flag will be automatically set to `false`
- `passwordChangedAt` timestamp will be updated
- User will need to login again with the new password
- No current password required - simplified flow for temporary password changes

---

## Error Responses

All APIs return consistent error responses:

### 401 Unauthorized
```json
{
  "success": false,
  "message": "You are not logged in. Please log in to get access"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Only clients can access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Client not found"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- All endpoints are subject to standard rate limiting
- Password change endpoint may have additional restrictions
- Search functionality may be rate limited to prevent abuse

## Data Models

### Asset Status Values
- `ACTIVE` - Asset is currently in use
- `MAINTENANCE` - Asset is under maintenance
- `INACTIVE` - Asset is not currently active
- `DAMAGED` - Asset is damaged (not returned in client API)

### Profile Completion Calculation
Profile completion is calculated based on the following fields:
- Name (required)
- Email (required)
- Phone (optional)
- Company (optional)
- Address (optional)

Completion percentage = (completed_fields / total_fields) × 100

---

## Testing Examples

### Using curl

```bash
# Get client dashboard
curl -X GET "http://localhost:5656/api/v1/dashboard/client" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get client assets with pagination
curl -X GET "http://localhost:5656/api/v1/assets/client/me?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Update client profile
curl -X PUT "http://localhost:5656/api/v1/clients/me/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "phone": "+1234567890"}'

# Change password
curl -X PUT "http://localhost:5656/api/v1/clients/me/change-password" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newPassword": "newPass456"}'
```

### Using JavaScript fetch

```javascript
// Get client dashboard
const response = await fetch('/api/v1/dashboard/client', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();

// Update profile
const updateResponse = await fetch('/api/v1/clients/me/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Updated Name',
    phone: '+1234567890'
  })
});

// Change password
const passwordResponse = await fetch('/api/v1/clients/me/change-password', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    newPassword: 'newPass456'
  })
});
```

---

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token with CLIENT role
2. **Authorization**: Clients can only access their own data via clientRef
3. **Password Security**: Passwords are hashed using bcrypt
4. **Input Validation**: All inputs are validated and sanitized
5. **Rate Limiting**: Implemented to prevent abuse
6. **HTTPS**: Recommended for production environments

---

## Version History

- **v1.0** - Initial client API implementation
  - Dashboard stats endpoint
  - Assets listing with pagination and search
  - Profile management
  - Password change functionality

---

*Last updated: February 5, 2026*
