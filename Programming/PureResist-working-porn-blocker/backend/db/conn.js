const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

// Format error message for better readability
const formatError = (err) => {
  if (err.message.includes('querySrv ENOTFOUND')) {
    return `DNS resolution failed for MongoDB SRV record. 
    Try using a direct connection string without SRV (mongodb:// instead of mongodb+srv://)`;
  }
  return err.message;
};

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log(`Connection string format: ${MONGODB_URI.includes('mongodb+srv') ? 'SRV' : 'Direct'}`);
    
    // Remove the options that are causing issues with newer MongoDB versions
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4 // Force IPv4
    };
    
    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    // Log successful connection
    console.log('Connected to MongoDB successfully');
    
    // Add event listeners for connection issues
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', formatError(err));
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });
    
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', formatError(error));
    
    // Try alternate connection method if SRV lookup failed
    if (error.message.includes('querySrv ENOTFOUND') && MONGODB_URI.startsWith('mongodb+srv')) {
      console.log('Attempting direct connection instead of SRV...');
      try {
        // Convert srv URL to direct connection
        const directUri = MONGODB_URI.replace('mongodb+srv://', 'mongodb://');
        
        // Add specific host and port if needed
        const connectionOptions = {
          serverSelectionTimeoutMS: 30000,
          connectTimeoutMS: 30000,
          socketTimeoutMS: 45000,
          family: 4
        };
        
        await mongoose.connect(directUri, connectionOptions);
        console.log('Connected to MongoDB successfully using direct connection');
        return true;
      } catch (directError) {
        console.error('Direct connection also failed:', formatError(directError));
      }
    }
    
    return false;
  }
}

module.exports = {
  connectToDatabase,
  mongoose
}; 