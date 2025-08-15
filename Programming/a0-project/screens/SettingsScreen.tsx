import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Animated,
  Platform,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

const isIOS = Platform.OS === 'ios';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [name, setName] = useState('Sara Johnson');
  const [email, setEmail] = useState('sara.johnson@example.com');
  const [avatarUri, setAvatarUri] = useState('https://i.postimg.cc/4yk6ZTDh/profile.jpg');

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [editAvatarUri, setEditAvatarUri] = useState(avatarUri);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, translateY]);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: () => navigation.navigate('Home'),
          style: "destructive"
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => navigation.navigate('Home'),
          style: "destructive"
        }
      ]
    );
  };

  const renderSettingItem = (icon, title, subtitle, rightElement, onPress) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIconContainer}>
        {icon}
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingRightElement}>
        {rightElement}
      </View>
    </TouchableOpacity>
  );

  // Placeholder image picker handler
  const pickImage = async () => {
    // Integrate image picker later; for now, toggle between two sample avatars
    const alt = 'https://i.postimg.cc/MTbYtZJw/profile2.jpg';
    setEditAvatarUri((prev) => (prev === avatarUri ? alt : avatarUri));
  };

  const openEdit = () => {
    setEditName(name);
    setEditEmail(email);
    setEditAvatarUri(avatarUri);
    setIsEditOpen(true);
  };

  const saveProfile = () => {
    setName(editName.trim() || name);
    setEmail(editEmail.trim() || email);
    setAvatarUri(editAvatarUri || avatarUri);
    setIsEditOpen(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { opacity: fadeAnim, transform: [{ translateY: translateY }] }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('MainApp')}
        >
          <Ionicons name="arrow-back" size={24} color="#A86A48" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholderView} />
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <Animated.View 
          style={[
            styles.profileSection, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: avatarUri }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editProfileButton} onPress={openEdit}>
              <Ionicons name="camera" size={20} color="#FFF3E0" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <TouchableOpacity style={styles.editProfileTextButton} onPress={openEdit}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Settings Sections */}
        <Animated.View 
          style={[
            styles.settingsSection, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <Text style={styles.sectionTitle}>App Settings</Text>
          {renderSettingItem(
            <Ionicons name="notifications" size={22} color="#A86A48" />,
            "Notifications",
            "Get updates about your skin progress",
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#D1C4B8", true: "#C68B59" }}
              thumbColor={notificationsEnabled ? "#A86A48" : "#F7EDE2"}
            />,
            null
          )}
        </Animated.View>

        <Animated.View 
          style={[
            styles.settingsSection, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <Text style={styles.sectionTitle}>Subscription</Text>
          {renderSettingItem(
            <Ionicons name="star" size={22} color="#A86A48" />,
            "Premium Plan",
            "Active until Dec 15, 2025",
            <Ionicons name="chevron-forward" size={20} color="#A86A48" />,
            () => {}
          )}
          {renderSettingItem(
            <MaterialIcons name="payment" size={22} color="#A86A48" />,
            "Payment Methods",
            "Manage your payment options",
            <Ionicons name="chevron-forward" size={20} color="#A86A48" />,
            () => {}
          )}
        </Animated.View>

        <Animated.View 
          style={[
            styles.settingsSection, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <Text style={styles.sectionTitle}>Support & About</Text>
          {renderSettingItem(
            <Ionicons name="help-circle" size={22} color="#A86A48" />,
            "Help Center",
            "Get help with your account",
            <Ionicons name="chevron-forward" size={20} color="#A86A48" />,
            () => {}
          )}
          {renderSettingItem(
            <Ionicons name="document-text" size={22} color="#A86A48" />,
            "Terms & Conditions",
            null,
            <Ionicons name="chevron-forward" size={20} color="#A86A48" />,
            () => {}
          )}
          {renderSettingItem(
            <Ionicons name="shield" size={22} color="#A86A48" />,
            "Privacy Policy",
            null,
            <Ionicons name="chevron-forward" size={20} color="#A86A48" />,
            () => {}
          )}
          {renderSettingItem(
            <Ionicons name="information-circle" size={22} color="#A86A48" />,
            "About Skinmax",
            "Version 1.0.0",
            <Ionicons name="chevron-forward" size={20} color="#A86A48" />,
            () => {}
          )}
        </Animated.View>

        <Animated.View 
          style={[
            styles.settingsSection, 
            { opacity: fadeAnim, transform: [{ translateY: translateY }] }
          ]}
        >
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color="#A86A48" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteAccountText}>Delete Account</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Add padding at bottom to account for navigation bar */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditOpen} transparent animationType="fade" onRequestClose={() => setIsEditOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity style={styles.modalAvatarWrap} onPress={pickImage}>
              <Image source={{ uri: editAvatarUri }} style={styles.modalAvatar} />
              <View style={styles.modalAvatarBadge}>
                <Ionicons name="camera" size={16} color="#FFF3E0" />
              </View>
            </TouchableOpacity>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor="#B08A70"
                style={styles.textInput}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="name@example.com"
                placeholderTextColor="#B08A70"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.textInput}
              />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setIsEditOpen(false)}>
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={saveProfile}>
                <Text style={styles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      {isIOS ? (
        <BlurView intensity={10} tint="light" style={styles.bottomNavBlur}>
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainApp')}>
              <Ionicons name="home-outline" size={24} color="#A86A48" />
              <Text style={styles.navText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Progress')}>
              <MaterialIcons name="face" size={24} color="#A86A48" />
              <Text style={styles.navText}>Progress</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Routine')}>
              <Ionicons name="calendar-outline" size={24} color="#A86A48" />
              <Text style={styles.navText}>Routine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="settings" size={24} color="#A86A48" />
              <Text style={styles.navText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      ) : (
        <View style={styles.bottomNavAndroid}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('MainApp')}>
            <Ionicons name="home-outline" size={24} color="#A86A48" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Progress')}>
            <MaterialIcons name="face" size={24} color="#A86A48" />
            <Text style={styles.navText}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Routine')}>
            <Ionicons name="calendar-outline" size={24} color="#A86A48" />
            <Text style={styles.navText}>Routine</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="settings" size={24} color="#A86A48" />
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    color: '#A86A48',
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  placeholderView: {
    width: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#A86A48',
  },
  editProfileButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#A86A48',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF3E0',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#A86A48',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#A86A48',
    opacity: 0.7,
    marginBottom: 16,
  },
  editProfileTextButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    borderRadius: 20,
  },
  editProfileText: {
    color: '#A86A48',
    fontWeight: '500',
    fontSize: 14,
  },
  settingsSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A86A48',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7EDE2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A86A48',
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#A86A48',
    opacity: 0.7,
    marginTop: 2,
  },
  settingRightElement: {
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 106, 72, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#A86A48',
    marginLeft: 8,
  },
  deleteAccountButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  deleteAccountText: {
    fontSize: 14,
    color: '#E57373',
  },
  bottomPadding: {
    height: 80,
  },
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFF8EE',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#A86A48',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalAvatarWrap: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  modalAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#A86A48',
  },
  modalAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#A86A48',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF8EE',
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 13,
    color: '#8E6B56',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F7EDE2',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#6E4A34',
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  secondaryBtnText: {
    color: '#A86A48',
    fontWeight: '600',
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#A86A48',
  },
  primaryBtnText: {
    color: '#FFF3E0',
    fontWeight: '700',
  },
});