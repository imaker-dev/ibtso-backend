const { Asset, Dealer, User } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');
const { regenerateBarcode, generateBarcodeValue, generateBarcodeImage } = require('../services/barcodeService');
const PDFDocument = require('pdfkit');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

exports.scanBarcodePublic = async (req, res, next) => {
  try {
    const { barcodeValue } = req.params;

    if (!barcodeValue) {
      return res.status(400).send('<h1>Error: Barcode value is required</h1>');
    }

    const asset = await Asset.findOne({ 
      where: { barcodeValue: barcodeValue.toUpperCase() },
      include: [
        { model: Dealer, as: 'dealer', attributes: ['dealerCode', 'name', 'shopName', 'email', 'phone', 'location', 'vatRegistration'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] },
        { model: User, as: 'updater', attributes: ['name', 'email'] }
      ]
    });

    if (!asset) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Asset Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Asset Not Found</h1>
            <p>No asset found for barcode: <strong>${barcodeValue}</strong></p>
          </div>
        </body>
        </html>
      `);
    }

    if (asset.isDeleted) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Asset Deleted</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
            h1 { color: #e67e22; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Asset Deleted</h1>
            <p>This asset has been deleted from the system.</p>
          </div>
        </body>
        </html>
      `);
    }

    const statusColors = {
      'ACTIVE': '#27ae60',
      'INACTIVE': '#95a5a6',
      'MAINTENANCE': '#f39c12',
      'DAMAGED': '#e74c3c'
    };

    const dealer = asset.dealer || {};
    const creator = asset.creator || {};
    const updater = asset.updater || {};

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Asset Details - ${asset.assetNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .header p { opacity: 0.9; font-size: 14px; }
          .highlight-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px; border-radius: 8px; text-align: center; }
          .highlight-box h2 { color: #667eea; font-size: 32px; margin-bottom: 5px; }
          .highlight-box p { color: #6c757d; font-size: 14px; }
          .content { padding: 20px; }
          .section-title { background: #667eea; color: white; padding: 12px 20px; font-size: 16px; font-weight: bold; margin: 20px 0 15px 0; border-radius: 5px; }
          .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; padding: 0 20px; margin-bottom: 20px; }
          .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; }
          .info-label { font-size: 12px; color: #6c757d; margin-bottom: 5px; font-weight: 600; text-transform: uppercase; }
          .info-value { font-size: 16px; color: #212529; font-weight: 500; word-break: break-word; }
          .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; color: white; font-size: 14px; font-weight: bold; }
          .qr-image { text-align: center; padding: 30px 20px; background: #f8f9fa; margin: 20px; border-radius: 8px; }
          .qr-image img { max-width: 300px; width: 100%; height: auto; border: 3px solid #667eea; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
          .qr-image p { margin-top: 15px; color: #6c757d; font-size: 14px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; border-top: 1px solid #e9ecef; }
          @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } .header h1 { font-size: 24px; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Asset Information</h1>
            <p>IBTSO Asset Tracking System</p>
          </div>
          
          <div class="content">
            <div class="highlight-box">
              <h2>${asset.assetNo}</h2>
              <p>Asset Number</p>
            </div>

            <div class="section-title">📦 Asset Information</div>
            <div class="info-grid">
              <div class="info-item" style="grid-column: 1 / -1;">
                <div class="info-label">Fixture No/Asset No</div>
                <div class="info-value">${asset.fixtureNo}/${asset.assetNo}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Dimension</div>
                <div class="info-value">${asset.dimension.length} (L) × ${asset.dimension.height} (H) × ${asset.dimension.depth} (D) ${asset.dimension.unit}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Stand Type</div>
                <div class="info-value">${asset.standType}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Brand</div>
                <div class="info-value">${asset.brand}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Installation Date</div>
                <div class="info-value">${moment(asset.installationDate).format('Do MMM YYYY')}</div>
              </div>
              <div class="info-item" style="grid-column: 1 / -1;">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge" style="background-color: ${statusColors[asset.status] || '#95a5a6'}">${asset.status}</span>
                </div>
              </div>
              <div class="info-item" style="grid-column: 1 / -1;">
                <div class="info-label">Days Since Installation</div>
                <div class="info-value">${moment().diff(moment(asset.installationDate), 'days')} days</div>
              </div>
            </div>

            <div class="section-title">🏪 Dealer Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Name</div>
                <div class="info-value">${dealer.name || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone</div>
                <div class="info-value">${dealer.phone || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email</div>
                <div class="info-value">${dealer.email || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Shop Name</div>
                <div class="info-value">${dealer.shopName || 'N/A'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">VAT Registration</div>
                <div class="info-value">${dealer.vatRegistration || 'N/A'}</div>
              </div>
              <div class="info-item" style="grid-column: 1 / -1;">
                <div class="info-label">Location</div>
                <div class="info-value">${dealer.location?.address || 'N/A'}</div>
              </div>
            </div>

            <div class="section-title">📍 Asset Location Coordinates</div>
            <div class="info-grid">
              <div class="info-item" style="grid-column: 1 / -1;">
                <div class="info-label">Address</div>
                <div class="info-value">${asset.location.address}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Latitude</div>
                <div class="info-value">${asset.location.latitude}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Longitude</div>
                <div class="info-value">${asset.location.longitude}</div>
              </div>
              <div class="info-item" style="grid-column: 1 / -1;">
                <div class="info-label">Google Maps</div>
                <div class="info-value"><a href="${asset.location.googleMapLink}" target="_blank" style="color: #667eea;">📍 View on Google Maps</a></div>
              </div>
            </div>

            <div class="section-title">⏱️ Timeline Information</div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Created Date</div>
                <div class="info-value">${moment(asset.createdAt).format('DD MMM YYYY, hh:mm A')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Last Updated</div>
                <div class="info-value">${moment(asset.updatedAt).format('DD MMM YYYY, hh:mm A')}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Created By</div>
                <div class="info-value">${creator.name || 'N/A'}<br/><span style="font-size: 12px; color: #6c757d;">${creator.email || ''}</span></div>
              </div>
              <div class="info-item">
                <div class="info-label">Updated By</div>
                <div class="info-value">${updater.name || 'N/A'}<br/><span style="font-size: 12px; color: #6c757d;">${updater.email || ''}</span></div>
              </div>
            </div>

            <div class="qr-image">
              <img src="${asset.toJSON().barcodeImageUrl}" alt="QR Code with Asset Number" />
              <p>Scan this QR code to access asset details anytime</p>
            </div>
          </div>

          <div class="footer">
            <p>© 2026 IBTSO Asset Tracking System</p>
            <p>Powered by IBTSO Technology</p>
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Scan error:', error);
    next(error);
  }
};

exports.scanBarcode = async (req, res, next) => {
  try {
    const { barcodeValue } = req.params;

    if (!barcodeValue) {
      return next(new AppError('Barcode value is required', 400));
    }

    const asset = await Asset.findOne({ 
      where: { barcodeValue: barcodeValue.toUpperCase() },
      include: [
        { model: Dealer, as: 'dealer', attributes: ['dealerCode', 'name', 'shopName', 'email', 'phone', 'location', 'vatRegistration'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] },
        { model: User, as: 'updater', attributes: ['name', 'email'] }
      ]
    });

    if (!asset) {
      return next(new AppError('Asset not found for this barcode', 404));
    }

    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER' && asset.dealerId !== userDealerRef) {
      return next(new AppError('You do not have permission to access this asset', 403));
    }

    res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

exports.regenerateBarcodeForAsset = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return next(new AppError('Only admins can regenerate barcodes', 403));
    }

    const asset = await Asset.findByPk(req.params.assetId, {
      include: [{ model: Dealer, as: 'dealer' }]
    });

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    const dealer = asset.dealer;
    const newBarcodeValue = generateBarcodeValue(dealer.dealerCode, asset.fixtureNo);

    const barcodeImage = await regenerateBarcode(
      asset.barcodeImagePath,
      newBarcodeValue,
      asset.assetNo
    );

    asset.barcodeValue = newBarcodeValue;
    asset.barcodeImagePath = barcodeImage.relativePath;
    await asset.save();

    const updatedAsset = await Asset.findByPk(asset.id, {
      include: [
        { model: Dealer, as: 'dealer', attributes: ['dealerCode', 'name', 'shopName'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Barcode regenerated successfully',
      data: updatedAsset,
    });
  } catch (error) {
    next(error);
  }
};

exports.checkBarcodeAvailability = async (req, res, next) => {
  try {
    const { barcodeValue } = req.params;

    if (!barcodeValue) {
      return next(new AppError('Barcode value is required', 400));
    }

    const asset = await Asset.findOne({ where: { barcodeValue: barcodeValue.toUpperCase() } });

    res.status(200).json({
      success: true,
      available: !asset,
      message: asset ? 'Barcode already in use' : 'Barcode is available',
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadBarcode = async (req, res, next) => {
  try {
    const asset = await Asset.findByPk(req.params.assetId);

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER' && asset.dealerId !== userDealerRef) {
      return next(new AppError('You can only download barcodes for your own assets', 403));
    }

    const filePath = path.join(__dirname, '..', asset.barcodeImagePath);

    if (!fs.existsSync(filePath)) {
      return next(new AppError('Barcode image file not found', 404));
    }

    res.download(filePath, `${asset.assetNo}_barcode.png`);
  } catch (error) {
    next(error);
  }
};

exports.downloadAllBarcodesAsPDF = async (req, res, next) => {
  try {
    const dealerId = req.params.dealerId;

    const dealer = await Dealer.findByPk(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER' && userDealerRef !== dealerId) {
      return next(new AppError('You can only download barcodes for your own dealership', 403));
    }

    const assets = await Asset.findAll({
      where: { dealerId, isDeleted: false },
      attributes: ['fixtureNo', 'assetNo', 'barcodeValue', 'barcodeImagePath', 'brand', 'status'],
      order: [['created_at', 'DESC']]
    });

    if (assets.length === 0) {
      return next(new AppError('No assets found for this dealer', 404));
    }

    const tempDir = path.join(__dirname, '..', 'uploads', 'temp_barcodes');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempImages = [];
    for (const asset of assets) {
      const tempImagePath = path.join(tempDir, `${asset.assetNo}_${Date.now()}.png`);
      const barcodeImage = await generateBarcodeImage(asset.barcodeValue, asset.assetNo);
      fs.copyFileSync(path.join(__dirname, '..', barcodeImage.relativePath), tempImagePath);
      tempImages.push({ path: tempImagePath, asset });
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${dealer.dealerCode}_all_barcodes.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).text('Asset Barcodes', { align: 'center' });
    doc.fontSize(12).text(`Dealer: ${dealer.name} (${dealer.dealerCode})`, { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${moment().format('DD MMM YYYY, hh:mm A')}`, { align: 'center' });
    doc.moveDown(2);

    for (let i = 0; i < tempImages.length; i++) {
      const { path: imgPath, asset } = tempImages[i];

      if (i > 0 && i % 2 === 0) {
        doc.addPage();
      }

      const yPosition = i % 2 === 0 ? 150 : 450;

      doc.fontSize(12).font('Helvetica-Bold').text(asset.assetNo, 50, yPosition, { width: 500, align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`${asset.fixtureNo} | ${asset.brand}`, 50, yPosition + 20, { width: 500, align: 'center' });

      try {
        doc.image(imgPath, 200, yPosition + 40, { width: 200, height: 240 });
      } catch (err) {
        console.error(`Error adding image for ${asset.assetNo}:`, err);
      }
    }

    doc.end();

    doc.on('finish', () => {
      tempImages.forEach(({ path: imgPath }) => {
        try {
          fs.unlinkSync(imgPath);
        } catch (err) {
          console.error(`Error deleting temp file ${imgPath}:`, err);
        }
      });

      try {
        fs.rmdirSync(tempDir);
      } catch (err) {
        console.error('Error deleting temp directory:', err);
      }
    });

  } catch (error) {
    next(error);
  }
};

exports.downloadAllBarcodesAsZIP = async (req, res, next) => {
  try {
    const dealerId = req.params.dealerId;

    const dealer = await Dealer.findByPk(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const userDealerRef = req.user.dealerRef || req.user.dealer_ref;
    if (req.user.role === 'DEALER' && userDealerRef !== dealerId) {
      return next(new AppError('You can only download barcodes for your own dealership', 403));
    }

    const assets = await Asset.findAll({
      where: { dealerId, isDeleted: false },
      attributes: ['fixtureNo', 'assetNo', 'barcodeValue', 'barcodeImagePath', 'brand'],
      order: [['created_at', 'DESC']]
    });

    if (assets.length === 0) {
      return next(new AppError('No assets found for this dealer', 404));
    }

    const tempDir = path.join(__dirname, '..', 'uploads', 'temp_barcodes');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempImages = [];
    for (const asset of assets) {
      const tempImagePath = path.join(tempDir, `${asset.assetNo}_${Date.now()}.png`);
      const barcodeImage = await generateBarcodeImage(asset.barcodeValue, asset.assetNo);
      fs.copyFileSync(path.join(__dirname, '..', barcodeImage.relativePath), tempImagePath);
      tempImages.push({ path: tempImagePath, filename: `${asset.assetNo}_${asset.fixtureNo}.png` });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${dealer.dealerCode}_all_barcodes.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const { path: imgPath, filename } of tempImages) {
      archive.file(imgPath, { name: filename });
    }

    await archive.finalize();

    archive.on('end', () => {
      tempImages.forEach(({ path: imgPath }) => {
        try {
          fs.unlinkSync(imgPath);
        } catch (err) {
          console.error(`Error deleting temp file ${imgPath}:`, err);
        }
      });

      try {
        fs.rmdirSync(tempDir);
      } catch (err) {
        console.error('Error deleting temp directory:', err);
      }
    });

  } catch (error) {
    next(error);
  }
};
