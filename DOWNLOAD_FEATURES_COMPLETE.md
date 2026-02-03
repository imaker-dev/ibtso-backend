# 📥 Enhanced Download Features - Complete Guide

## 🎯 Overview

New comprehensive download system for QR codes with multiple options:

1. **Date-Range Filtering** - Filter dealer/all assets by creation date
2. **Download All Assets** - Admin can download all system assets as PDF
3. **Single QR Download** - Download individual QR as PNG
4. **Multiple QR Download** - Select multiple assets and download as PDF

---

## 🆕 New Features Implemented

### 1. Date-Range Filter for Dealer PDFs ✅

**Endpoint:** `GET /api/v1/barcodes/dealer/:dealerId/download-pdf`

**Query Parameters:**
- `startDate` (optional) - Start date (YYYY-MM-DD)
- `endDate` (optional) - End date (YYYY-MM-DD)

**Examples:**
```bash
# All assets for dealer
GET /api/v1/barcodes/dealer/697dd514085d2ae73fa4338b/download-pdf

# Assets created in January 2026
GET /api/v1/barcodes/dealer/697dd514085d2ae73fa4338b/download-pdf?startDate=2026-01-01&endDate=2026-01-31

# Assets created after Jan 15, 2026
GET /api/v1/barcodes/dealer/697dd514085d2ae73fa4338b/download-pdf?startDate=2026-01-15

# Assets created before Jan 31, 2026
GET /api/v1/barcodes/dealer/697dd514085d2ae73fa4338b/download-pdf?endDate=2026-01-31
```

**Response:**
- PDF file with 4×4 grid (16 QR codes per page)
- Header shows date range if filtering applied
- Filename: `barcodes_{dealerCode}_{timestamp}.pdf`

**Access:** Admin only

---

### 2. Download All Assets PDF ✅

**Endpoint:** `GET /api/v1/barcodes/download-all-pdf`

**Query Parameters:**
- `startDate` (optional) - Start date (YYYY-MM-DD)
- `endDate` (optional) - End date (YYYY-MM-DD)

**Description:**
- Downloads **ALL assets** in the system (across all dealers)
- Supports date-range filtering
- 4×4 grid layout (16 QR codes per page)

**Examples:**
```bash
# Download all assets
GET /api/v1/barcodes/download-all-pdf

# All assets created in 2026
GET /api/v1/barcodes/download-all-pdf?startDate=2026-01-01&endDate=2026-12-31

# Assets from last week
GET /api/v1/barcodes/download-all-pdf?startDate=2026-01-24&endDate=2026-01-31
```

**Response:**
- PDF file with all matching assets
- Header shows "All Assets Barcode Collection"
- Shows date range if filtering applied
- Filename: `all_barcodes_{timestamp}.pdf`

**Access:** Admin only

---

### 3. Download Single Asset QR (PNG) ✅

**Endpoint:** `GET /api/v1/barcodes/download-qr/:assetId`

**Description:**
- Downloads single QR code as PNG image
- High-quality image file
- Includes dealer code and asset number

**Example:**
```bash
GET /api/v1/barcodes/download-qr/697dd514085d2ae73fa4338c
```

**Response:**
- PNG image file
- Filename: `QR_{assetNo}_{timestamp}.png`
- Content-Type: `image/png`

**Access:** 
- Admin: Can download any asset
- Dealer: Can only download their own assets

**Use Cases:**
- Print single QR code
- Add to documents/presentations
- Email to customer
- Use in design software

---

### 4. Download Multiple Assets QR (PDF) ✅

**Endpoint:** `POST /api/v1/barcodes/download-multiple-qr`

**Request Body:**
```json
{
  "assetIds": [
    "697dd514085d2ae73fa4338c",
    "697dd514085d2ae73fa4338d",
    "697dd514085d2ae73fa4338e"
  ]
}
```

**Description:**
- Select multiple assets
- Download as single PDF
- 4×4 grid layout

**Examples:**
```bash
POST /api/v1/barcodes/download-multiple-qr
Content-Type: application/json

{
  "assetIds": [
    "asset1_id",
    "asset2_id",
    "asset3_id"
  ]
}
```

**Response:**
- PDF file with selected QR codes
- Header shows "Selected Assets QR Codes"
- Total selected count displayed
- Filename: `selected_barcodes_{timestamp}.pdf`

**Access:**
- Admin: Can download any assets
- Dealer: Can only download their own assets

**Validation:**
- `assetIds` must be an array
- Array must not be empty
- All asset IDs must be valid
- Dealer users can only select their own assets

---

## 📋 Complete API Reference

### Existing Endpoints (Enhanced)

#### 1. Download Dealer Barcodes PDF
```
GET /api/v1/barcodes/dealer/:dealerId/download-pdf
Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
Auth: Admin only
Response: PDF (4×4 grid)
```

#### 2. Download Dealer Barcodes ZIP
```
GET /api/v1/barcodes/dealer/:dealerId/download-zip
Auth: Admin only
Response: ZIP file with individual PNG files
```

### New Endpoints

#### 3. Download All Assets PDF (NEW)
```
GET /api/v1/barcodes/download-all-pdf
Query: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
Auth: Admin only
Response: PDF (4×4 grid) with ALL assets
```

#### 4. Download Single QR PNG (NEW)
```
GET /api/v1/barcodes/download-qr/:assetId
Auth: Admin or Asset Owner
Response: PNG image
```

#### 5. Download Multiple QR PDF (NEW)
```
POST /api/v1/barcodes/download-multiple-qr
Body: { "assetIds": ["id1", "id2", ...] }
Auth: Admin or Asset Owner
Response: PDF (4×4 grid)
```

---

## 🔒 Permissions Matrix

| Endpoint | Admin | Dealer | Notes |
|----------|-------|--------|-------|
| Dealer PDF (filtered) | ✅ | ❌ | Admin only, supports date range |
| Dealer ZIP | ✅ | ❌ | Admin only |
| All Assets PDF | ✅ | ❌ | Admin only, supports date range |
| Single QR PNG | ✅ | ✅ | Dealers can only download own assets |
| Multiple QR PDF | ✅ | ✅ | Dealers can only select own assets |

---

## 🧪 Testing Scenarios

### Scenario 1: Admin Downloads Dealer Assets (Specific Month)
```bash
# Get all assets for dealer created in January 2026
curl -X GET 'https://api.ibtso.com/api/v1/barcodes/dealer/697dd514085d2ae73fa4338b/download-pdf?startDate=2026-01-01&endDate=2026-01-31' \
  -H "Authorization: Bearer {admin_token}" \
  --output dealer_jan_2026.pdf
```

**Expected:**
- ✅ PDF downloads
- ✅ Shows only January 2026 assets
- ✅ Header displays date range
- ✅ 4×4 grid layout

---

### Scenario 2: Admin Downloads All System Assets
```bash
# Download all assets in the system
curl -X GET 'https://api.ibtso.com/api/v1/barcodes/download-all-pdf' \
  -H "Authorization: Bearer {admin_token}" \
  --output all_assets.pdf
```

**Expected:**
- ✅ PDF with ALL assets from ALL dealers
- ✅ Organized in 4×4 grid
- ✅ Multiple pages if more than 16 assets

---

### Scenario 3: Admin Downloads All Assets (Date Filtered)
```bash
# Download all assets from last week
curl -X GET 'https://api.ibtso.com/api/v1/barcodes/download-all-pdf?startDate=2026-01-24&endDate=2026-01-31' \
  -H "Authorization: Bearer {admin_token}" \
  --output assets_last_week.pdf
```

**Expected:**
- ✅ PDF shows only assets from specified date range
- ✅ Header displays date filter

---

### Scenario 4: Dealer Downloads Single Asset QR
```bash
# Download single QR code as PNG
curl -X GET 'https://api.ibtso.com/api/v1/barcodes/download-qr/697dd514085d2ae73fa4338c' \
  -H "Authorization: Bearer {dealer_token}" \
  --output asset_qr.png
```

**Expected:**
- ✅ PNG image downloads
- ✅ High quality QR code
- ✅ Includes dealer code and asset number

**Error Cases:**
- ❌ 404 if asset not found
- ❌ 403 if dealer tries to download another dealer's asset

---

### Scenario 5: Admin Downloads Multiple Selected Assets
```bash
# Download 5 selected assets as PDF
curl -X POST 'https://api.ibtso.com/api/v1/barcodes/download-multiple-qr' \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "assetIds": [
      "697dd514085d2ae73fa4338c",
      "697dd514085d2ae73fa4338d",
      "697dd514085d2ae73fa4338e",
      "697dd514085d2ae73fa4338f",
      "697dd514085d2ae73fa43390"
    ]
  }' \
  --output selected_assets.pdf
```

**Expected:**
- ✅ PDF with 5 QR codes
- ✅ 4×4 grid layout (single page)
- ✅ All QR codes visible

---

### Scenario 6: Dealer Downloads Multiple Own Assets
```bash
# Dealer selects 3 of their assets
curl -X POST 'https://api.ibtso.com/api/v1/barcodes/download-multiple-qr' \
  -H "Authorization: Bearer {dealer_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "assetIds": [
      "their_asset_1",
      "their_asset_2",
      "their_asset_3"
    ]
  }' \
  --output my_selected_qr.pdf
```

**Expected:**
- ✅ PDF downloads with 3 QR codes
- ✅ All assets belong to dealer

**Error Cases:**
- ❌ 403 if dealer tries to include another dealer's asset
- ❌ 400 if assetIds is empty or not an array

---

### Scenario 7: Frontend Multiple Selection
```javascript
// Frontend code example
const selectedAssetIds = [
  '697dd514085d2ae73fa4338c',
  '697dd514085d2ae73fa4338d',
  '697dd514085d2ae73fa4338e'
];

// Download selected assets
fetch('https://api.ibtso.com/api/v1/barcodes/download-multiple-qr', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ assetIds: selectedAssetIds })
})
.then(response => response.blob())
.then(blob => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `selected_qr_codes_${Date.now()}.pdf`;
  a.click();
});
```

---

## 📊 PDF Layout Specifications

### 4×4 Grid Layout (All PDFs)

```
┌─────────────────────────────────────────────────┐
│          IBTSO Asset Tracking                   │
│       Barcode Collection - [Details]            │
│         [Date Range if filtered]                │
│                                                 │
├──────────┬──────────┬──────────┬──────────┬─────┤
│          │          │          │          │     │
│   QR1    │   QR2    │   QR3    │   QR4    │     │
│ DLRCODE- │ DLRCODE- │ DLRCODE- │ DLRCODE- │     │
│ ASSETNO  │ ASSETNO  │ ASSETNO  │ ASSETNO  │     │
├──────────┼──────────┼──────────┼──────────┤     │
│   QR5    │   QR6    │   QR7    │   QR8    │     │
├──────────┼──────────┼──────────┼──────────┤  A4 │
│   QR9    │   QR10   │   QR11   │   QR12   │     │
├──────────┼──────────┼──────────┼──────────┤     │
│   QR13   │   QR14   │   QR15   │   QR16   │     │
└──────────┴──────────┴──────────┴──────────┴─────┘
```

**Specifications:**
- Page Size: A4 (595.28 × 841.89 points)
- Grid: 4×4 (16 QR codes per page)
- QR Size: 120 points (~4.2 cm)
- Margin: 40 points
- New page added after every 16 QR codes

---

## 🎨 Frontend Implementation Guide

### Single Asset QR Download Button
```html
<!-- Download single QR as PNG -->
<button onclick="downloadSingleQR('697dd514085d2ae73fa4338c')">
  Download QR (PNG)
</button>

<script>
function downloadSingleQR(assetId) {
  fetch(`/api/v1/barcodes/download-qr/${assetId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QR_${assetId}.png`;
    a.click();
  });
}
</script>
```

---

### Multiple Selection with Checkboxes
```html
<!-- Asset list with checkboxes -->
<div id="asset-list">
  <div>
    <input type="checkbox" value="asset1_id" class="asset-checkbox">
    Asset 1
  </div>
  <div>
    <input type="checkbox" value="asset2_id" class="asset-checkbox">
    Asset 2
  </div>
  <!-- More assets... -->
</div>

<button onclick="downloadSelectedQR()">
  Download Selected QR Codes (PDF)
</button>

<script>
function downloadSelectedQR() {
  const checkboxes = document.querySelectorAll('.asset-checkbox:checked');
  const assetIds = Array.from(checkboxes).map(cb => cb.value);
  
  if (assetIds.length === 0) {
    alert('Please select at least one asset');
    return;
  }
  
  fetch('/api/v1/barcodes/download-multiple-qr', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ assetIds })
  })
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected_qr_codes_${Date.now()}.pdf`;
    a.click();
  });
}
</script>
```

---

### Date Range Filter for Admin
```html
<!-- Date range filter -->
<div>
  <label>Start Date:</label>
  <input type="date" id="startDate">
  
  <label>End Date:</label>
  <input type="date" id="endDate">
  
  <button onclick="downloadWithDateRange()">
    Download PDF (Date Filtered)
  </button>
</div>

<script>
function downloadWithDateRange() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  let url = '/api/v1/barcodes/download-all-pdf';
  const params = new URLSearchParams();
  
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  if (params.toString()) {
    url += '?' + params.toString();
  }
  
  fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets_${startDate}_to_${endDate}.pdf`;
    a.click();
  });
}
</script>
```

---

## 🔄 Migration Notes

### No Breaking Changes ✅

All existing endpoints work exactly as before:
- ✅ Existing dealer PDF download unchanged
- ✅ Existing ZIP download unchanged  
- ✅ Existing single barcode download unchanged
- ✅ All APIs backward compatible

### New Additions Only
- ✅ Date-range filtering is **optional**
- ✅ New endpoints are **additional**, not replacements
- ✅ No changes to database schema
- ✅ No changes to existing responses

---

## 📝 Files Modified

### 1. Controllers
**File:** `controllers/barcodeController.js`

**Changes:**
- ✅ Updated `downloadAllBarcodesAsPDF` - Added date-range support
- ✅ Added `downloadAllAssetsPDF` - New endpoint for all assets
- ✅ Added `downloadSingleAssetQR` - PNG download
- ✅ Added `downloadMultipleAssetsQR` - Multiple selection PDF

**Lines Added:** ~240 new lines

### 2. Routes
**File:** `routes/barcodeRoutes.js`

**Changes:**
- ✅ Added 3 new route exports
- ✅ Added 3 new route definitions
- ✅ Proper authentication/authorization

**Lines Added:** ~12 new lines

---

## ✅ Validation & Error Handling

### Date Range Validation
```javascript
// Automatic handling
if (startDate) {
  query.createdAt.$gte = new Date(startDate);
}
if (endDate) {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999); // Include full end date
  query.createdAt.$lte = end;
}
```

### Asset Selection Validation
```javascript
// Multiple assets validation
if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
  return next(new AppError('Please provide an array of asset IDs', 400));
}

// Permission check for dealers
if (req.user.role === 'DEALER') {
  const unauthorizedAsset = assets.find(
    asset => asset.dealerId._id.toString() !== req.user.dealerRef.toString()
  );
  if (unauthorizedAsset) {
    return next(new AppError('You can only download QR codes for your own assets', 403));
  }
}
```

---

## 🎯 Use Cases

### Use Case 1: Monthly Asset Report
**Scenario:** Admin needs monthly report with all QR codes

**Solution:**
```bash
GET /api/v1/barcodes/download-all-pdf?startDate=2026-01-01&endDate=2026-01-31
```

**Result:** PDF with all January assets across all dealers

---

### Use Case 2: Dealer Wants Specific Assets
**Scenario:** Dealer needs to print QR codes for 5 specific assets

**Solution:**
1. Select 5 assets in frontend (checkboxes)
2. POST to `/api/v1/barcodes/download-multiple-qr`
3. Download PDF with 5 QR codes

**Result:** Single PDF ready to print

---

### Use Case 3: Single Asset for Customer
**Scenario:** Dealer needs to email QR code to customer

**Solution:**
```bash
GET /api/v1/barcodes/download-qr/{assetId}
```

**Result:** High-quality PNG file to attach to email

---

### Use Case 4: Quarterly Report
**Scenario:** Admin needs Q1 2026 report

**Solution:**
```bash
GET /api/v1/barcodes/download-all-pdf?startDate=2026-01-01&endDate=2026-03-31
```

**Result:** PDF with all Q1 assets

---

## 🚀 Deployment

### No Special Steps Required

1. **Code is backward compatible**
2. **No database migrations needed**
3. **Just restart server**

```bash
npm run dev  # Development
# or
pm2 restart app  # Production
```

---

## 📊 Summary

| Feature | Status | Access | Format |
|---------|--------|--------|--------|
| **Dealer PDF (date filter)** | ✅ Enhanced | Admin | PDF (4×4) |
| **All Assets PDF** | ✅ New | Admin | PDF (4×4) |
| **All Assets (date filter)** | ✅ New | Admin | PDF (4×4) |
| **Single QR PNG** | ✅ New | Admin/Dealer | PNG |
| **Multiple QR PDF** | ✅ New | Admin/Dealer | PDF (4×4) |

---

## ✅ Complete Feature List

### Admin Capabilities
1. ✅ Download dealer assets PDF (with/without date range)
2. ✅ Download ALL system assets PDF (with/without date range)
3. ✅ Download single asset QR as PNG
4. ✅ Download multiple selected assets as PDF
5. ✅ Download dealer assets as ZIP

### Dealer Capabilities
1. ✅ Download single own asset QR as PNG
2. ✅ Download multiple own assets as PDF

---

**All features implemented and tested! Ready for production use.** 🎉
