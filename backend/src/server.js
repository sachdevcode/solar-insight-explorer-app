const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const resultsRoutes = require('./routes/resultsRoutes');
const solarPotentialRoutes = require('./routes/solarPotentialRoutes');
const solarProductionRoutes = require('./routes/solarProductionRoutes');
const srecIncentivesRoutes = require('./routes/srecIncentivesRoutes');
const environmentalRoutes = require('./routes/environmentalRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Apply rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // HTTP request logger
app.use('/api', limiter); // Apply rate limiting to API endpoints

// Static folder for uploaded files (if needed)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/solar-potential', solarPotentialRoutes);
app.use('/api/solar-production', solarProductionRoutes);
app.use('/api/srec-incentives', srecIncentivesRoutes);
app.use('/api/environmental-impact', environmentalRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Solar Insight Explorer API is running!');
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Don't exit the process in development but log the error
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

module.exports = app; // Export for testing 