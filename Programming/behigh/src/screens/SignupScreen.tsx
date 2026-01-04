import React, { useState } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { signUp } from '../api/auth';
import { useStore } from '../store/useStore';

interface SignupScreenProps {
  navigation: any;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore((state) => state.setUser);
  
  const handleSignup = async () => {
    if (!email || !password || !username || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }
    
    setLoading(true);
    const { user, error } = await signUp(email, password, username, fullName);
    setLoading(false);
    
    if (error) {
      Alert.alert('Signup Failed', error.message || 'Could not create account');
      return;
    }
    
    if (user) {
      setUser(user);
    }
  };
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerClassName="flex-grow">
          <View className="flex-1 px-6 pt-20">
            {/* Header */}
            <View className="mb-12">
              <Text className="text-5xl font-bold text-black mb-2">Join BeReal.</Text>
              <Text className="text-lg text-gray-600">
                Create your account to get started.
              </Text>
            </View>
            
            {/* Form */}
            <View className="mb-6">
              <Input
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                autoCapitalize="words"
              />
              
              <Input
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Choose a username"
                autoCapitalize="none"
              />
              
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password (min 6 characters)"
                secureTextEntry
              />
            </View>
            
            {/* Signup Button */}
            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              className="mb-4"
            />
            
            {/* Login Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600 text-base">Already have an account? </Text>
              <Button
                title="Log In"
                onPress={() => navigation.navigate('Login')}
                variant="outline"
                className="px-4 py-2"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

