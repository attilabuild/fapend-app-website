const userService = require('./services/userService');

// Test user service operations
const testUserService = async () => {
  try {

    // Create a test user
    const testUser = {
      username: 'testuser_' + Date.now(),
      email: `test_${Date.now()}@example.com`,
      password: 'password123',
      goals: ['Reach 30 days', 'Improve focus']
    };
    
    // Create user

    const createdUser = await userService.create(testUser);

    // Find user by ID

    const foundUser = await userService.findById(createdUser._id);

    // Update user streak

    const updatedUser = await userService.updateStreak(createdUser._id, {
      currentStreak: 7,
      longestStreak: 7
    });

    // Record relapse

    const relapsedUser = await userService.recordRelapse(createdUser._id);

    // Clean up - delete the test user

    await userService.deleteById(createdUser._id);

    // Close the database connection
    await userService.closeConnection();

  } catch (error) {
    console.error('Test failed:', error);
    
    // Make sure to close the connection even if there's an error
    try {
      await userService.closeConnection();
    } catch (closeError) {
      console.error('Error closing connection:', closeError);
    }
  }
};

// Run the test
testUserService(); 