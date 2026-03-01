# NoFap App with MongoDB Integration

This app is set up to use MongoDB for data storage through a backend API server. Follow these instructions to get it running.

## Starting the Backend Server

### Method 1: Using the start script (Windows)
1. Double-click the `start-backend.bat` file in the project root
2. Wait for the dependencies to install and the server to start
3. You should see a message like "Server running on port 3000"

### Method 2: Manual start
1. Open a terminal/command prompt
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. You should see a message like "Server running on port 3000" and "Connected to MongoDB"

## Starting the React Native App

1. Open a new terminal window (keep the backend server running)
2. In the project root directory, run:
   ```
   npm start
   ```
3. Follow the Expo instructions to open the app in your preferred environment

## Troubleshooting

### MongoDB Connection Issues
- Make sure the MongoDB URI in `backend/.env` is correct
- Check if your MongoDB Atlas cluster is accessible from your IP address
- Verify network connectivity

### API Connection Issues
- If using an emulator, make sure the API_URL in `services/api.ts` is set correctly:
  - For Android emulator: `http://10.0.2.2:3000/api`
  - For iOS simulator: `http://localhost:3000/api`
  - For physical devices: Use your computer's IP address, e.g., `http://192.168.1.100:3000/api`

### Fallback Behavior
- If the backend server is unreachable, the app will automatically fall back to using AsyncStorage
- This ensures offline functionality even when the MongoDB server is not available 

cd backend
node server.js 