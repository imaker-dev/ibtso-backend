# 🖼️ Asset Image Update Guide

## 🎯 Overview

Asset image management now supports two modes:
1. **Append Mode** (default) - Add new images to existing ones
2. **Replace Mode** - Replace all existing images with new ones

---

## 🔄 How It Works

### Update Asset Endpoint
**Endpoint:** `PUT /api/v1/assets/:id`

**Content-Type:** `multipart/form-data`

---

## 📋 Field: `replaceImages`

| Value | Type | Behavior |
|-------|------|----------|
| Not provided | - | **Append Mode** - New images added to existing |
| `false` / `'false'` / `0` / `'0'` | Boolean/String | **Append Mode** - New images added to existing |
| `true` / `'true'` / `1` / `'1'` | Boolean/String | **Replace Mode** - Old images deleted, replaced with new |

---

## 🧪 Usage Scenarios

### Scenario 1: Add More Images (Append Mode - Default)

**Current State:** Asset has 4 images

**Request:**
```javascript
const formData = new FormData();
formData.append('images', newImage1);
formData.append('images', newImage2);
// No replaceImages field or replaceImages=false

fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Result:** Asset now has **6 images** (4 old + 2 new)

---

### Scenario 2: Replace All Images (Replace Mode)

**Current State:** Asset has 4 images

**Request:**
```javascript
const formData = new FormData();
formData.append('replaceImages', 'true'); // or true, '1', 1
formData.append('images', newImage1);
formData.append('images', newImage2);

fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Result:** 
- ✅ Old 4 images **deleted from filesystem**
- ✅ Asset now has **2 images** (only the new ones)

---

### Scenario 3: Delete All Images

**Current State:** Asset has 4 images

**Request:**
```javascript
const formData = new FormData();
formData.append('replaceImages', 'true');
// No images uploaded

fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Result:**
- ✅ All 4 images **deleted from filesystem**
- ✅ Asset now has **0 images** (empty array)

---

### Scenario 4: Update from 4 Images to 2 Images

**Current State:** Asset has 4 images

**Request:**
```javascript
const formData = new FormData();
formData.append('replaceImages', 'true'); // Enable replace mode
formData.append('images', newImage1);
formData.append('images', newImage2);

fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Result:**
- ✅ Old 4 images **deleted from filesystem**
- ✅ Asset now has **2 images** (the new ones)

---

### Scenario 5: Update Other Fields Without Touching Images

**Current State:** Asset has 4 images

**Request:**
```javascript
const formData = new FormData();
formData.append('standType', 'Wall Mount');
formData.append('status', 'MAINTENANCE');
// No images field, no replaceImages field

fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Result:**
- ✅ Asset still has **4 images** (unchanged)
- ✅ standType and status updated

---

## 📊 Comparison Table

| Scenario | replaceImages | New Images | Old Images | Final Result |
|----------|---------------|------------|------------|--------------|
| Add more images | `false` or not provided | 2 | 4 | **6 images** (4 old + 2 new) |
| Replace images | `true` | 2 | 4 | **2 images** (old deleted, 2 new) |
| Delete all images | `true` | 0 | 4 | **0 images** (all deleted) |
| Update 4 to 2 | `true` | 2 | 4 | **2 images** (old deleted, 2 new) |
| No image changes | not provided | 0 | 4 | **4 images** (unchanged) |

---

## 🔧 cURL Examples

### Append Images (Default)
```bash
curl -X PUT http://localhost:5000/api/v1/assets/asset_id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

### Replace Images
```bash
curl -X PUT http://localhost:5000/api/v1/assets/asset_id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "replaceImages=true" \
  -F "images=@/path/to/new-image1.jpg" \
  -F "images=@/path/to/new-image2.jpg"
```

### Delete All Images
```bash
curl -X PUT http://localhost:5000/api/v1/assets/asset_id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "replaceImages=true"
```

---

## 💡 Important Notes

1. **File Deletion:** When `replaceImages=true`, old image files are **permanently deleted** from the filesystem
2. **Default Behavior:** If `replaceImages` is not provided, images are **appended** (safe mode)
3. **No Undo:** Deleted images cannot be recovered
4. **Filesystem Cleanup:** Old images are removed from `uploads/assets/` directory
5. **Error Handling:** If file deletion fails, it logs error but continues with update
6. **Empty Array:** Setting `replaceImages=true` with no new images results in empty images array

---

## 🎯 Best Practices

### For Frontend Developers

**Append Mode (Safe):**
```javascript
// When adding more images
const formData = new FormData();
formData.append('images', file1);
formData.append('images', file2);
// Don't set replaceImages
```

**Replace Mode (Destructive):**
```javascript
// When replacing all images
const formData = new FormData();
formData.append('replaceImages', 'true'); // Important!
formData.append('images', file1);
formData.append('images', file2);
```

**Delete All:**
```javascript
// When removing all images
const formData = new FormData();
formData.append('replaceImages', 'true');
// Don't append any images
```

---

## 📝 Response Example

### Success Response

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "asset_id",
    "images": [
      "uploads/assets/asset-new-image1.jpg",
      "uploads/assets/asset-new-image2.jpg"
    ],
    "imageUrls": [
      "http://localhost:5000/uploads/assets/asset-new-image1.jpg",
      "http://localhost:5000/uploads/assets/asset-new-image2.jpg"
    ],
    "updatedAt": "2026-02-03T10:00:00.000Z"
  }
}
```

---

## ⚠️ Warning

**Replace Mode is Destructive:**
- Old images are **permanently deleted** from the server
- Cannot be undone
- Use with caution
- Consider showing a confirmation dialog to users

---

## 🔍 Troubleshooting

### Issue: Images not being replaced

**Check:**
1. Is `replaceImages` field set to `'true'` (string) or `true` (boolean)?
2. Are new images being uploaded?
3. Check server logs for file deletion errors

### Issue: Too many images

**Solution:**
Use replace mode to reset images:
```javascript
formData.append('replaceImages', 'true');
formData.append('images', image1);
formData.append('images', image2);
```

### Issue: Want to keep some old images

**Solution:**
Currently not supported. You must:
1. Download the images you want to keep
2. Use replace mode with all desired images (old + new)

---

## 🎉 Summary

| Mode | Field Value | Behavior |
|------|-------------|----------|
| **Append** | Not set or `false` | Add new images to existing |
| **Replace** | `true` | Delete old, use only new images |

**Default:** Append mode (safe)  
**Destructive:** Replace mode (use with caution)

---

**Image update system is now flexible and powerful!** 🎨
