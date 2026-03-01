const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectToDatabase, mongoose } = require('./db/conn');

// Import route files
const userRoutes = require('./routes/userRoutes');
const checkInRoutes = require('./routes/checkInRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const journalRoutes = require('./routes/journalRoutes');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'NoFap App API is running',
    databaseStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Use route files
app.use('/api/users', userRoutes);
app.use('/api/checkins', checkInRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chats', chatRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB and start server
(async () => {
  try {
    // Attempt to connect to MongoDB with retry logic
    let connected = false;
    let retries = 3;
    
    while (!connected && retries > 0) {
      console.log(`Connecting to MongoDB (attempts remaining: ${retries})...`);
      connected = await connectToDatabase();
      
      if (!connected) {
        retries--;
        if (retries > 0) {
          console.log(`Connection failed. Retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds before retry
        }
      }
    }
    
    if (!connected) {
      throw new Error('Failed to connect to MongoDB after multiple attempts');
    }
    
    // Start server only after successful connection
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Server accessible at http://192.168.181.118:${PORT}`);
      console.log(`MongoDB connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})(); 