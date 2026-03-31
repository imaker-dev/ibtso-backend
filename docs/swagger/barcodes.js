/**
 * @swagger
 * /api/v1/barcodes/public/scan/{barcodeValue}:
 *   get:
 *     summary: Public barcode scan
 *     description: |
 *       Scan a barcode without authentication. Returns HTML page with asset details.
 *       This endpoint is used when scanning QR codes publicly.
 *       Logs the scan for analytics purposes.
 *     tags: [Barcodes]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: barcodeValue
 *         required: true
 *         schema:
 *           type: string
 *         description: The barcode/QR code value
 *         example: IBTSO-JOHN-1234567890-ABC123
 *     responses:
 *       200:
 *         description: HTML page with asset details
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       404:
 *         description: Asset not found for this barcode
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */

/**
 * @swagger
 * /api/v1/barcodes/scan/{barcodeValue}:
 *   get:
 *     summary: Authenticated barcode scan
 *     description: Scan a barcode with authentication. Returns JSON with full asset details.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcodeValue
 *         required: true
 *         schema:
 *           type: string
 *         description: The barcode/QR code value
 *     responses:
 *       200:
 *         description: Asset details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *       404:
 *         description: Asset not found
 */

/**
 * @swagger
 * /api/v1/barcodes/download/{assetId}:
 *   get:
 *     summary: Download barcode image
 *     description: Download the QR code image for a specific asset.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: QR code image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Asset not found
 */

/**
 * @swagger
 * /api/v1/barcodes/download-qr/{assetId}:
 *   get:
 *     summary: Download single asset QR as PNG
 *     description: Download a single asset's QR code as a PNG image file.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: QR code PNG image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: attachment; filename="QR_AST-001_1234567890.png"
 *       404:
 *         description: Asset not found
 */

/**
 * @swagger
 * /api/v1/barcodes/download-multiple-qr:
 *   post:
 *     summary: Download multiple QR codes as PDF
 *     description: Download QR codes for multiple assets as a single PDF document.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assetIds
 *             properties:
 *               assetIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of asset IDs
 *                 example:
 *                   - "507f1f77bcf86cd799439011"
 *                   - "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: PDF document with QR codes
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: No asset IDs provided
 */

/**
 * @swagger
 * /api/v1/barcodes/regenerate/{assetId}:
 *   post:
 *     summary: Regenerate barcode for asset
 *     description: Generate a new QR code for an asset. Admin only. Old barcode becomes invalid.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Barcode regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Barcode regenerated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     barcodeValue:
 *                       type: string
 *                     barcodeImagePath:
 *                       type: string
 *                     barcodeImageUrl:
 *                       type: string
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Asset not found
 */

/**
 * @swagger
 * /api/v1/barcodes/dealer/{dealerId}/download-pdf:
 *   get:
 *     summary: Download all dealer barcodes as PDF
 *     description: Download all QR codes for a dealer's assets as a PDF document. Admin only.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dealer ID
 *     responses:
 *       200:
 *         description: PDF document with all dealer's QR codes
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Dealer not found
 */

/**
 * @swagger
 * /api/v1/barcodes/client/{clientId}/download-pdf:
 *   get:
 *     summary: Download all client barcodes as PDF
 *     description: Download all QR codes for assets associated with a client as a PDF document. Admin only.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: PDF document with all client's QR codes
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Client not found
 */

/**
 * @swagger
 * /api/v1/barcodes/dealer/{dealerId}/download-zip:
 *   get:
 *     summary: Download all dealer barcodes as ZIP
 *     description: Download all QR codes for a dealer's assets as individual PNG files in a ZIP archive. Admin only.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dealer ID
 *     responses:
 *       200:
 *         description: ZIP archive with QR code images
 *         content:
 *           application/zip:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Dealer not found
 */

/**
 * @swagger
 * /api/v1/barcodes/download-all-pdf:
 *   get:
 *     summary: Download all assets PDF
 *     description: Download a PDF report of all assets with optional date range filtering. Admin only.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: PDF report of all assets
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/v1/barcodes/reports/views/summary:
 *   get:
 *     summary: Get barcode view summary report
 *     description: Get aggregated summary of barcode/QR code scans with filtering options.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter
 *       - in: query
 *         name: dealerId
 *         schema:
 *           type: string
 *         description: Filter by dealer ID
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *     responses:
 *       200:
 *         description: Summary report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalScans:
 *                       type: integer
 *                       example: 5000
 *                     uniqueAssets:
 *                       type: integer
 *                       example: 200
 *                     scansByDay:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           count:
 *                             type: integer
 */

/**
 * @swagger
 * /api/v1/barcodes/reports/views/assets:
 *   get:
 *     summary: Get barcode view assets report
 *     description: Get detailed report of scans per asset with pagination and sorting.
 *     tags: [Barcodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [totalViews, lastViewedAt, firstViewedAt, assetNo]
 *           default: totalViews
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dealerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Assets report retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       asset:
 *                         $ref: '#/components/schemas/Asset'
 *                       totalViews:
 *                         type: integer
 *                       lastViewedAt:
 *                         type: string
 *                         format: date-time
 *                       firstViewedAt:
 *                         type: string
 *                         format: date-time
 */
