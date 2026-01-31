const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { createDefaultAdmin } = require('./utils/seedAdmin');

dotenv.config();

const app = express();

connectDB();

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Type', 'Content-Length', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400
};

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Vary', 'Origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'IBTSO Asset Tracking API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/dealers', require('./routes/dealerRoutes'));
app.use('/api/v1/assets', require('./routes/assetRoutes'));
app.use('/api/v1/barcodes', require('./routes/barcodeRoutes'));
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  
  await createDefaultAdmin();
});

process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});
