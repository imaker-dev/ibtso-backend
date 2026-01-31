const Asset = require('../models/Asset');
const Dealer = require('../models/Dealer');
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

    const asset = await Asset.findOne({ barcodeValue: barcodeValue.toUpperCase() })
      .populate('dealerId', 'dealerCode name shopName email phone location vatRegistration')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

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

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Asset Details - ${asset.assetNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { font-size: 28px; margin-bottom: 10px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .content { padding: 30px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 15px; border-bottom: 2px solid #667eea; padding-bottom: 5px; }
          .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
          .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #667eea; }
          .info-label { font-size: 12px; color: #6c757d; text-transform: uppercase; margin-bottom: 5px; }
          .info-value { font-size: 16px; color: #212529; font-weight: 500; word-break: break-all; }
          .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; font-weight: bold; font-size: 14px; }
          .qr-image { text-align: center; margin: 20px 0; }
          .qr-image img { max-width: 400px; border: 3px solid #667eea; border-radius: 10px; padding: 10px; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
          .highlight-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 25px; text-align: center; }
          .highlight-box h2 { font-size: 32px; margin-bottom: 5px; }
          .highlight-box p { font-size: 14px; opacity: 0.9; }
          @media (max-width: 600px) {
            .header h1 { font-size: 22px; }
            .content { padding: 20px; }
            .info-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏢 IBTSO Asset Tracking</h1>
            <p>Asset Information System</p>
          </div>
          
          <div class="content">
            <div class="highlight-box">
              <h2>${asset.assetNo}</h2>
              <p>Asset Number</p>
            </div>

            <div class="section">
              <div class="section-title">📦 Asset Information</div>
              <div class="info-grid">
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Fixture No/Asset No</div>
                  <div class="info-value">${asset.fixtureNo}/${asset.assetNo}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Dimension</div>
                  <div class="info-value">${asset.dimension || 'N/A'}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Dealer</div>
                  <div class="info-value">${asset.dealerId.name}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Stand Type</div>
                  <div class="info-value">${asset.standType || 'N/A'}</div>
                </div>
               
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Brand</div>
                  <div class="info-value">${asset.brand}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
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
            </div>

            <div class="section">
              <div class="section-title">📍Asset Location Coordinates</div>
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
                ${asset.location.googleMapLink ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Google Maps</div>
                  <div class="info-value"><a href="${asset.location.googleMapLink}" target="_blank" style="color: #667eea;">📍 View on Google Maps</a></div>
                </div>
                ` : ''}
              </div>
            </div>

            <div class="section">
              <div class="section-title">🏪 Dealer Details</div>
              <div class="info-grid">
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Name</div>
                  <div class="info-value">${asset.dealerId.name}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Phone No</div>
                  <div class="info-value">${asset.dealerId.phone}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Email</div>
                  <div class="info-value">${asset.dealerId.email}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Shop Name</div>
                  <div class="info-value">${asset.dealerId.shopName}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">VAT Registration</div>
                  <div class="info-value">${asset.dealerId.vatRegistration || 'N/A'}</div>
                </div>
                ${asset.dealerId.location ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Location</div>
                  <div class="info-value">${asset.dealerId.location.address || 'N/A'}</div>
                </div>
                ` : ''}
              </div>
            </div>

            <div class="section">
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
                ${asset.createdBy ? `
                <div class="info-item">
                  <div class="info-label">Created By</div>
                  <div class="info-value">${asset.createdBy.name}<br/><span style="font-size: 12px; color: #6c757d;">${asset.createdBy.email}</span></div>
                </div>
                ` : ''}
                ${asset.updatedBy ? `
                <div class="info-item">
                  <div class="info-label">Updated By</div>
                  <div class="info-value">${asset.updatedBy.name}<br/><span style="font-size: 12px; color: #6c757d;">${asset.updatedBy.email}</span></div>
                </div>
                ` : ''}
              </div>
            </div>
           
          </div>

          <div class="footer">
            <p><strong>© ${new Date().getFullYear()} IBTSO Asset Tracking System</strong></p>
            <p style="margin-top: 5px;">📅 Scanned at ${moment().format('DD MMM YYYY, hh:mm A')}</p>
            <p style="margin-top: 5px; font-size: 11px; opacity: 0.8;">Asset ID: ${asset._id}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(html);
  } catch (error) {
    console.error('Public scan error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
          h1 { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Error</h1>
          <p>An error occurred while retrieving asset details.</p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">${error.message}</p>
        </div>
      </body>
      </html>
    `);
  }
};

exports.scanBarcode = async (req, res, next) => {
  try {
    const { barcodeValue } = req.params;

    if (!barcodeValue) {
      return next(new AppError('Barcode value is required', 400));
    }

    const asset = await Asset.findOne({ barcodeValue: barcodeValue.toUpperCase() })
      .populate('dealerId', 'dealerCode name shopName email phone location vatRegistration')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!asset) {
      return next(new AppError('Asset not found for this barcode', 404));
    }

    if (asset.isDeleted) {
      return next(new AppError('This asset has been deleted', 404));
    }

    if (req.user.role === 'DEALER' && asset.dealerId._id.toString() !== req.user.dealerRef.toString()) {
      return next(new AppError('You do not have permission to view this asset', 403));
    }

    const assetData = {
      asset: {
        _id: asset._id,
        fixtureNo: asset.fixtureNo,
        assetNo: asset.assetNo,
        barcodeValue: asset.barcodeValue,
        barcodeImageUrl: asset.barcodeImageUrl,
        dimension: asset.dimension,
        standType: asset.standType,
        brand: asset.brand,
        status: asset.status,
        installationDate: asset.installationDate,
        location: asset.location,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      },
      dealer: {
        dealerCode: asset.dealerId.dealerCode,
        name: asset.dealerId.name,
        shopName: asset.dealerId.shopName,
        email: asset.dealerId.email,
        phone: asset.dealerId.phone,
        location: asset.dealerId.location,
        vatRegistration: asset.dealerId.vatRegistration,
      },
      audit: {
        createdBy: asset.createdBy,
        updatedBy: asset.updatedBy,
      }
    };

    res.status(200).json({
      success: true,
      message: 'Asset details retrieved successfully',
      data: assetData,
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

    const asset = await Asset.findById(req.params.assetId).populate('dealerId');

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    const newBarcodeValue = generateBarcodeValue(asset.dealerId.dealerCode, asset.fixtureNo);

    const barcodeImage = await regenerateBarcode(asset.barcodeImagePath, newBarcodeValue, asset.assetNo);

    asset.barcodeValue = newBarcodeValue;
    asset.barcodeImagePath = barcodeImage.relativePath;
    asset.updatedBy = req.user._id;
    await asset.save();

    res.status(200).json({
      success: true,
      message: 'Barcode regenerated successfully',
      data: {
        barcodeValue: asset.barcodeValue,
        barcodeImageUrl: asset.barcodeImageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadBarcode = async (req, res, next) => {
  try {
    const { assetId } = req.params;

    const asset = await Asset.findById(assetId);

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    if (req.user.role === 'DEALER' && asset.dealerId.toString() !== req.user.dealerRef.toString()) {
      return next(new AppError('You do not have permission to access this barcode', 403));
    }

    res.status(200).json({
      success: true,
      data: {
        barcodeValue: asset.barcodeValue,
        barcodeImageUrl: asset.barcodeImageUrl,
        assetNo: asset.assetNo,
        fixtureNo: asset.fixtureNo,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.generateBarcodePreview = async (req, res, next) => {
  try {
    const { dealerCode, fixtureNo } = req.body;

    if (!dealerCode || !fixtureNo) {
      return next(new AppError('Dealer code and fixture number are required', 400));
    }

    const barcodeValue = generateBarcodeValue(dealerCode, fixtureNo);
    const barcodeImage = await generateBarcodeImage(barcodeValue);

    const appUrl = process.env.APP_URL || 'http://localhost:5000';
    
    res.status(200).json({
      success: true,
      message: 'Barcode preview generated',
      data: {
        barcodeValue,
        barcodeImageUrl: `${appUrl}/${barcodeImage.relativePath}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.validateBarcode = async (req, res, next) => {
  try {
    const { barcodeValue } = req.body;

    if (!barcodeValue) {
      return next(new AppError('Barcode value is required', 400));
    }

    const asset = await Asset.findOne({ barcodeValue: barcodeValue.toUpperCase() });

    res.status(200).json({
      success: true,
      data: {
        exists: !!asset,
        isAvailable: !asset,
        message: asset ? 'Barcode already in use' : 'Barcode is available',
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBarcodesForDealer = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return next(new AppError('Only admins can access this feature', 403));
    }

    const { dealerId } = req.params;

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const assets = await Asset.find({ dealerId, isDeleted: false })
      .select('fixtureNo assetNo barcodeValue barcodeImageUrl brand status createdAt')
      .sort({ createdAt: -1 });

    if (assets.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No assets found for this dealer',
        data: {
          dealer: {
            dealerCode: dealer.dealerCode,
            name: dealer.name,
            shopName: dealer.shopName,
          },
          totalBarcodes: 0,
          barcodes: [],
        },
      });
    }

    const barcodes = assets.map(asset => ({
      assetId: asset._id,
      fixtureNo: asset.fixtureNo,
      assetNo: asset.assetNo,
      barcodeValue: asset.barcodeValue,
      barcodeImageUrl: asset.barcodeImageUrl,
      brand: asset.brand,
      status: asset.status,
      createdAt: asset.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: 'Barcodes retrieved successfully',
      data: {
        dealer: {
          dealerId: dealer._id,
          dealerCode: dealer.dealerCode,
          name: dealer.name,
          shopName: dealer.shopName,
          email: dealer.email,
        },
        totalBarcodes: barcodes.length,
        barcodes,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.downloadAllBarcodesAsPDF = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return next(new AppError('Only admins can access this feature', 403));
    }

    const { dealerId } = req.params;

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const assets = await Asset.find({ dealerId, isDeleted: false })
      .select('fixtureNo assetNo barcodeValue barcodeImagePath brand status')
      .sort({ createdAt: -1 });

    if (assets.length === 0) {
      return next(new AppError('No assets found for this dealer', 404));
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `barcodes_${dealer.dealerCode}_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('IBTSO Asset Tracking', { align: 'center' });
    doc.fontSize(16).text(`Barcode Collection - ${dealer.name}`, { align: 'center' });
    doc.fontSize(12).text(`Dealer Code: ${dealer.dealerCode}`, { align: 'center' });
    doc.fontSize(10).text(`Shop: ${dealer.shopName}`, { align: 'center' });
    doc.fontSize(10).text(`Total Assets: ${assets.length}`, { align: 'center' });
    doc.fontSize(8).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      if (i > 0 && i % 3 === 0) {
        doc.addPage();
      }

      doc.fontSize(10).text(`Asset #${i + 1}`, { underline: true });
      doc.fontSize(9).text(`Fixture No: ${asset.fixtureNo}`);
      doc.fontSize(9).text(`Asset No: ${asset.assetNo}`);
      doc.fontSize(9).text(`Brand: ${asset.brand}`);
      doc.fontSize(9).text(`Status: ${asset.status}`);
      doc.fontSize(8).text(`Barcode: ${asset.barcodeValue}`);

      try {
        const tempBarcode = await generateBarcodeImage(asset.barcodeValue, asset.assetNo);
        const tempImagePath = tempBarcode.filepath;

        if (fs.existsSync(tempImagePath)) {
          doc.image(tempImagePath, {
            fit: [400, 150],
            align: 'center',
          });
          
          fs.unlinkSync(tempImagePath);
        } else {
          doc.fontSize(8).fillColor('red').text('Barcode image generation failed', { align: 'center' });
          doc.fillColor('black');
        }
      } catch (err) {
        console.error('PDF barcode generation error:', err);
        doc.fontSize(8).fillColor('red').text('Error generating barcode image', { align: 'center' });
        doc.fillColor('black');
      }

      doc.moveDown(1.5);
      
      if (i < assets.length - 1 && (i + 1) % 3 !== 0) {
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
      }
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

exports.downloadAllBarcodesAsZIP = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return next(new AppError('Only admins can access this feature', 403));
    }

    const { dealerId } = req.params;

    const dealer = await Dealer.findById(dealerId);
    if (!dealer) {
      return next(new AppError('Dealer not found', 404));
    }

    const assets = await Asset.find({ dealerId, isDeleted: false })
      .select('fixtureNo assetNo barcodeValue barcodeImagePath brand')
      .sort({ createdAt: -1 });

    if (assets.length === 0) {
      return next(new AppError('No assets found for this dealer', 404));
    }

    const filename = `barcodes_${dealer.dealerCode}_${Date.now()}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      return next(new AppError(`Error creating ZIP file: ${err.message}`, 500));
    });

    archive.pipe(res);

    const metadataContent = `IBTSO Asset Tracking - Barcode Collection\n` +
      `Dealer: ${dealer.name}\n` +
      `Dealer Code: ${dealer.dealerCode}\n` +
      `Shop: ${dealer.shopName}\n` +
      `Email: ${dealer.email}\n` +
      `Total Assets: ${assets.length}\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `Asset List:\n` +
      assets.map((a, i) => 
        `${i + 1}. ${a.assetNo} - ${a.fixtureNo} - ${a.brand} - ${a.barcodeValue}`
      ).join('\n');

    archive.append(metadataContent, { name: 'README.txt' });

    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    for (const asset of assets) {
      try {
        const tempBarcode = await generateBarcodeImage(asset.barcodeValue, asset.assetNo);
        const tempImagePath = tempBarcode.filepath;
        
        if (fs.existsSync(tempImagePath)) {
          const cleanFileName = `${asset.assetNo}_${asset.fixtureNo}.png`.replace(/[^a-zA-Z0-9_.-]/g, '_');
          archive.file(tempImagePath, { name: cleanFileName });
          
          setTimeout(() => {
            try {
              if (fs.existsSync(tempImagePath)) {
                fs.unlinkSync(tempImagePath);
              }
            } catch (err) {
              console.log('Temp file cleanup error:', err.message);
            }
          }, 1000);
        }
      } catch (err) {
        console.error('ZIP barcode generation error for asset:', asset.assetNo, err);
      }
    }

    archive.finalize();
  } catch (error) {
    next(error);
  }
};
