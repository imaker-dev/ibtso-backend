# 🖼️ Asset Image Management - Complete Guide

## 🎯 Overview

Granular control over asset images with the ability to:
- ✅ Add new images to existing images
- ✅ Remove specific images from existing images
- ✅ Remove specific images and add new images simultaneously

**Endpoint:** `PUT /api/v1/assets/:id`

**Content-Type:** `multipart/form-data`

---

## 📋 How It Works

### New Field: `existingImages`

**Type:** Array of strings (image paths) or JSON string

**Purpose:** Specifies which existing images to **keep**

**Behavior:**
- **Not provided:** Keep all existing images, add new ones (append mode)
- **Empty array `[]`:** Remove all existing images, add only new ones
- **Array with paths:** Keep only specified images, remove others, add new ones

---

## 🔄 Image Management Scenarios

### Scenario 1: Add New Images to Existing (4 + 2 = 6)

**Current State:** Asset has 4 images
```javascript
[
  "uploads/assets/image1.jpg",
  "uploads/assets/image2.jpg",
  "uploads/assets/image3.jpg",
  "uploads/assets/image4.jpg"
]
```

**Request:**
```javascript
const formData = new FormData();
// Don't include existingImages field
formData.append('images', newImage1);
formData.append('images', newImage2);

await fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/asset_id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@/path/to/new-image1.jpg" \
  -F "images=@/path/to/new-image2.jpg"
```

**Result:**
```javascript
{
  "images": [
    "uploads/assets/image1.jpg",      // Kept
    "uploads/assets/image2.jpg",      // Kept
    "uploads/assets/image3.jpg",      // Kept
    "uploads/assets/image4.jpg",      // Kept
    "uploads/assets/new-image1.jpg",  // Added
    "uploads/assets/new-image2.jpg"   // Added
  ]
}
```

**Total:** 6 images (4 existing + 2 new) ✅

---

### Scenario 2: Remove Specific Images (4 - 2 = 2)

**Current State:** Asset has 4 images
```javascript
[
  "uploads/assets/image1.jpg",
  "uploads/assets/image2.jpg",
  "uploads/assets/image3.jpg",
  "uploads/assets/image4.jpg"
]
```

**Request:** Keep only image1 and image3, remove image2 and image4
```javascript
const formData = new FormData();
formData.append('existingImages', JSON.stringify([
  "uploads/assets/image1.jpg",
  "uploads/assets/image3.jpg"
]));
// No new images uploaded

await fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/asset_id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'existingImages=["uploads/assets/image1.jpg","uploads/assets/image3.jpg"]'
```

**Result:**
```javascript
{
  "images": [
    "uploads/assets/image1.jpg",  // Kept
    "uploads/assets/image3.jpg"   // Kept
    // image2.jpg - Deleted from filesystem
    // image4.jpg - Deleted from filesystem
  ]
}
```

**Total:** 2 images (kept 2, deleted 2) ✅

---

### Scenario 3: Remove Specific + Add New (4 - 2 + 3 = 5)

**Current State:** Asset has 4 images
```javascript
[
  "uploads/assets/image1.jpg",
  "uploads/assets/image2.jpg",
  "uploads/assets/image3.jpg",
  "uploads/assets/image4.jpg"
]
```

**Request:** Keep image1 and image4, remove image2 and image3, add 3 new images
```javascript
const formData = new FormData();
formData.append('existingImages', JSON.stringify([
  "uploads/assets/image1.jpg",
  "uploads/assets/image4.jpg"
]));
formData.append('images', newImage1);
formData.append('images', newImage2);
formData.append('images', newImage3);

await fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/asset_id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'existingImages=["uploads/assets/image1.jpg","uploads/assets/image4.jpg"]' \
  -F "images=@/path/to/new-image1.jpg" \
  -F "images=@/path/to/new-image2.jpg" \
  -F "images=@/path/to/new-image3.jpg"
```

**Result:**
```javascript
{
  "images": [
    "uploads/assets/image1.jpg",      // Kept
    "uploads/assets/image4.jpg",      // Kept
    "uploads/assets/new-image1.jpg",  // Added
    "uploads/assets/new-image2.jpg",  // Added
    "uploads/assets/new-image3.jpg"   // Added
    // image2.jpg - Deleted from filesystem
    // image3.jpg - Deleted from filesystem
  ]
}
```

**Total:** 5 images (kept 2, deleted 2, added 3) ✅

---

### Scenario 4: Replace All Images (4 → 3)

**Current State:** Asset has 4 images

**Request:** Remove all existing, add 3 new
```javascript
const formData = new FormData();
formData.append('existingImages', JSON.stringify([])); // Empty array
formData.append('images', newImage1);
formData.append('images', newImage2);
formData.append('images', newImage3);

await fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/asset_id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'existingImages=[]' \
  -F "images=@/path/to/new-image1.jpg" \
  -F "images=@/path/to/new-image2.jpg" \
  -F "images=@/path/to/new-image3.jpg"
```

**Result:**
```javascript
{
  "images": [
    "uploads/assets/new-image1.jpg",  // Added
    "uploads/assets/new-image2.jpg",  // Added
    "uploads/assets/new-image3.jpg"   // Added
    // All 4 old images deleted from filesystem
  ]
}
```

**Total:** 3 images (deleted 4, added 3) ✅

---

### Scenario 5: Delete All Images

**Current State:** Asset has 4 images

**Request:** Remove all, don't add new
```javascript
const formData = new FormData();
formData.append('existingImages', JSON.stringify([])); // Empty array
// No new images

await fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**cURL:**
```bash
curl -X PUT http://localhost:5000/api/v1/assets/asset_id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F 'existingImages=[]'
```

**Result:**
```javascript
{
  "images": []
  // All 4 images deleted from filesystem
}
```

**Total:** 0 images ✅

---

### Scenario 6: Keep All Existing, Add New (Default Behavior)

**Current State:** Asset has 3 images

**Request:** Keep all, add 2 more
```javascript
const formData = new FormData();
// Don't include existingImages field (default behavior)
formData.append('images', newImage1);
formData.append('images', newImage2);

await fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Result:**
```javascript
{
  "images": [
    "uploads/assets/old-image1.jpg",  // Kept
    "uploads/assets/old-image2.jpg",  // Kept
    "uploads/assets/old-image3.jpg",  // Kept
    "uploads/assets/new-image1.jpg",  // Added
    "uploads/assets/new-image2.jpg"   // Added
  ]
}
```

**Total:** 5 images (kept 3, added 2) ✅

---

### Scenario 7: Update Other Fields Without Touching Images

**Current State:** Asset has 4 images

**Request:** Update status, don't touch images
```javascript
const formData = new FormData();
formData.append('status', 'MAINTENANCE');
// No existingImages field
// No new images

await fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Result:**
```javascript
{
  "status": "MAINTENANCE",
  "images": [
    "uploads/assets/image1.jpg",  // Unchanged
    "uploads/assets/image2.jpg",  // Unchanged
    "uploads/assets/image3.jpg",  // Unchanged
    "uploads/assets/image4.jpg"   // Unchanged
  ]
}
```

**Total:** 4 images (unchanged) ✅

---

### Scenario 8: Keep 1, Remove 3, Add 2 (4 - 3 + 2 = 3)

**Current State:** Asset has 4 images

**Request:** Keep only image2, remove others, add 2 new
```javascript
const formData = new FormData();
formData.append('existingImages', JSON.stringify([
  "uploads/assets/image2.jpg"
]));
formData.append('images', newImage1);
formData.append('images', newImage2);

await fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

**Result:**
```javascript
{
  "images": [
    "uploads/assets/image2.jpg",      // Kept
    "uploads/assets/new-image1.jpg",  // Added
    "uploads/assets/new-image2.jpg"   // Added
    // image1.jpg - Deleted
    // image3.jpg - Deleted
    // image4.jpg - Deleted
  ]
}
```

**Total:** 3 images (kept 1, deleted 3, added 2) ✅

---

## 📊 Complete Scenarios Table

| Scenario | Current | existingImages | New Files | Final | Math |
|----------|---------|----------------|-----------|-------|------|
| Add to existing | 4 | Not provided | 2 | 6 | 4 + 2 = 6 |
| Remove specific | 4 | 2 paths | 0 | 2 | 4 - 2 = 2 |
| Remove + Add | 4 | 2 paths | 3 | 5 | 4 - 2 + 3 = 5 |
| Replace all | 4 | [] | 3 | 3 | 4 - 4 + 3 = 3 |
| Delete all | 4 | [] | 0 | 0 | 4 - 4 = 0 |
| Keep all + Add | 3 | Not provided | 2 | 5 | 3 + 2 = 5 |
| No image changes | 4 | Not provided | 0 | 4 | 4 = 4 |
| Keep 1, Remove 3, Add 2 | 4 | 1 path | 2 | 3 | 4 - 3 + 2 = 3 |

---

## 💡 How to Get Current Image Paths

Before updating images, you need to get current image paths from the asset:

```javascript
// 1. Get asset details
const response = await fetch('/api/v1/assets/asset_id', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data } = await response.json();
const currentImages = data.images;

// 2. Select which images to keep
const imagesToKeep = [
  currentImages[0],  // Keep first image
  currentImages[2],  // Keep third image
  // Skip second and fourth
];

// 3. Update with selected images
const formData = new FormData();
formData.append('existingImages', JSON.stringify(imagesToKeep));
formData.append('images', newImageFile);

await fetch('/api/v1/assets/asset_id', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

---

## 🎯 Logic Flow

```
1. Check if existingImages field provided
   
   YES → Use existingImages array
   ├─ Compare with current asset.images
   ├─ Keep: Images in existingImages
   ├─ Delete: Images NOT in existingImages
   └─ Add: New uploaded files
   
   NO → Append mode (default)
   ├─ Keep: All current asset.images
   └─ Add: New uploaded files
```

---

## 🔧 Frontend Implementation Examples

### Example 1: Image Selector with Add/Remove

```javascript
function updateAssetImages(assetId, selectedExistingImages, newFiles) {
  const formData = new FormData();
  
  // Specify which existing images to keep
  if (selectedExistingImages.length > 0 || newFiles.length > 0) {
    formData.append('existingImages', JSON.stringify(selectedExistingImages));
  }
  
  // Add new images
  newFiles.forEach(file => {
    formData.append('images', file);
  });
  
  return fetch(`/api/v1/assets/${assetId}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
}

// Usage
const currentImages = [
  "uploads/assets/image1.jpg",
  "uploads/assets/image2.jpg",
  "uploads/assets/image3.jpg",
  "uploads/assets/image4.jpg"
];

// User selects to keep image1 and image3
const selectedImages = [
  currentImages[0],
  currentImages[2]
];

// User uploads 3 new files
const newFiles = [file1, file2, file3];

// Result: 2 kept + 3 new = 5 images
await updateAssetImages('asset_id', selectedImages, newFiles);
```

---

### Example 2: React Component

```jsx
function ImageManager({ asset }) {
  const [selectedImages, setSelectedImages] = useState(asset.images);
  const [newFiles, setNewFiles] = useState([]);
  
  const handleImageToggle = (imagePath) => {
    setSelectedImages(prev => 
      prev.includes(imagePath)
        ? prev.filter(img => img !== imagePath)
        : [...prev, imagePath]
    );
  };
  
  const handleNewFiles = (files) => {
    setNewFiles(Array.from(files));
  };
  
  const handleUpdate = async () => {
    const formData = new FormData();
    formData.append('existingImages', JSON.stringify(selectedImages));
    newFiles.forEach(file => formData.append('images', file));
    
    await fetch(`/api/v1/assets/${asset._id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
  };
  
  return (
    <div>
      <h3>Existing Images ({asset.images.length})</h3>
      {asset.images.map(img => (
        <div key={img}>
          <input 
            type="checkbox"
            checked={selectedImages.includes(img)}
            onChange={() => handleImageToggle(img)}
          />
          <img src={`http://localhost:5000/${img}`} alt="" />
        </div>
      ))}
      
      <h3>Add New Images</h3>
      <input 
        type="file" 
        multiple 
        onChange={(e) => handleNewFiles(e.target.files)}
      />
      
      <p>
        Final: {selectedImages.length} existing + {newFiles.length} new 
        = {selectedImages.length + newFiles.length} total
      </p>
      
      <button onClick={handleUpdate}>Update Images</button>
    </div>
  );
}
```

---

## ⚠️ Important Notes

1. **existingImages is Optional**
   - Not provided → Keep all existing images (append mode)
   - Provided → Explicit control over which images to keep

2. **Image Paths Must Match Exactly**
   - Use the exact path from `asset.images`
   - Example: `"uploads/assets/asset-123.jpg"`

3. **Deleted Images Are Permanent**
   - Images not in `existingImages` are deleted from filesystem
   - Cannot be recovered

4. **Empty Array Removes All**
   - `existingImages: []` → Remove all existing images
   - Useful for complete replacement

5. **FormData JSON String**
   - When sending via FormData, stringify the array
   - `formData.append('existingImages', JSON.stringify(array))`

6. **No Duplicates**
   - If an image path appears multiple times in `existingImages`, it's kept once

---

## 🧪 Testing Checklist

- ✅ Add 2 images to 4 existing (4 + 2 = 6)
- ✅ Remove 2 images from 4 existing (4 - 2 = 2)
- ✅ Remove 2, add 3 from 4 existing (4 - 2 + 3 = 5)
- ✅ Replace all images (4 → 3)
- ✅ Delete all images (4 → 0)
- ✅ Keep all, add new (default behavior)
- ✅ Update other fields without touching images
- ✅ Keep 1, remove 3, add 2 (4 - 3 + 2 = 3)
- ✅ Empty existingImages array
- ✅ Invalid image paths in existingImages (ignored)

---

## 📝 API Response

All responses include both relative paths and full URLs:

```json
{
  "success": true,
  "message": "Asset updated successfully",
  "data": {
    "_id": "asset_id",
    "images": [
      "uploads/assets/image1.jpg",
      "uploads/assets/new-image.jpg"
    ],
    "imageUrls": [
      "http://localhost:5000/uploads/assets/image1.jpg",
      "http://localhost:5000/uploads/assets/new-image.jpg"
    ],
    "updatedAt": "2026-02-03T10:44:00.000Z"
  }
}
```

---

**Granular image management system is complete!** 🎉
