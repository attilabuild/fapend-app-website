const { connectToDatabase } = require('./utils/database');
const AsyncStorage = require('@react-native-async-storage/async-storage');

// Test the database connection
const testConnection = async () => {
  try {
    const connection = await connectToDatabase();
    // Print the list of collections
    const collections = await connection.db.listCollections().toArray();
    collections.forEach(collection => {
    });
    
    // Close the connection when done
    await connection.close();
  } catch (error) {
    console.error('Connection test failed:', error);
  }
};

// Test function for automatic check-in functionality
const testAutoCheckin = async () => {
  const testUserId = 'test_user_123';
  const today = new Date().toISOString().split('T')[0];
  // Test setting first day auto check-in
  try {
    await AsyncStorage.setItem(`first_day_auto_checkin_${testUserId}`, 'true');
    await AsyncStorage.setItem(`first_checkin_date_${testUserId}`, today);
    // Test checking if it's first day auto check-in
    const firstDayAutoCheckin = await AsyncStorage.getItem(`first_day_auto_checkin_${testUserId}`);
    const firstCheckinDate = await AsyncStorage.getItem(`first_checkin_date_${testUserId}`);
    
    if (firstDayAutoCheckin === 'true' && firstCheckinDate === today) {
    } else {
    }
    
    // Test clearing first day auto check-in
    await AsyncStorage.removeItem(`first_day_auto_checkin_${testUserId}`);
    await AsyncStorage.removeItem(`first_checkin_date_${testUserId}`);
  } catch (error) {
    console.error('❌ Error testing automatic check-in:', error);
  }
};

// Run the test
testConnection();

// Uncomment the line below to run the test
// testAutoCheckin(); 