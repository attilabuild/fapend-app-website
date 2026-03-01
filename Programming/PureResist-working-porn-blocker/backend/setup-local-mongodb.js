/**
 * Local MongoDB Setup Script
 * 
 * This script helps you set up a local MongoDB instance for development
 * when you're having trouble connecting to MongoDB Atlas.
 * 
 * Prerequisites:
 * 1. MongoDB installed locally
 * 2. MongoDB running on default port 27017
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Local MongoDB connection string
const LOCAL_URI = 'mongodb://localhost:27017/nofap';

async function setupLocalMongoDB() {
  console.log('Setting up local MongoDB for development...');
  
  try {
    // Connect to MongoDB
    console.log('Connecting to local MongoDB...');
    const client = new MongoClient(LOCAL_URI);
    await client.connect();
    console.log('Connected successfully to local MongoDB');
    
    // Get reference to database
    const db = client.db('nofap');
    
    // Create collections
    console.log('Creating collections...');
    await db.createCollection('users');
    await db.createCollection('checkins');
    
    // Create a test user
    console.log('Creating test user...');
    const usersCollection = db.collection('users');
    
    // Check if test user already exists
    const existingUser = await usersCollection.findOne({ username: 'testuser' });
    
    if (!existingUser) {
      await usersCollection.insertOne({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        streak: 0,
        longestStreak: 0,
        lastCheckIn: null,
        createdAt: new Date(),
        settings: {
          notifications: {
            enabled: true,
            time: '19:00'
          },
          theme: 'system',
          goalDays: 90
        }
      });
      console.log('Test user created successfully');
    } else {
      console.log('Test user already exists');
    }
    
    // Update .env file
    console.log('Updating .env file to use local MongoDB...');
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      console.log('No .env file found, creating a new one');
      envContent = 'PORT=3000\nNODE_ENV=development\n';
    }
    
    // Update or add local MongoDB URI
    if (envContent.includes('MONGODB_URI=')) {
      // Comment out existing MongoDB URIs
      envContent = envContent.replace(/^MONGODB_URI=.*$/gm, '# $&');
      
      // Add local MongoDB URI if not present
      if (!envContent.includes('MONGODB_URI=mongodb://localhost:27017/nofap')) {
        envContent += '\n# Local MongoDB for development\nMONGODB_URI=mongodb://localhost:27017/nofap\n'.replace('MONGODB_URI', 'MONGODB_URI');
        envContent = envContent.replace('MONGOD', 'MONGODB_');
      } else {
        // Uncomment local MongoDB URI
        envContent = envContent.replace(/^# (MONGODB_URI=mongodb:\/\/localhost:27017\/nofap)$/gm, '$1');
      }
    } else {
      // Add local MongoDB URI
      envContent += '\n# Local MongoDB for development\nMONGODB_URI=mongodb://localhost:27017/nofap\n'.replace('MONGODB_URI', 'MONGODB_URI');
      envContent = envContent.replace('MONGOD', 'MONGODB_');
    }
    
    // Write updated .env file
    fs.writeFileSync(envPath, envContent);
    console.log('.env file updated successfully');
    
    console.log('\nLocal MongoDB setup complete!');
    console.log('You can now start the server with:');
    console.log('npm run dev');
    
    await client.close();
    
  } catch (error) {
    console.error('Error setting up local MongoDB:', error.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Make sure MongoDB is installed on your system');
    console.error('2. Ensure MongoDB service is running');
    console.error('3. Check if port 27017 is available and not blocked by firewall');
    process.exit(1);
  }
}

setupLocalMongoDB(); 