/**
 * @swagger
 * /api/v1/dashboard/admin:
 *   get:
 *     summary: Get admin dashboard
 *     description: Get comprehensive dashboard statistics for admin users. Admin only.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard data retrieved successfully
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
 *                     totalDealers:
 *                       type: integer
 *                       example: 50
 *                       description: Total number of dealers
 *                     activeDealers:
 *                       type: integer
 *                       example: 45
 *                       description: Number of active dealers
 *                     totalAssets:
 *                       type: integer
 *                       example: 500
 *                       description: Total number of assets
 *                     activeAssets:
 *                       type: integer
 *                       example: 480
 *                       description: Number of active assets
 *                     totalBrands:
 *                       type: integer
 *                       example: 20
 *                       description: Total number of brands
 *                     totalClients:
 *                       type: integer
 *                       example: 100
 *                       description: Total number of clients
 *                     totalScans:
 *                       type: integer
 *                       example: 5000
 *                       description: Total number of QR code scans
 *                     scansToday:
 *                       type: integer
 *                       example: 150
 *                       description: Number of scans today
 *                     scansThisWeek:
 *                       type: integer
 *                       example: 800
 *                       description: Number of scans this week
 *                     scansThisMonth:
 *                       type: integer
 *                       example: 2500
 *                       description: Number of scans this month
 *                     recentScans:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BarcodeScanLog'
 *                       description: Last 10 scan records
 *                     topScannedAssets:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           asset:
 *                             $ref: '#/components/schemas/Asset'
 *                           scanCount:
 *                             type: integer
 *                       description: Top 5 most scanned assets
 *                     assetsByStatus:
 *                       type: object
 *                       properties:
 *                         ACTIVE:
 *                           type: integer
 *                         INACTIVE:
 *                           type: integer
 *                         MAINTENANCE:
 *                           type: integer
 *                         DAMAGED:
 *                           type: integer
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/v1/dashboard/dealer:
 *   get:
 *     summary: Get dealer dashboard
 *     description: Get dashboard statistics for the authenticated dealer. Dealer role only.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dealer dashboard data retrieved successfully
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
 *                     totalAssets:
 *                       type: integer
 *                       example: 50
 *                       description: Total assets for this dealer
 *                     activeAssets:
 *                       type: integer
 *                       example: 45
 *                     totalScans:
 *                       type: integer
 *                       example: 500
 *                       description: Total scans on dealer's assets
 *                     scansToday:
 *                       type: integer
 *                       example: 15
 *                     scansThisWeek:
 *                       type: integer
 *                       example: 80
 *                     scansThisMonth:
 *                       type: integer
 *                       example: 250
 *                     assignedBrands:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Brand'
 *                       description: Brands assigned to this dealer
 *                     recentAssets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Asset'
 *                       description: Last 5 created assets
 *                     assetsByStatus:
 *                       type: object
 *                       properties:
 *                         ACTIVE:
 *                           type: integer
 *                         INACTIVE:
 *                           type: integer
 *                         MAINTENANCE:
 *                           type: integer
 *                         DAMAGED:
 *                           type: integer
 *       403:
 *         description: Dealer role required
 */

/**
 * @swagger
 * /api/v1/dashboard/client:
 *   get:
 *     summary: Get client dashboard
 *     description: Get dashboard statistics for the authenticated client. Client role only.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client dashboard data retrieved successfully
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
 *                     client:
 *                       $ref: '#/components/schemas/Client'
 *                     totalAssets:
 *                       type: integer
 *                       example: 100
 *                       description: Total assets from associated dealers
 *                     associatedDealers:
 *                       type: integer
 *                       example: 5
 *                       description: Number of associated dealers
 *                     totalScans:
 *                       type: integer
 *                       example: 1000
 *                     dealers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           dealer:
 *                             $ref: '#/components/schemas/Dealer'
 *                           assetCount:
 *                             type: integer
 *       403:
 *         description: Client role required
 */

/**
 * @swagger
 * /api/v1/dashboard/system-stats:
 *   get:
 *     summary: Get system statistics
 *     description: Get overall system health and statistics. Admin only.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
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
 *                     totalUsers:
 *                       type: integer
 *                       example: 200
 *                     totalDealers:
 *                       type: integer
 *                       example: 50
 *                     totalClients:
 *                       type: integer
 *                       example: 100
 *                     totalAssets:
 *                       type: integer
 *                       example: 500
 *                     totalBrands:
 *                       type: integer
 *                       example: 20
 *                     totalScans:
 *                       type: integer
 *                       example: 10000
 *                     databaseSize:
 *                       type: string
 *                       example: "256 MB"
 *                     serverUptime:
 *                       type: string
 *                       example: "5 days 12 hours"
 *       403:
 *         description: Admin access required
 */
