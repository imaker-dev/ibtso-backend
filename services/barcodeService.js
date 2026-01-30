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
      width: 250,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    let qrImage = await Jimp.read(qrCodeBuffer);

    const logoPath = path.join(__dirname, '..', 'uploads', 'logo.png');
    try {
      await fs.access(logoPath);
      const logo = await Jimp.read(logoPath);
      
      const logoSize = Math.floor(qrImage.bitmap.width * 0.18);
      logo.resize(logoSize, logoSize);
      
      const centerX = Math.floor((qrImage.bitmap.width - logoSize) / 2);
      const centerY = Math.floor((qrImage.bitmap.height - logoSize) / 2);
      
      const bgSize = logoSize + 10;
      const bgCircle = new Jimp(bgSize, bgSize, 0xFFFFFFFF);
      
      const bgX = Math.floor((qrImage.bitmap.width - bgSize) / 2);
      const bgY = Math.floor((qrImage.bitmap.height - bgSize) / 2);
      
      qrImage.composite(bgCircle, bgX, bgY);
      qrImage.composite(logo, centerX, centerY);
    } catch (err) {
      console.log('Logo not found or error embedding logo, generating QR without logo');
    }

    const filename = `${barcodeValue.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
    const filepath = path.join(uploadsDir, filename);

    if (assetNo) {
      const textHeight = 40;
      const finalImage = new Jimp(
        qrImage.bitmap.width + 20,
        qrImage.bitmap.height + textHeight + 20,
        '#FFFFFF'
      );
      
      finalImage.composite(qrImage, 10, 10);
      
      const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      
      finalImage.print(
        font,
        0,
        qrImage.bitmap.height + 15,
        {
          text: assetNo,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        finalImage.bitmap.width
      );
      
      await finalImage.writeAsync(filepath);
    } else {
      await qrImage.writeAsync(filepath);
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
  const { Op } = require('sequelize');
  
  const where = { barcodeValue };
  if (excludeAssetId) {
    where.id = { [Op.ne]: excludeAssetId };
  }
  
  const existing = await Asset.findOne({ where });
  return !existing;
};

module.exports = {
  generateBarcodeValue,
  generateBarcodeImage,
  regenerateBarcode,
  checkBarcodeUniqueness,
};
