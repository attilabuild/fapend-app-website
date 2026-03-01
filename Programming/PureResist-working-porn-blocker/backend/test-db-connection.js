const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI;

// Test MongoDB connection
async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log(`Connection string: ${MONGODB_URI.replace(/\/\/(.+?):(.+?)@/, '//***:***@')}`); // Hide credentials
  
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log(`Connection state: ${mongoose.connection.readyState}`);
    
    // Test that we can perform operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nConnection closed successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check if the MongoDB URI is correct');
    console.error('2. Ensure your IP address is whitelisted in MongoDB Atlas');
    console.error('3. Check if your MongoDB Atlas cluster is running');
    console.error('4. Verify your network connection and firewall settings');
    
    if (error.message.includes('authentication failed')) {
      console.error('\nAuthentication Error: Username or password may be incorrect');
    }
    
    if (error.message.includes('timed out')) {
      console.error('\nTimeout Error: Check network connectivity and MongoDB Atlas status');
    }
  } finally {
    process.exit();
  }
}

testConnection(); 