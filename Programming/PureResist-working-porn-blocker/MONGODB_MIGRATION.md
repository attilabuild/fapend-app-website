# Migration from AsyncStorage to MongoDB

This guide explains how the application has been migrated from using AsyncStorage (local storage) to using MongoDB as the backend database.

## Architecture Changes

1. **Backend Server**: A Node.js/Express server has been set up in the `backend/` directory that connects to MongoDB and provides RESTful API endpoints.

2. **API Service**: The client-side API service (`services/api.ts`) has been updated to make HTTP requests to the backend server instead of reading/writing to AsyncStorage.

3. **Store Hooks**: The data management hooks (`hooks/useStore.ts`) have been updated to interact with the backend API instead of AsyncStorage.

4. **UI Components**: Error handling and loading states have been improved to account for network connectivity requirements.

## Running the Application

### Backend (MongoDB)

1. First, install the dependencies for the backend:
   ```
   cd backend
   npm install
   ```

2. Make sure your MongoDB connection string is properly set in `backend/.env`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   ```

3. Start the backend server:
   ```
   npm run dev
   ```

### Full Application (Frontend + Backend)

We've added convenience scripts to start both frontend and backend:

```
npm run dev
```

This command will start both the backend server and the Expo development server.

## API Endpoints

The backend exposes the following endpoints:

### User Management
- `GET /api/users/:id` - Get user profile
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/:id/settings` - Get user settings
- `PUT /api/users/:id/settings` - Update user settings

### Check-ins
- `GET /api/checkins/user/:userId` - Get all check-ins for a user
- `POST /api/checkins` - Create a new check-in
- `GET /api/checkins/stats/:userId` - Get statistics for a user

## Data Models

### User
- username (String)
- email (String)
- password (String)
- streak (Number)
- longestStreak (Number)
- lastCheckIn (Date)
- settings (Object)

### CheckIn
- userId (ObjectId)
- date (Date)
- mood (String)
- urgeLevel (Number)
- succeeded (Boolean)
- notes (String)
- triggers (Array)
- activities (Array)
- dayNumber (Number)

## Important Changes

1. **Network Dependency**: The app now requires an internet connection to function fully. Error handling has been added to inform users when they're offline.

2. **Data Consistency**: All data is now stored in MongoDB, providing consistent data access across different devices.

3. **Authentication**: User authentication is now handled server-side with more secure practices.

## Development

During development, you'll need to:

1. Make sure your backend server is running at all times
2. Use `npm run dev` to start both services
3. When testing on mobile devices, update the `API_URL` in `services/api.ts` to point to your computer's local IP address
4. For Android emulator, `10.0.2.2` points to the host machine's localhost 