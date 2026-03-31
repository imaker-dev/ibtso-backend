/**
 * @swagger
 * /api/v1/dealers:
 *   get:
 *     summary: Get all dealers
 *     description: Retrieve a paginated list of all dealers. Admin sees all, Dealer sees only self.
 *     tags: [Dealers]
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
 *         description: Search by name, email, shopName, or dealerCode
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: List of dealers retrieved successfully
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
 *                     allOf:
 *                       - $ref: '#/components/schemas/Dealer'
 *                       - type: object
 *                         properties:
 *                           brandCount:
 *                             type: integer
 *                             example: 5
 *                             description: Number of brands assigned to dealer
 *       401:
 *         description: Not authenticated
 *
 *   post:
 *     summary: Create a new dealer
 *     description: Create a new dealer with optional brand assignments. Admin only. Creates associated user account with temporary password.
 *     tags: [Dealers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerInput'
 *           examples:
 *             withBrands:
 *               summary: Create dealer with brands
 *               value:
 *                 name: John Electronics
 *                 email: john@electronics.com
 *                 phone: "+968 1234 5678"
 *                 shopName: Electronics Hub
 *                 vatRegistration: VAT123456
 *                 location:
 *                   address: 123 Main St, Muscat
 *                   latitude: 23.5880
 *                   longitude: 58.3829
 *                 brandIds:
 *                   - "507f1f77bcf86cd799439011"
 *                   - "507f1f77bcf86cd799439012"
 *             withoutBrands:
 *               summary: Create dealer without brands
 *               value:
 *                 name: Simple Dealer
 *                 shopName: Simple Shop
 *     responses:
 *       201:
 *         description: Dealer created successfully
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
 *                   example: Dealer created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     dealer:
 *                       $ref: '#/components/schemas/Dealer'
 *                     assignedBrands:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Brand'
 *                     totalAssignedBrands:
 *                       type: integer
 *                       example: 2
 *                     credentials:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                           example: john@electronics.com
 *                         temporaryPassword:
 *                           type: string
 *                           example: Temp@1234
 *                         message:
 *                           type: string
 *       400:
 *         description: Invalid brand IDs or validation error
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/v1/dealers/{id}:
 *   get:
 *     summary: Get dealer by ID
 *     description: Retrieve detailed dealer information including assets and assigned brands.
 *     tags: [Dealers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dealer ID
 *     responses:
 *       200:
 *         description: Dealer details retrieved successfully
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
 *                     dealer:
 *                       $ref: '#/components/schemas/Dealer'
 *                     assetCount:
 *                       type: integer
 *                       example: 25
 *                     assets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Asset'
 *                     assignedBrands:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           brand:
 *                             $ref: '#/components/schemas/Brand'
 *                           assignedBy:
 *                             $ref: '#/components/schemas/User'
 *                           assignedAt:
 *                             type: string
 *                             format: date-time
 *                     totalAssignedBrands:
 *                       type: integer
 *                       example: 3
 *       404:
 *         description: Dealer not found
 *
 *   put:
 *     summary: Update dealer
 *     description: Update dealer information and optionally update brand assignments. Admin only. When brandIds is provided, it replaces all existing assignments.
 *     tags: [Dealers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dealer ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DealerInput'
 *           examples:
 *             updateInfo:
 *               summary: Update dealer info only
 *               value:
 *                 shopName: Updated Shop Name
 *                 phone: "+968 9999 8888"
 *             updateBrands:
 *               summary: Replace brand assignments
 *               value:
 *                 brandIds:
 *                   - "507f1f77bcf86cd799439011"
 *             removeBrands:
 *               summary: Remove all brands
 *               value:
 *                 brandIds: []
 *     responses:
 *       200:
 *         description: Dealer updated successfully
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
 *                   example: Dealer updated successfully
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Dealer'
 *                     - type: object
 *                       properties:
 *                         assignedBrands:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Brand'
 *                         totalAssignedBrands:
 *                           type: integer
 *       400:
 *         description: Invalid brand IDs
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Dealer not found
 *
 *   delete:
 *     summary: Delete dealer (soft delete)
 *     description: Soft delete a dealer. Admin only. Sets isDeleted flag to true.
 *     tags: [Dealers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dealer ID
 *     responses:
 *       200:
 *         description: Dealer deleted successfully
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
 *                   example: Dealer deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Dealer not found
 */

/**
 * @swagger
 * /api/v1/dealers/{id}/toggle-status:
 *   patch:
 *     summary: Toggle dealer active status
 *     description: Enable or disable a dealer account. Admin only.
 *     tags: [Dealers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dealer ID
 *     responses:
 *       200:
 *         description: Dealer status toggled successfully
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
 *                   example: Dealer activated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Dealer'
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Dealer not found
 */

/**
 * @swagger
 * /api/v1/dealers/{id}/reset-password:
 *   post:
 *     summary: Reset dealer password
 *     description: Reset a dealer's password to a new temporary password. Admin only.
 *     tags: [Dealers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dealer ID
 *     responses:
 *       200:
 *         description: Password reset successfully
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
 *                   example: Password reset successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     temporaryPassword:
 *                       type: string
 *                       example: Temp@5678
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Dealer not found
 */

/**
 * @swagger
 * /api/v1/dealers/stats/{id}:
 *   get:
 *     summary: Get dealer statistics
 *     description: Get detailed statistics for a specific dealer including asset counts and scan data.
 *     tags: [Dealers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Dealer ID
 *     responses:
 *       200:
 *         description: Dealer statistics retrieved successfully
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
 *                     totalAssets:
 *                       type: integer
 *                       example: 50
 *                     activeAssets:
 *                       type: integer
 *                       example: 45
 *                     totalScans:
 *                       type: integer
 *                       example: 500
 *       404:
 *         description: Dealer not found
 */

/**
 * @swagger
 * /api/v1/dealers/my-stats:
 *   get:
 *     summary: Get current dealer's statistics
 *     description: Get statistics for the authenticated dealer. Dealer role only.
 *     tags: [Dealers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dealer statistics retrieved successfully
 *       403:
 *         description: Dealer role required
 */
