/**
 * @swagger
 * /api/v1/brands:
 *   get:
 *     summary: Get all brands
 *     description: Retrieve a list of all brands. Admin only.
 *     tags: [Brands]
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
 *         description: Search by brand name
 *     responses:
 *       200:
 *         description: List of brands retrieved successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Brand'
 *       403:
 *         description: Admin access required
 *
 *   post:
 *     summary: Create a new brand
 *     description: Create a new brand. Admin only.
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BrandInput'
 *           example:
 *             name: Samsung
 *     responses:
 *       201:
 *         description: Brand created successfully
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
 *                   example: Brand created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/v1/brands/{id}:
 *   get:
 *     summary: Get brand by ID
 *     description: Retrieve detailed brand information including assigned dealers. Admin only.
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Brand'
 *                     - type: object
 *                       properties:
 *                         assignedDealers:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               dealer:
 *                                 $ref: '#/components/schemas/Dealer'
 *                               assignedBy:
 *                                 $ref: '#/components/schemas/User'
 *                               assignedAt:
 *                                 type: string
 *                                 format: date-time
 *                         totalAssignedDealers:
 *                           type: integer
 *                           example: 5
 *       404:
 *         description: Brand not found
 *
 *   put:
 *     summary: Update brand
 *     description: Update brand information. Admin only.
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BrandInput'
 *     responses:
 *       200:
 *         description: Brand updated successfully
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
 *                   example: Brand updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Brand'
 *       404:
 *         description: Brand not found
 *
 *   delete:
 *     summary: Delete brand (soft delete)
 *     description: Soft delete a brand. Admin only.
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Brand deleted successfully
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /api/v1/brands/{brandId}/assign-dealers:
 *   post:
 *     summary: Assign brand to dealers
 *     description: Assign a brand to one or more dealers. Admin only.
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dealerIds
 *             properties:
 *               dealerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "507f1f77bcf86cd799439011"
 *                   - "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Brand assigned to dealers successfully
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
 *                   example: Brand assigned to 2 new dealer(s). 0 dealer(s) already assigned.
 *                 data:
 *                   type: object
 *                   properties:
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *                     assignedDealers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Dealer'
 *       400:
 *         description: Invalid dealer IDs
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /api/v1/brands/{brandId}/unassign-dealers:
 *   post:
 *     summary: Unassign brand from dealers
 *     description: Remove brand assignment from one or more dealers. Admin only.
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dealerIds
 *             properties:
 *               dealerIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Brand unassigned from dealers successfully
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /api/v1/brands/{brandId}/dealers:
 *   get:
 *     summary: Get dealers for a brand
 *     description: Get all dealers assigned to a specific brand. Admin only.
 *     tags: [Brands]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: brandId
 *         required: true
 *         schema:
 *           type: string
 *         description: Brand ID
 *     responses:
 *       200:
 *         description: Dealers retrieved successfully
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
 *                     brand:
 *                       $ref: '#/components/schemas/Brand'
 *                     dealers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Dealer'
 *                     totalDealers:
 *                       type: integer
 *       404:
 *         description: Brand not found
 */

/**
 * @swagger
 * /api/v1/brands/assignments/all:
 *   get:
 *     summary: Get all brand assignments
 *     description: Get all brand-dealer assignments with pagination and filtering. Admin only.
 *     tags: [Brands]
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
 *         name: brandId
 *         schema:
 *           type: string
 *         description: Filter by brand ID
 *       - in: query
 *         name: dealerId
 *         schema:
 *           type: string
 *         description: Filter by dealer ID
 *     responses:
 *       200:
 *         description: Brand assignments retrieved successfully
 */

/**
 * @swagger
 * /api/v1/brands/dealer/{dealerId}:
 *   get:
 *     summary: Get brands by dealer
 *     description: Get all brands assigned to a specific dealer. Admin only.
 *     tags: [Brands]
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
 *         description: Brands retrieved successfully
 *       404:
 *         description: Dealer not found
 */
