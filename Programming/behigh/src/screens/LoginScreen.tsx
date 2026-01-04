import React, { useState } from 'react';
import { View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { signIn } from '../api/auth';
import { useStore } from '../store/useStore';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore((state) => state.setUser);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    setLoading(true);
    const { user, error } = await signIn(email, password);
    setLoading(false);
    
    if (error) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
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
              <Text className="text-5xl font-bold text-black mb-2">BeReal.</Text>
              <Text className="text-lg text-gray-600">
                Welcome back! Sign in to continue.
              </Text>
            </View>
            
            {/* Form */}
            <View className="mb-6">
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
                placeholder="Enter your password"
                secureTextEntry
              />
            </View>
            
            {/* Login Button */}
            <Button
              title="Log In"
              onPress={handleLogin}
              loading={loading}
              className="mb-4"
            />
            
            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600 text-base">Don't have an account? </Text>
              <Button
                title="Sign Up"
                onPress={() => navigation.navigate('Signup')}
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

