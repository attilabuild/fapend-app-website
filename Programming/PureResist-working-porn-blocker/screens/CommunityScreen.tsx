import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ImageBackground,
  StatusBar,
  ScrollView,
  RefreshControl,
} from "react-native";
import { COLORS, SPACING, RADIUS } from "../utils/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getAllPosts, likePost } from "../services/api";
import { useAuthStore } from "../hooks/useStore";
import { useCallback } from "react";
import TermsOfServiceModal from "../components/community/TermsOfServiceModal";
import ReportContentModal from "../components/community/ReportContentModal";
import BlockUserModal from "../components/community/BlockUserModal";
import * as communityService from "../services/communityService";
import { AnimatedStars } from '../components/ui/AnimatedStars';

type RootStackParamList = {
  PostDetail: { postId: string };
  NewPost: undefined;
  UserProfile: { userId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Tags and their colors
const TAGS = {
  win: COLORS.success,
  day1: COLORS.info,
  advice: COLORS.accent,
  support: COLORS.warning,
  tips: COLORS.accent,
  motivation: COLORS.success,
  vent: COLORS.danger,
};

// Define a type for post objects
interface Post {
  _id: string;
  title: string;
  content: string;
  tag: string;
  userId: string;
  username: string;
  likes?: number;
  likedBy?: string[]; // Track which users liked the post
  comments?: any[];
  timeAgo?: string;
  createdAt?: string;
}

const CommunityScreen = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();

  // Add state for the modals
  const [showTOS, setShowTOS] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Post | null>(null);
  const [reportType, setReportType] = useState<"post" | "comment" | "user">(
    "post",
  );
  const [blockTarget, setBlockTarget] = useState<{
    userId: string;
    username: string;
  } | null>(null);

  // Check if the user has accepted the TOS
  useEffect(() => {
    if (user?._id) {
      checkTermsAcceptance();
    }
  }, [user?._id]);

  const checkTermsAcceptance = async () => {
    if (!user?._id) return;

    try {
      const hasAccepted = await communityService.hasAcceptedTerms(user._id);
      if (!hasAccepted) {
        setShowTOS(true);
      }
    } catch (error) {
      console.error("Error checking terms acceptance:", error);
      // If there's an error, show the TOS to be safe
      setShowTOS(true);
    }
  };

  // Handle TOS acceptance
  const handleAcceptTOS = async () => {
    if (!user?._id) return;

    try {
      await communityService.saveTermsAcceptance(user._id);
      setShowTOS(false);
      // Load posts after TOS acceptance
      loadPosts();
    } catch (error) {
      console.error("Error saving terms acceptance:", error);
      Alert.alert("Error", "Failed to save your acceptance. Please try again.");
    }
  };

  // Handle TOS decline
  const handleDeclineTOS = () => {
    // Navigate back or to home
    navigation.goBack();
  };

  // Load posts when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!user?._id) {
        Alert.alert(
          "Sign In Required",
          "You need to sign in to access the community features.",
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
        return;
      }

      // Don't load posts if TOS is showing
      if (!showTOS) {
        loadPosts();
      }
    }, [user?._id, showTOS]),
  );

  const loadPosts = async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      const response = await getAllPosts(
        activeFilter === "all" ? undefined : activeFilter,
      );

      if (response.success && response.data) {
        // Filter posts from blocked users
        const filteredPosts = await communityService.filterContent(
          user._id,
          response.data || [],
        );
        setPosts(filteredPosts);
      } else {
        setError("Failed to load posts");
      }
    } catch (err) {
      console.error("Error loading posts:", err);
      setError("An error occurred while loading posts");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFilters = () => {
    const filters = [
      { id: "all", label: "All" },
      { id: "win", label: "Wins" },
      { id: "day1", label: "Day 1" },
      { id: "advice", label: "Advice" },
      { id: "support", label: "Support" },
      { id: "tips", label: "Tips" },
      { id: "motivation", label: "Motivation" },
      { id: "vent", label: "Vent" },
    ];

    return filters.map((filter) => (
      <TouchableOpacity
        key={filter.id}
        style={[
          styles.filterButton,
          activeFilter === filter.id ? styles.filterButtonActive : null,
        ]}
        onPress={() => setActiveFilter(filter.id)}
      >
        <Text
          style={[
            styles.filterButtonText,
            activeFilter === filter.id ? styles.filterButtonActive : null,
          ]}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    ));
  };

  // Handle report submission
  const handleReportSubmit = async (reason: string, details: string) => {
    if (!user?._id || !selectedContent) return;

    try {
      const reportData = {
        contentId: selectedContent._id,
        contentType: reportType,
        userId: selectedContent.userId,
        username: selectedContent.username,
        reporterId: user._id,
        reason,
        details,
      };

      const success = await communityService.reportContent(reportData);

      if (success) {
        // Report successful

      }
    } catch (error) {
      console.error("Error reporting content:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    }
  };

  // Handle blocking a user
  const handleBlockUser = async () => {
    if (!user?._id || !blockTarget) return;

    try {
      const success = await communityService.blockUser(user._id, blockTarget);

      if (success) {
        // Reload posts to filter out content from the blocked user
        loadPosts();
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      Alert.alert("Error", "Failed to block user. Please try again.");
    }
  };

  // Show report modal for a post
  const showReportPost = (post: Post) => {
    setSelectedContent(post);
    setReportType("post");
    setShowReportModal(true);
  };

  // Show block user modal
  const showBlockUserModal = (userId: string, username: string) => {
    if (userId === user?._id) {
      Alert.alert("Error", "You cannot block yourself.");
      return;
    }

    setBlockTarget({ userId, username });
    setShowBlockModal(true);
  };

  const renderPost = useCallback(({ item }: { item: Post }) => {
    // Get tag color or default to secondary
    const tagColor =
      (item.tag && TAGS[item.tag as keyof typeof TAGS]) || COLORS.secondary;

    // Calculate time ago if not provided
    const displayTime = item.timeAgo || "Just now";

    // Check if current user has liked this post
    const userHasLiked = user && item.likedBy && item.likedBy.includes(user._id);

    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => navigation.navigate("PostDetail", { postId: item._id })}
      >
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{item.username}</Text>
          </View>

          <View style={styles.postActions}>
            {/* <Text style={styles.timeAgo}>{displayTime}</Text> */}

            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => showPostOptions(item)}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.postContent}>
          <View style={styles.titleRow}>
            <Text style={styles.postTitle}>{item.title}</Text>
            <View style={[styles.tagBadge, { backgroundColor: tagColor }]}>
              <Text style={styles.tagText}>#{item.tag}</Text>
            </View>
          </View>
          <Text style={styles.postBody} numberOfLines={3}>
            {item.content}
          </Text>
        </View>

        <View style={styles.postFooter}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLikePost(item._id)}
          >
            <Ionicons
              name={userHasLiked ? "heart" : "heart-outline"}
              size={18}
              color={userHasLiked ? COLORS.danger : COLORS.textSecondary}
            />
            <Text 
              style={[
                styles.actionText,
                userHasLiked && { color: COLORS.danger }
              ]}
            >
              {" "}{item.likes || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={COLORS.textSecondary}
            />
            <Text style={styles.actionText}>
              {" "}
              {Array.isArray(item.comments) ? item.comments.length : 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => showReportPost(item)}
          >
            <Ionicons
              name="flag-outline"
              size={18}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [user, navigation]);

  // Show post options menu
  const showPostOptions = (post: Post) => {
    if (!user) return;

    // Don't show options for your own posts
    if (post.userId === user._id) {
      Alert.alert("Post Options", "What would you like to do?", [
        {
          text: "Edit Post",
          onPress: () => navigation.navigate("NewPost", { postId: post._id }),
        },
        { text: "Delete Post", onPress: () => confirmDeletePost(post._id) },
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      Alert.alert("Post Options", "What would you like to do?", [
        { text: "Report Post", onPress: () => showReportPost(post) },
        {
          text: "Block User",
          onPress: () => showBlockUserModal(post.userId, post.username),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  // Confirm post deletion
  const confirmDeletePost = (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeletePost(postId),
        },
      ],
    );
  };

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    // Implementation would go here

  };

  // Add like post handler
  const handleLikePost = async (postId: string) => {
    if (!user) return;

    try {
      const response = await likePost(postId, user._id);
      if (response.success) {
        // Refresh posts to show updated likes
        loadPosts();
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const filteredPosts =
    activeFilter === "all"
      ? posts
      : posts.filter((post) => post.tag === activeFilter);

  return (
    <View style={styles.container}>
      <AnimatedStars />
      <StatusBar barStyle="light-content" />
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        contentContainerStyle={styles.contentContainer}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 120, // Approximate height of your post card
          offset: 120 * index,
          index,
        })}
        ListHeaderComponent={() => (
          <View style={styles.filtersContainer}>
            {renderFilters()}
            <TouchableOpacity
              style={styles.newPostButton}
              onPress={() => navigation.navigate("NewPost")}
            >
              <Ionicons name="add-circle" size={16} color={COLORS.primary} />
              <Text style={styles.newPostButtonText}>New Post</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.accent} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No posts yet. Be the first to share!
              </Text>
            </View>
          )
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadPosts}
            tintColor={COLORS.textPrimary}
          />
        }
      />

      {/* Modals */}
      <TermsOfServiceModal
        visible={showTOS}
        onAccept={handleAcceptTOS}
        onDecline={handleDeclineTOS}
      />
      <ReportContentModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onReport={handleReportSubmit}
        contentType={reportType}
      />
      <BlockUserModal
        visible={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onBlock={handleBlockUser}
        username={blockTarget?.username || ""}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTextArea: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.card,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
  },
  filterButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: "bold",
  },
  postsContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  postCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    // borderBottomWidth: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  username: {
    color: COLORS.textPrimary,
    fontWeight: "500",
    fontSize: 14,
  },
  timeAgo: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginRight: SPACING.sm,
  },
  postContent: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    flex: 1,
  },
  tagBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.primary,
  },
  tagText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "500",
  },
  postBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    maxHeight: 60,
    overflow: "hidden",
  },
  postFooter: {
    flexDirection: "row",
    padding: SPACING.md,
    // borderTopWidth: 1,
  },
  actionButton: {
    marginRight: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  newPostButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.sm,
    alignSelf: "center",
  },
  newPostButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  moreButton: {
    padding: SPACING.xs,
  },
  postActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  contentContainer: {
    padding: SPACING.md,
  },
});

export default CommunityScreen;
