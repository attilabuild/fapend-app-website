# MongoDB Backend Setup Guide

## Follow this step-by-step process to get your MongoDB backend running:

### Step 1: Install Dependencies

First, we need to install the required dependencies for the Node.js backend server:

1. Open a command prompt/terminal window
2. Navigate to your project directory
3. Run the following commands:

```
cd backend
npm install express mongoose@6.12.0 cors body-parser dotenv
```

### Step 2: Start the Backend Server

Now that dependencies are installed, start the backend server:

1. Make sure you're still in the backend directory
2. Run the server:

```
node server.js
```

You should see output like:
```
Server running on port 3000
Connecting to MongoDB...
MongoDB connection successful!
```

### Step 3: Run Your React Native App

1. Open a new terminal window (don't close the one running the backend server)
2. Navigate to your project directory
3. Start the React Native app:

```
npm start
```

4. Open the app on your device or emulator

### Alternative Ways to Start the Backend

If you're having issues with the steps above, try one of these alternative methods:

#### Method 1: Using the start-backend.bat file
Simply double-click the `start-backend.bat` file in your project directory.

#### Method 2: Using Node.js script
Run the following command from your project directory:
```
node start-mongodb-backend.js
```

#### Method 3: Using the install helper
If dependencies aren't installing properly:
```
cd backend
node install-deps.js
node server.js
```

## Troubleshooting

### MongoDB Connection Issues

1. **Check Internet Connection**: Make sure your device has internet access

2. **Check MongoDB Atlas**: Verify your MongoDB Atlas cluster is:
   - Running
   - Accessible from your IP address (check Network Access in Atlas)
   - Using the correct username/password

3. **Verify .env File**: Make sure `backend/.env` contains:
   ```
   MONGODB_URI=mongodb+srv://feherati64:GfQi4TGJNtX9%40dA@nofap.tt9zfwp.mongodb.net/?retryWrites=true&w=majority&appName=nofap
   PORT=3000
   ```

4. **IP Address Configuration**: Ensure `services/api.ts` and `utils/testMongoConnection.ts` use your correct IP address:
   ```javascript
   const API_URL = 'http://192.168.176.196:3000/api'; // Replace with your actual IP
   ```

5. **Firewall Check**: Make sure your firewall isn't blocking connections to MongoDB or port 3000

### Still Having Issues?

If you're still encountering problems, the app will automatically fall back to using AsyncStorage. Your data will be stored locally on the device instead of in the cloud. 