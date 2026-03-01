// @ts-nocheck
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { COLORS } from '../utils/theme';
import { Ionicons, FontAwesome, AntDesign } from '@expo/vector-icons';
import { useAuthStore } from '../hooks/useStore';

const EmailLoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const result = await login(email, password);
    if (result === 'home') {
      navigation.replace('Main');
    } else if (result === 'onboarding') {
      navigation.replace('Onboarding');
    } else {
      setError('Invalid email or password');
    }
  };

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      // Use Apple user ID as email if email is not provided
      const userEmail = credential.email || `${credential.user}@privaterelay.appleid.com`;
      // Use the Apple user ID as password
      const result = await login(userEmail, credential.user);
      if (result === 'onboarding') {
        navigation.replace('Onboarding');
      } else if (result === 'home') {
        navigation.replace('Main');
      } else {
        setError('Apple login failed');
      }
    } catch (e) {
      setError('Apple login cancelled or failed');
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

      <Text style={styles.title}>Login</Text>
      <View style={styles.formBox}>
        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor={COLORS.textTertiary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      {/* Divider and Social Icons */}
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>continue with</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialRow}>
        <TouchableOpacity onPress={handleAppleLogin} style={styles.socialCircle}>
          <FontAwesome name="apple" size={28} color="#000" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Sign up</Text>
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
  loginButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 24,
    width: '100%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
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

export default EmailLoginScreen; 