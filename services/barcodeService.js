const QRCode = require('qrcode');
const Jimp = require('jimp');
const fs = require('fs').promises;
const path = require('path');

const generateBarcodeValue = (dealerCode, fixtureNo) => {
  const year = new Date().getFullYear().toString().slice(-2);
  const timestamp = Date.now().toString().slice(-4);
  
  return `${dealerCode}-${fixtureNo}-${year}${timestamp}`.toUpperCase();
};

const generateBarcodeImage = async (barcodeValue, assetNo = null) => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'barcodes');
    
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const appUrl = process.env.APP_URL || 'http://localhost:5000';
    const scanUrl = `${appUrl}/api/v1/barcodes/public/scan/${barcodeValue}`;

    const qrCodeBuffer = await QRCode.toBuffer(scanUrl, {
      type: 'png',
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    const filename = `${barcodeValue.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
    const filepath = path.join(uploadsDir, filename);

    if (assetNo) {
      const qrImage = await Jimp.read(qrCodeBuffer);
      
      const textHeight = 60;
      const finalImage = new Jimp(
        qrImage.bitmap.width + 40,
        qrImage.bitmap.height + textHeight + 40,
        '#FFFFFF'
      );
      
      finalImage.composite(qrImage, 20, 20);
      
      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
      
      finalImage.print(
        font,
        0,
        qrImage.bitmap.height + 30,
        {
          text: assetNo,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        finalImage.bitmap.width
      );
      
      await finalImage.writeAsync(filepath);
    } else {
      await fs.writeFile(filepath, qrCodeBuffer);
    }

    const relativePath = path.join('uploads', 'barcodes', filename);
    
    return {
      filename,
      filepath,
      relativePath: relativePath.replace(/\\/g, '/'),
    };
  } catch (error) {
    console.error('Barcode generation error:', error);
    throw new Error(`Failed to generate barcode image: ${error.message}`);  
  }
};

const regenerateBarcode = async (oldBarcodeImagePath, newBarcodeValue, assetNo = null) => {
  try {
    if (oldBarcodeImagePath) {
      const oldPath = path.join(__dirname, '..', oldBarcodeImagePath);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        console.log('Old barcode file not found or already deleted');
      }
    }

    return await generateBarcodeImage(newBarcodeValue, assetNo);
  } catch (error) {
    throw new Error(`Failed to regenerate barcode: ${error.message}`);  
  }
};

const checkBarcodeUniqueness = async (Asset, barcodeValue, excludeAssetId = null) => {
  const query = { barcodeValue };
  if (excludeAssetId) {
    query._id = { $ne: excludeAssetId };
  }
  
  const existing = await Asset.findOne(query);
  return !existing;
};

module.exports = {
  generateBarcodeValue,
  generateBarcodeImage,
  regenerateBarcode,
  checkBarcodeUniqueness,
};
