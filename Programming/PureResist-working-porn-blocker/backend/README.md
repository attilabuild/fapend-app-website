# NoFap App Backend

This is the backend API for the NoFap App, built with Node.js, Express, and MongoDB.

## Features

- User management (registration, login, profile)
- Check-in tracking
- User statistics
- Settings management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB account or local MongoDB installation

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   NODE_ENV=development
   ```
5. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### User Routes

- `GET /api/users/:id` - Get user by ID
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/:id/settings` - Get user settings
- `PUT /api/users/:id/settings` - Update user settings

### Check-in Routes

- `GET /api/checkins/user/:userId` - Get all check-ins for a user
- `POST /api/checkins` - Create a new check-in
- `GET /api/checkins/stats/:userId` - Get statistics for a user

## Models

### User

- username (String, required)
- email (String, required)
- password (String, required)
- streak (Number)
- longestStreak (Number)
- lastCheckIn (Date)
- createdAt (Date)
- settings (Object)
  - notifications (Object)
    - enabled (Boolean)
    - time (String)
  - theme (String)
  - goalDays (Number)

### Check-in

- userId (ObjectId, ref: 'User')
- date (Date)
- mood (String)
- urgeLevel (Number)
- succeeded (Boolean)
- notes (String)
- triggers (Array)
- activities (Array)
- dayNumber (Number)

## Development

For development, use:

```
npm run dev
```

This will start the server with nodemon, which will automatically restart the server when changes are detected.

## Troubleshooting

### MongoDB Connection Issues

If you're experiencing MongoDB connection timeouts or errors:

1. **Test your database connection**:
   ```
   npm run test-db
   ```
   This will test your MongoDB connection and provide troubleshooting tips.

2. **Check your MongoDB URI**:
   - Verify the connection string in the `.env` file
   - Make sure the username and password are correct
   - Ensure the cluster name and database name are correct

3. **Network and Firewall Issues**:
   - Make sure your IP address is whitelisted in MongoDB Atlas
   - Check your firewall settings to allow outgoing connections to MongoDB ports
   - If using a VPN, try connecting without it

4. **MongoDB Atlas Specific**:
   - Verify your MongoDB Atlas cluster is active
   - Check if you've reached free tier connection limits
   - Ensure your MongoDB Atlas account is in good standing

5. **Connection Timeout Adjustments**:
   - Connection timeouts are set to 30 seconds in `db/conn.js`
   - You can increase these values if needed for slow connections

### Resolving DNS Issues with MongoDB Connection

If you're seeing the error `querySrv ENOTFOUND _mongodb._tcp.[your-cluster].mongodb.net`, this is a DNS resolution issue when connecting to MongoDB Atlas. To fix it:

1. **Try Direct Connection Instead of SRV**:
   Edit your `.env` file and change from SRV format to direct connection:
   
   ```
   # From
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/...
   
   # To
   MONGODB_URI=mongodb://username:password@cluster.mongodb.net:27017/...
   ```

2. **Use Local MongoDB for Development**:
   If you can't connect to MongoDB Atlas, you can use a local MongoDB instance:
   
   ```bash
   # Install MongoDB locally first, then:
   npm run setup-local
   ```
   
   This will:
   - Set up a local MongoDB database
   - Create necessary collections
   - Add a test user
   - Update your .env file to use the local database

3. **Check DNS Settings**:
   - If you're on a corporate network, check if there are DNS restrictions
   - Try using a different DNS server
   - Check if your ISP is blocking MongoDB Atlas domains

4. **IP Whitelisting**:
   - Make sure your IP address is whitelisted in MongoDB Atlas
   - In MongoDB Atlas, go to Network Access and add your current IP

### API Server Issues

If your API server isn't starting properly:

1. **Check the server logs**:
   - Look for error messages during server startup
   - Verify if MongoDB connection is successful

2. **Port Conflicts**:
   - Make sure port 3000 (or your configured port) isn't being used by another application
   - Change the PORT in `.env` if needed

3. **Run with Debug Logging**:
   ```
   NODE_DEBUG=* npm run dev
   ```
   This will show detailed debugging information. 