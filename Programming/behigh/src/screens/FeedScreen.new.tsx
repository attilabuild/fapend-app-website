import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DEMO_POSTS } from '../constants/demoData';

interface FeedScreenProps {
  navigation: any;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.logo}>BeHigh</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Posts */}
        {DEMO_POSTS.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
                <View>
                  <Text style={styles.userName}>{post.user.name}</Text>
                  <Text style={styles.postTime}>{post.postedAt}</Text>
                </View>
              </View>
              {post.isLate && (
                <View style={styles.lateTag}>
                  <Ionicons name="time-outline" size={14} color="#ff9500" />
                  <Text style={styles.lateText}>Late</Text>
                </View>
              )}
            </View>

            <View style={styles.postImageContainer}>
              <Image source={{ uri: post.mainPhoto }} style={styles.postImage} />
              <Image source={{ uri: post.selfiePhoto }} style={styles.selfieOverlay} />
            </View>

            {post.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color="#999" />
                <Text style={styles.locationText}>{post.location}</Text>
              </View>
            )}

            <View style={styles.reactionsContainer}>
              {post.reactions.map((reaction, idx) => (
                <View key={idx} style={styles.reaction}>
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={styles.reactionUser}>{reaction.username}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.addReaction}>
                <Ionicons name="add-circle-outline" size={20} color="#00ff88" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Camera FAB */}
      <TouchableOpacity 
        style={styles.cameraFab}
        onPress={() => navigation.navigate('Camera')}
      >
        <Ionicons name="camera" size={28} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  postCard: {
    backgroundColor: '#0f0f0f',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00ff88',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },
  lateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ff950020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lateText: {
    fontSize: 12,
    color: '#ff9500',
    fontWeight: '600',
  },
  postImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  selfieOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 80,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#1a1a1a',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  reaction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionUser: {
    fontSize: 11,
    color: '#999',
  },
  addReaction: {
    padding: 4,
  },
  cameraFab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00ff88',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
