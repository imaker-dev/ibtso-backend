# Barcode View Report API

This document describes the backend APIs for barcode view analytics used by frontend reports.

## 1) Data Capture Flow

Public scan endpoint:
- `GET /api/v1/barcodes/public/scan/:barcodeValue`

What happens:
- Valid barcode loads asset details HTML page.
- Every successful public scan writes one log row in `BarcodeScanLog`.
- Logged fields include:
  - `assetId`
  - `barcodeValue`
  - `dealerId`
  - `clientId`
  - `scanType` (`PUBLIC`)
  - `scannedAt`
  - `ipAddress`
  - `userAgent`
  - `referer`

## 2) Auth Rules for Reports

All report APIs require Bearer token.

- `ADMIN`
  - Can view all report data.
  - Can filter by `dealerId` and `clientId`.
- `DEALER`
  - Can view only own dealer data.
  - Cannot use `clientId` filter.
- `CLIENT`
  - Can view only dealers linked to own client profile.
  - Optional `dealerId` must belong to that client.

## 3) Summary Report API

Endpoint:
- `GET /api/v1/barcodes/reports/views/summary`

Query params:
- `startDate` (optional, `YYYY-MM-DD`)
- `endDate` (optional, `YYYY-MM-DD`)
- `dealerId` (optional)
- `clientId` (optional, admin only)
- `brandId` (optional)

Response:
```json
{
  "success": true,
  "message": "Barcode view summary retrieved successfully",
  "data": {
    "filters": {
      "startDate": "2026-02-01",
      "endDate": "2026-02-21",
      "dealerId": null,
      "clientId": null,
      "brandId": null
    },
    "totals": {
      "totalViews": 145,
      "uniqueAssetsViewed": 38,
      "uniqueBarcodeValuesViewed": 38,
      "lastViewedAt": "2026-02-21T09:12:11.532Z"
    },
    "topAssets": [
      {
        "assetId": "65fb2e7f8f49d0a8d95bf001",
        "assetNo": "AST-1022",
        "fixtureNo": "FIX-210",
        "barcodeValue": "DLR01-FIX210",
        "status": "ACTIVE",
        "totalViews": 29,
        "lastViewedAt": "2026-02-21T09:12:11.532Z",
        "dealer": {
          "_id": "65f7d4f1f8f3a2a1eabc2001",
          "dealerCode": "DLR01",
          "name": "ABC Traders"
        }
      }
    ],
    "viewsByDay": [
      {
        "date": "2026-02-20",
        "totalViews": 13
      },
      {
        "date": "2026-02-21",
        "totalViews": 9
      }
    ]
  }
}
```

Frontend usage:
- KPI cards from `totals`.
- Top 10 list from `topAssets`.
- Line/bar chart from `viewsByDay`.

## 4) Asset-wise Report API (Paginated)

Endpoint:
- `GET /api/v1/barcodes/reports/views/assets`

Query params:
- `page` (optional, default `1`)
- `limit` (optional, default `10`)
- `search` (optional, matches `barcodeValue`, `assetNo`, `fixtureNo`)
- `sortBy` (optional, default `totalViews`)
- Allowed `sortBy`: `totalViews`, `lastViewedAt`, `firstViewedAt`, `assetNo`
- `sortOrder` (optional, `asc` or `desc`, default `desc`)
- `startDate` (optional, `YYYY-MM-DD`)
- `endDate` (optional, `YYYY-MM-DD`)
- `dealerId` (optional)
- `clientId` (optional, admin only)
- `brandId` (optional)

Response:
```json
{
  "success": true,
  "message": "Barcode view asset report retrieved successfully",
  "count": 2,
  "total": 38,
  "totalPages": 19,
  "currentPage": 1,
  "data": [
    {
      "assetId": "65fb2e7f8f49d0a8d95bf001",
      "assetNo": "AST-1022",
      "fixtureNo": "FIX-210",
      "barcodeValue": "DLR01-FIX210",
      "status": "ACTIVE",
      "totalViews": 29,
      "firstViewedAt": "2026-02-02T04:11:15.102Z",
      "lastViewedAt": "2026-02-21T09:12:11.532Z",
      "dealer": {
        "_id": "65f7d4f1f8f3a2a1eabc2001",
        "dealerCode": "DLR01",
        "name": "ABC Traders"
      },
      "brand": {
        "_id": "65f7d7f5f8f3a2a1eabc2111",
        "name": "Coca-Cola"
      }
    }
  ]
}
```

Frontend usage:
- Use `data` for table rows.
- Use `total`, `totalPages`, `currentPage` for pagination controls.
- Use `search`, `sortBy`, and filters directly in query string.

## 5) Error Cases

Common validation errors:
- Invalid date format:
  - `Invalid startDate. Use YYYY-MM-DD format`
  - `Invalid endDate. Use YYYY-MM-DD format`
- Invalid IDs:
  - `Invalid dealerId`
  - `Invalid clientId`
  - `Invalid brandId`
- Access errors:
  - Dealer/client trying to access unauthorized dealer/client data.

## 6) Suggested Frontend Screens

1. Summary cards:
- Total Views
- Unique Barcodes Viewed
- Unique Assets Viewed
- Last Viewed At

2. Trend chart:
- Daily views from `viewsByDay`.

3. Top assets widget:
- `topAssets` list with total views.

4. Detailed report table:
- Asset-wise view counts from paginated assets API.
