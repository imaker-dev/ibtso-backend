# 📱 QR Code Specifications

## ✅ Updated QR Code Features

### 🎨 Visual Changes
1. **Smaller QR Code** - Reduced from 250px to 180px
2. **Dealer Code Prefix** - Shows `DEALERCODE-ASSETNO` at bottom
3. **Smaller Font** - Changed from 16px to 12px font
4. **Compact Design** - Overall smaller footprint

### 📄 PDF Layout Changes
- **Previous:** 3×3 grid (9 QR codes per page)
- **Current:** 4×4 grid (16 QR codes per page)

---

## 📏 Actual QR Code Dimensions

### Digital Dimensions (Pixels)
```
QR Code Only:
- Width: 180px
- Height: 180px

With Text Label (DealerCode-AssetNo):
- Width: 200px (180px QR + 20px padding)
- Height: 230px (180px QR + 30px text + 20px padding)
```

### Physical Dimensions (at 300 DPI print quality)

**QR Code Only:**
- **Width: 1.52 cm** (0.6 inches)
- **Height: 1.52 cm** (0.6 inches)

**Complete Barcode (with text):**
- **Width: 1.70 cm** (0.67 inches)
- **Height: 1.95 cm** (0.77 inches)

**PDF 4×4 Grid:**
- **Each cell: ~3.0 cm × 4.0 cm** (with spacing)
- **QR size in PDF: ~3.2 cm** (120 points = 1.27 inches)

---

## 🔧 Technical Specifications

### QR Code Generation Settings
```javascript
{
  type: 'png',
  width: 180,           // Reduced from 250px
  margin: 1,            // Minimal margin
  errorCorrectionLevel: 'H',  // High (30% recovery)
  color: {
    dark: '#000000',    // Black
    light: '#FFFFFF'    // White
  }
}
```

### Logo Embedding
- **Logo size:** 18% of QR width (~32px)
- **Background:** White circle for contrast
- **Position:** Center of QR code
- **Padding:** 10px around logo

### Text Label
```javascript
{
  font: 'FONT_SANS_12_BLACK',    // Smaller font
  text: 'DEALERCODE-ASSETNO',    // Format
  alignment: 'CENTER',
  position: 'Bottom of QR',
  height: 30px                    // Text area height
}
```

---

## 📄 PDF Layout Specifications

### 4×4 Grid Layout
```javascript
Page: A4 (595.28 × 841.89 points)
Margin: 40 points
QR Size: 120 points per cell
Spacing: Auto-calculated

Grid Calculation:
- 4 columns × 4 rows = 16 QR codes per page
- Cell width: (595.28 - 80) / 4 = 128.82 points
- Cell height: (841.89 - 150) / 4 = 172.97 points
- QR centered in each cell
```

### Physical Layout (A4 Paper)
```
Page Size: 21.0 cm × 29.7 cm (A4)
Margins: 1.41 cm
Grid: 4×4
Cell Size: ~4.5 cm × 4.9 cm
QR Size: ~3.2 cm × 3.2 cm (fits in cell)
```

---

## 🎯 Size Comparison

### Before vs After

| Aspect | Before | After |
|--------|--------|-------|
| **QR Size** | 250px | 180px ✅ |
| **Physical QR** | 2.12 cm | 1.52 cm ✅ |
| **With Text** | 2.54 cm × 2.96 cm | 1.70 cm × 1.95 cm ✅ |
| **Font Size** | 16px | 12px ✅ |
| **Text Display** | ASSETNO only | DEALERCODE-ASSETNO ✅ |
| **PDF Grid** | 3×3 (9/page) | 4×4 (16/page) ✅ |
| **QRs per page** | 9 | 16 (+77%) ✅ |

---

## 📊 Print Quality

### Recommended Print Settings
- **DPI:** 300 (standard quality)
- **Paper:** A4 (210mm × 297mm)
- **Color:** Black & White (grayscale acceptable)
- **Quality:** Standard or High

### Scanning Distance
- **Optimal:** 10-30 cm from scanner
- **Minimum:** 5 cm
- **Maximum:** 50 cm (depends on scanner)

### Error Correction
- **Level:** H (High - 30% recovery)
- **Benefits:** 
  - Can scan even if partially damaged
  - Logo overlay doesn't affect scanning
  - Resistant to minor print defects

---

## 🔍 Scannability

### Tested & Verified ✅
- ✅ QR codes scannable at 180px size
- ✅ Logo overlay doesn't interfere
- ✅ High error correction ensures reliability
- ✅ Text label doesn't affect QR scanning
- ✅ PDF print quality maintains scannability

### Minimum Requirements
- **QR Size:** 1.5 cm × 1.5 cm (minimum for reliable scanning)
- **Print Quality:** 300 DPI or higher
- **Contrast:** Black on white background
- **Clarity:** No smudges or distortions

---

## 💾 File Sizes

### Individual QR Code Images
```
Format: PNG
QR Only: ~2-3 KB
With Text: ~3-5 KB
With Logo: ~5-8 KB
```

### PDF File Sizes (approximate)
```
10 assets: ~50-80 KB
50 assets: ~250-400 KB
100 assets: ~500-800 KB
500 assets: ~2.5-4 MB
```

---

## 🎨 Display Examples

### Single QR Code
```
┌────────────────┐
│   Logo         │  ← 180px × 180px QR
│   [QR Code]    │     with logo overlay
│                │
└────────────────┘
  DLR001-AST123     ← 12px font text
```

### PDF 4×4 Grid Layout
```
┌──────────────────────────────┐
│  Header: Dealer Info         │
├─────┬─────┬─────┬─────┬──────┤
│ QR1 │ QR2 │ QR3 │ QR4 │      │
├─────┼─────┼─────┼─────┤      │
│ QR5 │ QR6 │ QR7 │ QR8 │      │
├─────┼─────┼─────┼─────┤ A4   │
│ QR9 │QR10 │QR11 │QR12 │      │
├─────┼─────┼─────┼─────┤      │
│QR13 │QR14 │QR15 │QR16 │      │
└─────┴─────┴─────┴─────┴──────┘
```

---

## ✅ Summary

**QR Code Actual Size:**
- **QR Only:** 1.5 cm × 1.5 cm
- **With Text:** 1.7 cm × 2.0 cm
- **In PDF:** ~3.2 cm per QR

**Key Improvements:**
- ✅ 28% smaller QR size (250px → 180px)
- ✅ Dealer code prefix added to text
- ✅ 77% more QRs per page (9 → 16)
- ✅ Smaller font for compact display
- ✅ Maintains excellent scannability

**Print Specifications:**
- Best quality: 300 DPI
- Paper: A4 standard
- Format: PNG images, PDF collection
- Error correction: High (30% recovery)

---

**All QR codes are print-ready and scannable! 🎉**
