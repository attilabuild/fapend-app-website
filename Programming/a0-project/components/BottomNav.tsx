import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';

type ActiveTab = 'home' | 'progress' | 'routine' | 'settings';

interface Props {
  active: ActiveTab;
}

const isIOS = Platform.OS === 'ios';

export default function BottomNav({ active }: Props) {
  const navigation = useNavigation<any>();

  const NavContent = (
    <View style={styles.bottomNav}> 
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainApp')}>
        <Ionicons name="home-outline" size={24} color="#A86A48" />
        <Text style={[styles.navText, active === 'home' && styles.activeNavText]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Progress')}>
        <MaterialCommunityIcons name="face-man" size={24} color="#A86A48" />
        <Text style={[styles.navText, active === 'progress' && styles.activeNavText]}>Progress</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Routine')}>
        <Ionicons name="calendar-outline" size={24} color="#A86A48" />
        <Text style={[styles.navText, active === 'routine' && styles.activeNavText]}>Routine</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Settings')}>
        <Ionicons name="settings-outline" size={24} color="#A86A48" />
        <Text style={[styles.navText, active === 'settings' && styles.activeNavText]}>Settings</Text>
      </TouchableOpacity>
    </View>
  );

  if (isIOS) {
    return (
      <BlurView intensity={10} tint="light" style={styles.bottomNavBlur}>
        {NavContent}
      </BlurView>
    );
  }

  return <View style={styles.bottomNavAndroid}>{NavContent}</View>;
}

const styles = StyleSheet.create({
  bottomNavBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingBottom: isIOS ? 24 : 12,
  },
  bottomNavAndroid: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F7EDE2',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#A86A48',
    marginTop: 4,
    fontWeight: '500',
  },
  activeNavText: {
    fontWeight: '700',
  },
});