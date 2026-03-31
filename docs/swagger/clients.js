/**
 * @swagger
 * /api/v1/clients:
 *   get:
 *     summary: Get all clients
 *     description: Retrieve a paginated list of all clients. Admin only.
 *     tags: [Clients]
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
 *         description: Search by name, email, or company
 *     responses:
 *       200:
 *         description: List of clients retrieved successfully
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
 *                     $ref: '#/components/schemas/Client'
 *       403:
 *         description: Admin access required
 *
 *   post:
 *     summary: Create a new client
 *     description: Create a new client with optional dealer associations. Admin only. Creates associated user account with temporary password.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientInput'
 *           example:
 *             name: ABC Corporation
 *             email: client@abc.com
 *             phone: "+968 9876 5432"
 *             company: ABC Corp LLC
 *             address: 456 Business Ave, Muscat
 *             vatin: OM123456789
 *             placeOfSupply: Muscat
 *             country: Oman
 *             dealerIds:
 *               - "507f1f77bcf86cd799439011"
 *     responses:
 *       201:
 *         description: Client created successfully
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
 *                   example: Client created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     client:
 *                       $ref: '#/components/schemas/Client'
 *                     credentials:
 *                       type: object
 *                       properties:
 *                         email:
 *                           type: string
 *                         temporaryPassword:
 *                           type: string
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */

/**
 * @swagger
 * /api/v1/clients/profile:
 *   get:
 *     summary: Get client profile
 *     description: Get the authenticated client's own profile. Available to all authenticated users.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 */

/**
 * @swagger
 * /api/v1/clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     description: Retrieve detailed client information. Admin only.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 *
 *   put:
 *     summary: Update client
 *     description: Update client information. Admin only.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientInput'
 *     responses:
 *       200:
 *         description: Client updated successfully
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
 *                   example: Client updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Client'
 *       404:
 *         description: Client not found
 *
 *   delete:
 *     summary: Delete client (soft delete)
 *     description: Soft delete a client. Admin only.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 */

/**
 * @swagger
 * /api/v1/clients/{clientId}/assign-dealers:
 *   post:
 *     summary: Assign dealers to client
 *     description: Associate dealers with a client. Admin only.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
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
 *     responses:
 *       200:
 *         description: Dealers assigned to client successfully
 *       400:
 *         description: Invalid dealer IDs
 *       404:
 *         description: Client not found
 */

/**
 * @swagger
 * /api/v1/clients/{clientId}/remove-dealers:
 *   post:
 *     summary: Remove dealers from client
 *     description: Remove dealer associations from a client. Admin only.
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *         description: Client ID
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
 *         description: Dealers removed from client successfully
 *       404:
 *         description: Client not found
 */

/**
 * @swagger
 * /api/v1/clients/dealer/{dealerId}:
 *   get:
 *     summary: Get clients by dealer
 *     description: Get all clients associated with a specific dealer. Admin only.
 *     tags: [Clients]
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
 *         description: Clients retrieved successfully
 *       404:
 *         description: Dealer not found
 */

/**
 * @swagger
 * /api/v1/clients/me/profile:
 *   put:
 *     summary: Update client's own profile
 *     description: Update the authenticated client's profile. Client role only.
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               company:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       403:
 *         description: Client role required
 */

/**
 * @swagger
 * /api/v1/clients/me/change-password:
 *   put:
 *     summary: Change client password
 *     description: Change the authenticated client's password. Client role only.
 *     tags: [Client Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Current password is incorrect
 *       403:
 *         description: Client role required
 */

/**
 * @swagger
 * /api/v1/assets/client/me:
 *   get:
 *     summary: Get client's assets
 *     description: Get all assets associated with the authenticated client's dealers. Client role only.
 *     tags: [Client Portal]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by asset number or fixture number
 *     responses:
 *       200:
 *         description: Assets retrieved successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Asset'
 *       403:
 *         description: Client role required
 */
