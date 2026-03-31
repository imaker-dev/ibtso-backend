/**
 * @swagger
 * /api/v1/assets:
 *   get:
 *     summary: Get all assets
 *     description: Retrieve a paginated list of assets. Admin sees all, Dealer sees own assets only.
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by asset number, fixture number, or barcode value
 *       - in: query
 *         name: dealerId
 *         schema:
 *           type: string
 *         description: Filter by dealer ID (Admin only)
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         description: Filter by brand ID
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *         description: Filter by client ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, MAINTENANCE, DAMAGED]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of assets retrieved successfully
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
 *                   example: 10
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMeta'
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asset'
 *
 *   post:
 *     summary: Create a new asset
 *     description: Create a new asset with QR code generation. Supports image uploads via multipart/form-data.
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fixtureNo
 *               - assetNo
 *               - standType
 *               - brandId
 *               - dealerId
 *               - installationDate
 *             properties:
 *               fixtureNo:
 *                 type: string
 *                 description: Fixture number
 *                 example: FIX-001
 *               assetNo:
 *                 type: string
 *                 description: Unique asset number
 *                 example: AST-2024-001
 *               dimension:
 *                 type: string
 *                 description: JSON string of dimension object
 *                 example: '{"length": 100, "height": 50, "depth": 30, "unit": "cm"}'
 *               standType:
 *                 type: string
 *                 description: Type of stand
 *                 example: Floor Stand
 *               brandId:
 *                 type: string
 *                 description: Brand ID
 *               dealerId:
 *                 type: string
 *                 description: Dealer ID
 *               clientId:
 *                 type: string
 *                 description: Client ID (optional)
 *               installationDate:
 *                 type: string
 *                 format: date
 *                 description: Installation date
 *                 example: "2024-01-15"
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Asset images (max 10 files, 5MB each)
 *     responses:
 *       201:
 *         description: Asset created successfully with QR code
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
 *                   example: Asset created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *       400:
 *         description: Validation error or duplicate asset number
 *       404:
 *         description: Dealer, brand, or client not found
 */

/**
 * @swagger
 * /api/v1/assets/{id}:
 *   get:
 *     summary: Get asset by ID
 *     description: Retrieve detailed asset information including QR code.
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
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
 *
 *   put:
 *     summary: Update asset
 *     description: |
 *       Update asset information and manage images.
 *       
 *       **Image Management:**
 *       - **Add images**: Upload new images without `existingImages` field (appends to existing)
 *       - **Remove specific images**: Provide `existingImages` array with paths to keep
 *       - **Replace all images**: Set `existingImages` to empty array `[]` and upload new images
 *       - **Remove + Add**: Provide `existingImages` with paths to keep and upload new images
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               fixtureNo:
 *                 type: string
 *               assetNo:
 *                 type: string
 *               dimension:
 *                 type: string
 *                 description: JSON string of dimension object
 *               standType:
 *                 type: string
 *               brandId:
 *                 type: string
 *               clientId:
 *                 type: string
 *                 description: Set to empty string to remove client
 *               installationDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE, DAMAGED]
 *               existingImages:
 *                 type: string
 *                 description: |
 *                   JSON array of image paths to keep. 
 *                   - Not provided: Keep all existing images (append mode)
 *                   - Empty array []: Remove all existing images
 *                   - Array with paths: Keep only specified images
 *                 example: '["uploads/assets/image1.jpg", "uploads/assets/image2.jpg"]'
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: New images to add
 *     responses:
 *       200:
 *         description: Asset updated successfully
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
 *                   example: Asset updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Asset'
 *       400:
 *         description: Invalid image paths or validation error
 *       404:
 *         description: Asset not found
 *
 *   delete:
 *     summary: Delete asset (soft delete)
 *     description: Soft delete an asset. Admin only.
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     responses:
 *       200:
 *         description: Asset deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Asset not found
 */

/**
 * @swagger
 * /api/v1/assets/{id}/status:
 *   patch:
 *     summary: Update asset status
 *     description: Update only the status of an asset.
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Asset ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, MAINTENANCE, DAMAGED]
 *                 example: MAINTENANCE
 *     responses:
 *       200:
 *         description: Asset status updated successfully
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Asset not found
 */

/**
 * @swagger
 * /api/v1/assets/dealer/{dealerId}:
 *   get:
 *     summary: Get assets by dealer
 *     description: Get all assets for a specific dealer.
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dealerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dealer ID
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
 *     responses:
 *       200:
 *         description: Assets retrieved successfully
 *       404:
 *         description: Dealer not found
 */

/**
 * @swagger
 * /api/v1/assets/brands:
 *   get:
 *     summary: Get asset brands
 *     description: Get list of brands that have assets. Useful for filtering.
 *     tags: [Assets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 */
