const Asset = require('../models/Asset');
const Dealer = require('../models/Dealer');
const Brand = require('../models/Brand');
const Client = require('../models/Client');
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
      .populate('brandId', 'name isActive')
      .populate('clientId', 'name email phone company address vatin placeOfSupply country')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!asset) {
      console.log('Asset not found for barcode:', asset.dimension );
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
                  <div class="info-value">${asset.dimension.length  || 'N/A'}(L) × ${asset.dimension.height || 'N/A'}(H) × ${asset.dimension.depth || 'N/A'}(D) ${asset.dimension.unit || 'N/A'}</div>
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
                  <div class="info-value">${asset.brandId ? asset.brandId.name : 'N/A'}</div>
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

            ${asset.clientId ? `
            <div class="section">
              <div class="section-title">👤 Client Details</div>
              <div class="info-grid">
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Name</div>
                  <div class="info-value">${asset.clientId.name}</div>
                </div>
                ${asset.clientId.company ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Company</div>
                  <div class="info-value">${asset.clientId.company}</div>
                </div>
                ` : ''}
                ${asset.clientId.email ? `
                <div class="info-item">
                  <div class="info-label">Email</div>
                  <div class="info-value">${asset.clientId.email}</div>
                </div>
                ` : ''}
                ${asset.clientId.phone ? `
                <div class="info-item">
                  <div class="info-label">Phone</div>
                  <div class="info-value">${asset.clientId.phone}</div>
                </div>
                ` : ''}
                ${asset.clientId.address ? `
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="info-label">Address</div>
                  <div class="info-value">${asset.clientId.address}</div>
                </div>
                ` : ''}
                ${asset.clientId.vatin ? `
                <div class="info-item">
                  <div class="info-label">VATIN</div>
                  <div class="info-value">${asset.clientId.vatin}</div>
                </div>
                ` : ''}
                ${asset.clientId.placeOfSupply ? `
                <div class="info-item">
                  <div class="info-label">Place of Supply</div>
                  <div class="info-value">${asset.clientId.placeOfSupply}</div>
                </div>
                ` : ''}
                ${asset.clientId.country ? `
                <div class="info-item">
                  <div class="info-label">Country</div>
                  <div class="info-value">${asset.clientId.country}</div>
                </div>
                ` : ''}
              </div>
            </div>
            ` : ''}

            ${asset.images && asset.images.length > 0 ? `
            <div class="section">
              <div class="section-title">📷 Asset Images</div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                ${asset.images.map(img => `
                  <div style="border: 2px solid #667eea; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <img src="/${img}" alt="Asset Image" style="width: 100%; height: 200px; object-fit: cover; display: block;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'padding: 20px; text-align: center; color: #999;\\'>Image not available</div>'">
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}

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
      .populate('brandId', 'name isActive')
      .populate('clientId', 'name email phone company address vatin placeOfSupply country')
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

    const dealer = asset.dealerId;
    const newBarcodeValue = generateBarcodeValue(dealer.dealerCode, asset.fixtureNo);
    const barcodeImage = await regenerateBarcode(asset.barcodeImagePath, newBarcodeValue, asset.assetNo, dealer.dealerCode);

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

    const { clientId } = req.params;
    const { startDate, endDate } = req.query;

    const client = await Client.findById(clientId);
    if (!client) {
      return next(new AppError('Client not found', 404));
    }

    const dealerIds = client.dealerIds;
    
    // Fetch all dealers for this client
    const dealers = await Dealer.find({ _id: { $in: dealerIds } });
    
    if (dealers.length === 0) {
      return next(new AppError('No dealers found for this client', 404));
    }

    // Build query with optional date range for all dealers under this client
    const query = { dealerId: { $in: dealerIds }, isDeleted: false };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const assets = await Asset.find(query)
      .select('fixtureNo assetNo barcodeValue barcodeImagePath brand status createdAt dealerId')
      .sort({ createdAt: -1 });

    if (assets.length === 0) {
      return next(new AppError('No assets found for this client', 404));
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `barcodes_${client.name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('IBTSO Asset Tracking', { align: 'center' });
    doc.fontSize(16).text(`Barcode Collection - ${client.name}`, { align: 'center' });
    doc.fontSize(12).text(`Company: ${client.company}`, { align: 'center' });
    doc.fontSize(10).text(`Dealers: ${dealers.map(d => d.name).join(', ')}`, { align: 'center' });
    if (startDate || endDate) {
      const dateRangeText = `Date Range: ${startDate ? new Date(startDate).toLocaleDateString() : 'All'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'All'}`;
      doc.fontSize(9).text(dateRangeText, { align: 'center' });
    }
    doc.fontSize(10).text(`Total Assets: ${assets.length}`, { align: 'center' });
    doc.fontSize(8).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // 4x4 grid layout - 16 QR codes per page
    const qrPerRow = 4;
    const qrPerPage = 16;
    const pageWidth = 595.28; // A4 width in points
    const pageHeight = 841.89; // A4 height in points
    const margin = 40;
    const qrSize = 120; // Smaller QR for 4x4 grid
    const spacing = 10;
    
    const cellWidth = (pageWidth - (2 * margin)) / qrPerRow;
    const cellHeight = (pageHeight - 150) / qrPerRow; // Reserve 150 for header

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      // Add new page for every 16 QRs
      if (i > 0 && i % qrPerPage === 0) {
        doc.addPage();
      }

      // Calculate position in 4x4 grid
      const positionOnPage = i % qrPerPage;
      const row = Math.floor(positionOnPage / qrPerRow);
      const col = positionOnPage % qrPerRow;
      
      const x = margin + (col * cellWidth) + (cellWidth - qrSize) / 2;
      const y = 150 + (row * cellHeight);

      try {
        // Get the dealer for this asset to use dealer code
        const assetDealer = dealers.find(d => d._id.toString() === asset.dealerId.toString());
        const dealerCode = assetDealer ? assetDealer.dealerCode : 'UNKNOWN';
        
        const tempBarcode = await generateBarcodeImage(asset.barcodeValue, asset.assetNo, dealerCode);
        const tempImagePath = tempBarcode.filepath;

        if (fs.existsSync(tempImagePath)) {
          doc.image(tempImagePath, x, y, {
            fit: [qrSize, qrSize],
          });
          
          fs.unlinkSync(tempImagePath);
        } else {
          doc.fontSize(6).fillColor('red').text('QR Error', x, y);
          doc.fillColor('black');
        }
      } catch (err) {
        console.error('PDF barcode generation error:', err);
        doc.fontSize(6).fillColor('red').text('Error', x, y);
        doc.fillColor('black');
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
        const tempBarcode = await generateBarcodeImage(asset.barcodeValue, asset.assetNo, dealer.dealerCode);
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

// Download ALL assets PDF (admin only) - with date range filter
exports.downloadAllAssetsPDF = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return next(new AppError('Only admins can access this feature', 403));
    }

    const { startDate, endDate } = req.query;

    const query = { isDeleted: false };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const assets = await Asset.find(query)
      .select('fixtureNo assetNo barcodeValue barcodeImagePath brand status dealerId createdAt')
      .populate('dealerId', 'dealerCode name shopName')
      .sort({ createdAt: -1 });

    if (assets.length === 0) {
      return next(new AppError('No assets found', 404));
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `all_barcodes_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('IBTSO Asset Tracking', { align: 'center' });
    doc.fontSize(16).text('All Assets Barcode Collection', { align: 'center' });
    if (startDate || endDate) {
      const dateRangeText = `Date Range: ${startDate ? new Date(startDate).toLocaleDateString() : 'All'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'All'}`;
      doc.fontSize(9).text(dateRangeText, { align: 'center' });
    }
    doc.fontSize(10).text(`Total Assets: ${assets.length}`, { align: 'center' });
    doc.fontSize(8).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const qrPerRow = 4;
    const qrPerPage = 16;
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;
    const qrSize = 120;
    
    const cellWidth = (pageWidth - (2 * margin)) / qrPerRow;
    const cellHeight = (pageHeight - 150) / qrPerRow;

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      if (i > 0 && i % qrPerPage === 0) {
        doc.addPage();
      }

      const positionOnPage = i % qrPerPage;
      const row = Math.floor(positionOnPage / qrPerRow);
      const col = positionOnPage % qrPerRow;
      
      const x = margin + (col * cellWidth) + (cellWidth - qrSize) / 2;
      const y = 150 + (row * cellHeight);

      try {
        const dealerCode = asset.dealerId ? asset.dealerId.dealerCode : 'UNKNOWN';
        const tempBarcode = await generateBarcodeImage(asset.barcodeValue, asset.assetNo, dealerCode);
        const tempImagePath = tempBarcode.filepath;

        if (fs.existsSync(tempImagePath)) {
          doc.image(tempImagePath, x, y, {
            fit: [qrSize, qrSize],
          });
          
          fs.unlinkSync(tempImagePath);
        }
      } catch (err) {
        console.error('PDF barcode generation error:', err);
      }
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

// Download single asset QR as PNG
exports.downloadSingleAssetQR = async (req, res, next) => {
  try {
    const { assetId } = req.params;

    const asset = await Asset.findById(assetId)
      .populate('dealerId', 'dealerCode');

    if (!asset) {
      return next(new AppError('Asset not found', 404));
    }

    if (req.user.role === 'DEALER' && asset.dealerId._id.toString() !== req.user.dealerRef.toString()) {
      return next(new AppError('You can only download QR codes for your own assets', 403));
    }

    const dealerCode = asset.dealerId ? asset.dealerId.dealerCode : 'UNKNOWN';
    const barcodeImage = await generateBarcodeImage(asset.barcodeValue, asset.assetNo, dealerCode);
    const imagePath = barcodeImage.filepath;

    if (!fs.existsSync(imagePath)) {
      return next(new AppError('QR code image not found', 404));
    }

    const filename = `QR_${asset.assetNo}_${Date.now()}.png`;

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const imageBuffer = fs.readFileSync(imagePath);
    fs.unlinkSync(imagePath);

    res.send(imageBuffer);
  } catch (error) {
    next(error);
  }
};

// Download multiple assets QR as PDF
exports.downloadMultipleAssetsQR = async (req, res, next) => {
  try {
    const { assetIds } = req.body;

    if (!assetIds || !Array.isArray(assetIds) || assetIds.length === 0) {
      return next(new AppError('Please provide an array of asset IDs', 400));
    }

    const assets = await Asset.find({ 
      _id: { $in: assetIds }, 
      isDeleted: false 
    })
    .select('fixtureNo assetNo barcodeValue barcodeImagePath brand status dealerId')
    .populate('dealerId', 'dealerCode name shopName')
    .sort({ createdAt: -1 });

    if (assets.length === 0) {
      return next(new AppError('No assets found with provided IDs', 404));
    }

    if (req.user.role === 'DEALER') {
      const unauthorizedAsset = assets.find(
        asset => asset.dealerId._id.toString() !== req.user.dealerRef.toString()
      );
      if (unauthorizedAsset) {
        return next(new AppError('You can only download QR codes for your own assets', 403));
      }
    }

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const filename = `selected_barcodes_${Date.now()}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);

    doc.fontSize(20).text('IBTSO Asset Tracking', { align: 'center' });
    doc.fontSize(16).text('Selected Assets QR Codes', { align: 'center' });
    doc.fontSize(10).text(`Total Selected: ${assets.length}`, { align: 'center' });
    doc.fontSize(8).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const qrPerRow = 4;
    const qrPerPage = 16;
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const margin = 40;
    const qrSize = 120;
    
    const cellWidth = (pageWidth - (2 * margin)) / qrPerRow;
    const cellHeight = (pageHeight - 150) / qrPerRow;

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      if (i > 0 && i % qrPerPage === 0) {
        doc.addPage();
      }

      const positionOnPage = i % qrPerPage;
      const row = Math.floor(positionOnPage / qrPerRow);
      const col = positionOnPage % qrPerRow;
      
      const x = margin + (col * cellWidth) + (cellWidth - qrSize) / 2;
      const y = 150 + (row * cellHeight);

      try {
        const dealerCode = asset.dealerId ? asset.dealerId.dealerCode : 'UNKNOWN';
        const tempBarcode = await generateBarcodeImage(asset.barcodeValue, asset.assetNo, dealerCode);
        const tempImagePath = tempBarcode.filepath;

        if (fs.existsSync(tempImagePath)) {
          doc.image(tempImagePath, x, y, {
            fit: [qrSize, qrSize],
          });
          
          fs.unlinkSync(tempImagePath);
        }
      } catch (err) {
        console.error('PDF barcode generation error:', err);
      }
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};
