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

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
