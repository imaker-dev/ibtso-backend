const swaggerJsdoc = require('swagger-jsdoc');

// Determine server URL based on environment
const isProduction = process.env.NODE_ENV === 'production';
const productionUrl = 'https://api.ibtso.com';
const developmentUrl = process.env.APP_URL || 'http://localhost:5000';
const currentServerUrl = isProduction ? productionUrl : developmentUrl;
const currentServerDescription = isProduction ? 'Production Server' : 'Development Server';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IBTSO Asset Tracking API',
      version: '1.0.0',
      description: `
## Overview
IBTSO Asset Tracking Platform - A comprehensive solution for managing assets, dealers, brands, and QR code tracking.

## Authentication
All protected endpoints require a JWT Bearer token in the Authorization header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Roles
- **ADMIN**: Full system access - manage dealers, brands, clients, assets, and view all analytics
- **DEALER**: Access to own assets, profile management, and assigned brands
- **CLIENT**: View assets from associated dealers, scan history, and profile management

## Base URL
\`${currentServerUrl}/api/v1\`
      `,
      contact: {
        name: 'IBTSO Support',
      },
      license: {
        name: 'ISC',
      },
    },
    servers: [
      {
        url: currentServerUrl,
        description: currentServerDescription,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        // Common Response Schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            currentPage: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 10 },
            totalItems: { type: 'integer', example: 100 },
            itemsPerPage: { type: 'integer', example: 10 },
          },
        },

        // User Schema
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['ADMIN', 'DEALER', 'CLIENT'], example: 'DEALER' },
            isActive: { type: 'boolean', example: true },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Dealer Schema
        Dealer: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            dealerCode: { type: 'string', example: 'JOHN-ABC123XYZ' },
            name: { type: 'string', example: 'John Electronics' },
            email: { type: 'string', format: 'email', example: 'dealer@example.com' },
            phone: { type: 'string', example: '+968 1234 5678' },
            shopName: { type: 'string', example: 'Electronics Hub' },
            vatRegistration: { type: 'string', example: 'VAT123456' },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string', example: '123 Main St, Muscat' },
                latitude: { type: 'number', example: 23.5880 },
                longitude: { type: 'number', example: 58.3829 },
                googleMapLink: { type: 'string', example: 'https://maps.google.com/?q=23.5880,58.3829' },
              },
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        DealerInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'John Electronics' },
            email: { type: 'string', format: 'email', example: 'dealer@example.com' },
            phone: { type: 'string', example: '+968 1234 5678' },
            shopName: { type: 'string', example: 'Electronics Hub' },
            vatRegistration: { type: 'string', example: 'VAT123456' },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string', example: '123 Main St, Muscat' },
                latitude: { type: 'number', example: 23.5880 },
                longitude: { type: 'number', example: 58.3829 },
              },
            },
            brandIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['507f1f77bcf86cd799439011'],
              description: 'Array of brand IDs to assign to dealer',
            },
          },
        },

        // Brand Schema
        Brand: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Samsung' },
            isActive: { type: 'boolean', example: true },
            createdBy: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        BrandInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Samsung' },
          },
        },

        // Client Schema
        Client: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'ABC Corporation' },
            email: { type: 'string', format: 'email', example: 'client@example.com' },
            phone: { type: 'string', example: '+968 9876 5432' },
            company: { type: 'string', example: 'ABC Corp LLC' },
            address: { type: 'string', example: '456 Business Ave, Muscat' },
            vatin: { type: 'string', example: 'OM123456789' },
            placeOfSupply: { type: 'string', example: 'Muscat' },
            country: { type: 'string', example: 'Oman' },
            dealerIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['507f1f77bcf86cd799439011'],
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ClientInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'ABC Corporation' },
            email: { type: 'string', format: 'email', example: 'client@example.com' },
            phone: { type: 'string', example: '+968 9876 5432' },
            company: { type: 'string', example: 'ABC Corp LLC' },
            address: { type: 'string', example: '456 Business Ave, Muscat' },
            vatin: { type: 'string', example: 'OM123456789' },
            placeOfSupply: { type: 'string', example: 'Muscat' },
            country: { type: 'string', example: 'Oman' },
            dealerIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['507f1f77bcf86cd799439011'],
            },
          },
        },

        // Asset Schema
        Asset: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            fixtureNo: { type: 'string', example: 'FIX-001' },
            assetNo: { type: 'string', example: 'AST-2024-001' },
            dimension: {
              type: 'object',
              properties: {
                length: { type: 'number', example: 100 },
                height: { type: 'number', example: 50 },
                depth: { type: 'number', example: 30 },
                unit: { type: 'string', enum: ['cm', 'inch', 'mm', 'm'], example: 'cm' },
              },
            },
            standType: { type: 'string', example: 'Floor Stand' },
            brandId: { $ref: '#/components/schemas/Brand' },
            dealerId: { $ref: '#/components/schemas/Dealer' },
            clientId: { $ref: '#/components/schemas/Client' },
            images: {
              type: 'array',
              items: { type: 'string' },
              example: ['uploads/assets/image1.jpg'],
            },
            imageUrls: {
              type: 'array',
              items: { type: 'string' },
              example: ['http://localhost:5000/uploads/assets/image1.jpg'],
            },
            installationDate: { type: 'string', format: 'date', example: '2024-01-15' },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string', example: '123 Main St, Muscat' },
                latitude: { type: 'number', example: 23.5880 },
                longitude: { type: 'number', example: 58.3829 },
                googleMapLink: { type: 'string' },
              },
            },
            barcodeValue: { type: 'string', example: 'IBTSO-JOHN-1234567890-ABC123' },
            barcodeImagePath: { type: 'string', example: 'uploads/barcodes/qr-123.png' },
            barcodeImageUrl: { type: 'string', example: 'http://localhost:5000/uploads/barcodes/qr-123.png' },
            status: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DAMAGED'], example: 'ACTIVE' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },

        // Barcode Scan Log Schema
        BarcodeScanLog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            assetId: { type: 'string' },
            scannedAt: { type: 'string', format: 'date-time' },
            ipAddress: { type: 'string', example: '192.168.1.1' },
            userAgent: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
          },
        },

        // Login Request/Response
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@ibtso.com' },
            password: { type: 'string', format: 'password', example: 'Admin@123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            data: { $ref: '#/components/schemas/User' },
          },
        },

        // Change Password Request
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', format: 'password', example: 'OldPass@123' },
            newPassword: { type: 'string', format: 'password', example: 'NewPass@456' },
          },
        },

        // Dashboard Stats
        AdminDashboard: {
          type: 'object',
          properties: {
            totalDealers: { type: 'integer', example: 50 },
            activeDealers: { type: 'integer', example: 45 },
            totalAssets: { type: 'integer', example: 500 },
            totalBrands: { type: 'integer', example: 20 },
            totalClients: { type: 'integer', example: 100 },
            totalScans: { type: 'integer', example: 5000 },
            recentScans: {
              type: 'array',
              items: { $ref: '#/components/schemas/BarcodeScanLog' },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Health', description: 'API health check' },
      { name: 'Authentication', description: 'User authentication and profile management' },
      { name: 'Dealers', description: 'Dealer management (Admin only for create/update/delete)' },
      { name: 'Brands', description: 'Brand management (Admin only)' },
      { name: 'Clients', description: 'Client management (Admin only)' },
      { name: 'Assets', description: 'Asset management with QR codes' },
      { name: 'Barcodes', description: 'QR code scanning, download, and analytics' },
      { name: 'Dashboard', description: 'Analytics dashboards for different roles' },
      { name: 'Client Portal', description: 'Client self-service endpoints' },
    ],
  },
  apis: ['./docs/swagger/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
