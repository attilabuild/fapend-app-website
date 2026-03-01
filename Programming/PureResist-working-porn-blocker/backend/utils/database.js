const mongoose = require('mongoose');

// MongoDB connection URI
const MONGODB_URI = 'mongodb+srv://feherati64:exFXqzKc6FCwcSQi@nofap.tt9zfwp.mongodb.net/?retryWrites=true&w=majority&appName=nofap';

// Initialize connection pool
let cachedConnection = null;

// Function to connect to MongoDB
const connectToDatabase = async () => {
  // If connection exists, return it
  if (cachedConnection) {
    console.log('Using existing MongoDB connection');
    return cachedConnection;
  }

  try {
    console.log('Connecting to MongoDB...');
    
    // Set mongoose options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Connect to MongoDB
    const connection = await mongoose.connect(MONGODB_URI, options);
    
    console.log('MongoDB connection successful!');
    
    // Cache the connection
    cachedConnection = connection;
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Generic function to close connection (for testing, etc.)
const closeConnection = async () => {
  if (mongoose.connection.readyState) {
    await mongoose.connection.close();
    cachedConnection = null;
    console.log('MongoDB connection closed');
  }
};

module.exports = {
  connectToDatabase,
  closeConnection
}; 