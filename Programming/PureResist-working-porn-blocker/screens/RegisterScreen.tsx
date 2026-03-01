// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { COLORS } from '../utils/theme';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { useAuthStore } from '../hooks/useStore';
import { generateUsername, generateUsernameFromName } from "../utils/generateUsername";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const result = await register(name, email, password);
    if (result === 'onboarding') {
      // Navigate to Onboarding since new users have isSubscribed: false by default
      navigation.replace('Onboarding');
    } else {
      setError('Registration failed');
    }
  };

  const handleAppleRegister = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // Use Apple user ID as email if email is not provided
      const userEmail = credential.email || `${credential.user}@privaterelay.appleid.com`;
      
      // Generate username based on full name if available, otherwise generate a random one
      let username;
      if (credential.fullName?.givenName) {
        username = generateUsernameFromName(credential.fullName.givenName);
      } else {
        username = generateUsername();
      }

      // Use the Apple user ID as password
      const result = await register(username, userEmail, credential.user);
      if (result === 'onboarding') {
        // Navigate to Onboarding since new users have isSubscribed: false by default
        navigation.replace('Onboarding');
      } else {
        setError('Apple registration failed');
      }
    } catch (e) {
      setError('Apple registration cancelled or failed');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="close" size={24} color="#fff" />
      </TouchableOpacity>
      
      <Text style={styles.title}>Create an Account</Text>
      <View style={styles.formBox}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={COLORS.textTertiary}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={COLORS.textTertiary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor={COLORS.textTertiary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      {/* Divider and Social Icons */}
      {Platform.OS === 'ios' && (
        <>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>continue with</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.socialRow}>
            <TouchableOpacity onPress={handleAppleRegister} style={styles.socialCircle}>
              <FontAwesome name="apple" size={28} color="#000" />
            </TouchableOpacity>
          </View>
        </>
      )}
      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>
      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>Have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('EmailLogin')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(50, 50, 50, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 32,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  formBox: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginBottom: 24,
    padding: 0,
    alignItems: 'center',
    borderWidth: 0,
  },
  input: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
  },
  error: {
    color: COLORS.danger,
    marginBottom: 8,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#222',
  },
  dividerText: {
    marginHorizontal: 8,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  socialCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  signUpButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    height: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  link: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen; 