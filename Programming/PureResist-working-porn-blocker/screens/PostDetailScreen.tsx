import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack" with { "resolution-mode": "require" };
import { COLORS, SPACING, RADIUS } from "../utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../hooks/useStore";
import { getPost, likePost, addComment, likeComment } from "../services/api";
import { RootStackParamList } from "../navigation/types";
import ReportContentModal from "../components/community/ReportContentModal";
import BlockUserModal from "../components/community/BlockUserModal";
import * as communityService from "../services/communityService";

type Props = NativeStackScreenProps<RootStackParamList, "PostDetail">;

// Define types for comments and posts
interface Comment {
  _id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  timeAgo?: string;
  likes?: number;
  likedBy?: string[];
  parentId?: string;
  replies?: Comment[];
}

interface Post {
  _id: string;
  userId: string;
  username: string;
  title: string;
  content: string;
  tag: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  timeAgo?: string;
}

// Tags and their colors
const TAGS: Record<string, string> = {
  win: COLORS.success,
  day1: COLORS.info,
  advice: COLORS.accent,
  support: COLORS.warning,
  tips: COLORS.accent,
  motivation: COLORS.success,
  vent: COLORS.danger,
};

const PostDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { postId } = route.params;
  const { user } = useAuthStore();
  const [newComment, setNewComment] = useState("");
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLiked, setUserLiked] = useState(false);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [reportType, setReportType] = useState<"post" | "comment" | "user">(
    "post",
  );
  const [selectedContent, setSelectedContent] = useState<Post | Comment | null>(
    null,
  );
  const [blockTarget, setBlockTarget] = useState<{
    userId: string;
    username: string;
  } | null>(null);

  // Fetch post by ID
  const loadPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPost(postId);

      if (response.success && "data" in response) {
        const postData = response.data;

        // Initialize comments array if it doesn't exist
        if (!postData.comments) {
          postData.comments = [];
        }

        // Check if current user has liked the post
        if (user && postData.likedBy && postData.likedBy.includes(user._id)) {
          setUserLiked(true);
        }

        setPost(postData);
      } else {
        setError("Post not found");
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    } catch (err) {
      console.error("Error loading post:", err);
      setError("Failed to load post");
    } finally {
      setLoading(false);
    }
  }, [postId, user, navigation]);

  // Load post on mount
  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleToggleLike = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in to like posts");
      return;
    }

    try {
      const response = await likePost(postId, user._id);

      if (response.success) {
        // Refresh post to show updated likes
        loadPost();
      } else {
        console.error("Error liking post:", response.message);
      }
    } catch (err) {
      console.error("Error updating like:", err);
      Alert.alert("Error", "Failed to update like status");
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    if (!user) {
      Alert.alert("Sign in required", "Please sign in to comment");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await addComment(
        postId,
        user._id,
        comment.trim(),
        replyTo?._id, // Pass parentId if this is a reply
      );

      if (response.success) {
        // Clear comment input and reply state, then refresh post
        setComment("");
        setReplyTo(null);
        loadPost();
      } else {
        Alert.alert(
          "Error",
          "message" in response ? response.message : "Failed to add comment",
        );
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyTo(comment);
    setNewComment(`@${comment.username} `);
    // Focus the comment input (in a real implementation, you'd use a ref)
  };

  const cancelReply = () => {
    setReplyTo(null);
    setNewComment("");
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user || !post) {
      Alert.alert("Sign in required", "Please sign in to like comments");
      return;
    }

    try {
      const response = await likeComment(postId, commentId, user._id);

      if (response.success) {
        // Refresh post to show updated likes
        loadPost();
      } else {
        console.error("Error liking comment:", response.message);
      }
    } catch (err) {
      console.error("Error updating comment like:", err);
      Alert.alert("Error", "Failed to update comment like status");
    }
  };

  // Show report modal for post
  const handleReportPost = () => {
    if (!post) return;

    setSelectedContent(post);
    setReportType("post");
    setReportModalVisible(true);
  };

  // Show report modal for comment
  const handleReportComment = (comment: Comment) => {
    setSelectedContent(comment);
    setReportType("comment");
    setReportModalVisible(true);
  };

  // Show block user modal for post author
  const handleBlockPostAuthor = () => {
    if (!post || !user) return;

    // Don't allow blocking yourself
    if (post.userId === user._id) {
      Alert.alert("Error", "You cannot block yourself");
      return;
    }

    setBlockTarget({
      userId: post.userId,
      username: post.username,
    });
    setBlockModalVisible(true);
  };

  // Show block user modal for comment author
  const handleBlockCommentAuthor = (comment: Comment) => {
    if (!user) return;

    // Don't allow blocking yourself
    if (comment.userId === user._id) {
      Alert.alert("Error", "You cannot block yourself");
      return;
    }

    setBlockTarget({
      userId: comment.userId,
      username: comment.username,
    });
    setBlockModalVisible(true);
  };

  // Handle report submission
  const handleReportSubmit = async (reason: string, details: string) => {
    if (!user?._id || !selectedContent) return;

    try {
      const reportData = {
        contentId: selectedContent._id,
        contentType: reportType,
        userId: "userId" in selectedContent ? selectedContent.userId : "",
        username: "username" in selectedContent ? selectedContent.username : "",
        reporterId: user._id,
        reason,
        details,
      };

      const success = await communityService.reportContent(reportData);

      if (success) {
        // Report successful
        Alert.alert(
          "Report Submitted",
          "Thank you for your report. Our team will review it within 24 hours.",
        );
      }
    } catch (error) {
      console.error("Error reporting content:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setReportModalVisible(false);
    }
  };

  // Handle blocking a user
  const handleBlockUser = async () => {
    if (!user?._id || !blockTarget) return;

    try {
      const success = await communityService.blockUser(user._id, blockTarget);

      if (success) {
        // If we blocked the post author, navigate back
        if (post && post.userId === blockTarget.userId) {
          Alert.alert(
            "User Blocked",
            `You have blocked ${blockTarget.username}. You will no longer see their content.`,
            [{ text: "OK", onPress: () => navigation.goBack() }],
          );
        } else {
          // Otherwise, just reload the post (comments from blocked users should be filtered)
          loadPost();
        }
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      Alert.alert("Error", "Failed to block user. Please try again.");
    } finally {
      setBlockModalVisible(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get tag color or default to secondary
  const tagColor = post.tag
    ? TAGS[post.tag] || COLORS.secondary
    : COLORS.secondary;

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView style={styles.scrollView}>
          {/* Post Header */}
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {post.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.username}>{post.username}</Text>
              </View>
              <Text style={styles.timeAgo}>{post.timeAgo}</Text>
            </View>

            {/* Post Content */}
            <View style={styles.postContent}>
              <View style={styles.titleRow}>
                <Text style={styles.postTitle}>{post.title}</Text>
                <View style={[styles.tagBadge, { backgroundColor: tagColor }]}>
                  <Text style={styles.tagText}>#{post.tag}</Text>
                </View>
              </View>
              <Text style={styles.postBody}>{post.content}</Text>
            </View>

            {/* Post Actions */}
            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleToggleLike}
              >
                <Ionicons
                  name={userLiked ? "heart" : "heart-outline"}
                  size={20}
                  color={userLiked ? COLORS.danger : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.actionText,
                    userLiked && { color: COLORS.danger },
                  ]}
                >
                  {post.likes || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons
                  name="chatbubble-outline"
                  size={20}
                  color={COLORS.textSecondary}
                />
                <Text style={styles.actionText}>
                  {post.comments?.length || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments ({post.comments?.length || 0})
            </Text>

            {post.comments?.length > 0 ? (
              post.comments
                .filter((comment) => !comment.parentId) // Only show top-level comments
                .map((comment) => {
                  const commentUserLiked =
                    user && comment.likedBy?.includes(user._id);

                  return (
                    <View key={comment._id} style={styles.commentCard}>
                      <View style={styles.commentHeader}>
                        <View style={styles.userInfo}>
                          <View style={[styles.userAvatar, styles.smallAvatar]}>
                            <Text style={styles.smallAvatarText}>
                              {comment.username.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.commentUsername}>
                            {comment.username}
                          </Text>
                        </View>
                        <Text style={styles.commentTimeAgo}>
                          {comment.timeAgo}
                        </Text>
                      </View>
                      <Text style={styles.commentContent}>
                        {comment.content}
                      </Text>
                      <View style={styles.commentActions}>
                        <TouchableOpacity
                          style={styles.commentActionButton}
                          onPress={() => handleLikeComment(comment._id)}
                        >
                          <Ionicons
                            name={commentUserLiked ? "heart" : "heart-outline"}
                            size={16}
                            color={
                              commentUserLiked
                                ? COLORS.danger
                                : COLORS.textTertiary
                            }
                          />
                          <Text
                            style={[
                              styles.commentActionText,
                              commentUserLiked && { color: COLORS.danger },
                            ]}
                          >
                            {comment.likes || 0}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.commentActionButton}
                          onPress={() => handleReply(comment)}
                        >
                          <Ionicons
                            name="return-down-back-outline"
                            size={16}
                            color={COLORS.textTertiary}
                          />
                          <Text style={styles.commentActionText}>Reply</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Render replies */}
                      {Array.isArray(comment.replies) &&
                        comment.replies.length > 0 && (
                          <View style={styles.repliesContainer}>
                            {comment.replies.map((reply) => {
                              const replyUserLiked =
                                user &&
                                Array.isArray(reply.likedBy) &&
                                reply.likedBy.includes(user._id);

                              return (
                                <View key={reply._id} style={styles.replyCard}>
                                  <View style={styles.commentHeader}>
                                    <View style={styles.userInfo}>
                                      <View
                                        style={[
                                          styles.userAvatar,
                                          styles.xsAvatar,
                                        ]}
                                      >
                                        <Text style={styles.xsAvatarText}>
                                          {reply.username
                                            .charAt(0)
                                            .toUpperCase()}
                                        </Text>
                                      </View>
                                      <Text style={styles.commentUsername}>
                                        {reply.username}
                                      </Text>
                                    </View>
                                    <Text style={styles.commentTimeAgo}>
                                      {reply.timeAgo}
                                    </Text>
                                  </View>
                                  <Text style={styles.commentContent}>
                                    {reply.content}
                                  </Text>
                                  <View style={styles.commentActions}>
                                    <TouchableOpacity
                                      style={styles.commentActionButton}
                                      onPress={() =>
                                        handleLikeComment(reply._id)
                                      }
                                    >
                                      <Ionicons
                                        name={
                                          replyUserLiked
                                            ? "heart"
                                            : "heart-outline"
                                        }
                                        size={16}
                                        color={
                                          replyUserLiked
                                            ? COLORS.danger
                                            : COLORS.textTertiary
                                        }
                                      />
                                      <Text
                                        style={[
                                          styles.commentActionText,
                                          replyUserLiked && {
                                            color: COLORS.danger,
                                          },
                                        ]}
                                      >
                                        {reply.likes || 0}
                                      </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                      style={styles.commentActionButton}
                                      onPress={() => handleReply(comment)} // Reply to the parent comment
                                    >
                                      <Ionicons
                                        name="return-down-back-outline"
                                        size={16}
                                        color={COLORS.textTertiary}
                                      />
                                      <Text style={styles.commentActionText}>
                                        Reply
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        )}
                    </View>
                  );
                })
            ) : (
              <Text style={styles.noCommentsText}>
                No comments yet. Be the first to comment!
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Reply indicator */}
        {replyTo && (
          <View style={styles.replyIndicator}>
            <Text style={styles.replyingToText}>
              Replying to{" "}
              <Text style={styles.replyingToName}>{replyTo.username}</Text>
            </Text>
            <TouchableOpacity
              onPress={cancelReply}
              style={styles.cancelReplyButton}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Comment Input */}
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
            placeholderTextColor={COLORS.textTertiary}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
            editable={!isSubmitting}
          />
          {isSubmitting ? (
            <ActivityIndicator
              size="small"
              color={COLORS.accent}
              style={styles.submitButton}
            />
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                !comment.trim() && styles.disabledButton,
              ]}
              onPress={handleAddComment}
              disabled={!comment.trim()}
            >
              <Ionicons name="send" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  postCard: {
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.sm,
  },
  userAvatarText: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
    fontSize: 18,
  },
  username: {
    color: COLORS.textPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  timeAgo: {
    color: COLORS.textSecondary,
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  tagBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
  },
  tagText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },
  postBody: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },
  postActions: {
    flexDirection: "row",
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.card,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.lg,
  },
  actionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginLeft: 4,
  },
  commentsSection: {
    padding: SPACING.md,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  noCommentsText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: "center",
    padding: SPACING.md,
  },
  commentCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xs,
  },
  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  smallAvatarText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  commentUsername: {
    color: COLORS.textPrimary,
    fontWeight: "500",
    fontSize: 14,
  },
  commentTimeAgo: {
    color: COLORS.textTertiary,
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  commentActions: {
    flexDirection: "row",
    marginTop: 4,
  },
  commentActionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  commentActionText: {
    color: COLORS.textTertiary,
    fontSize: 12,
    marginLeft: 4,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardDark,
    backgroundColor: COLORS.card,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING.sm,
  },
  disabledButton: {
    backgroundColor: COLORS.cardDark,
    opacity: 0.7,
  },
  replyIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.cardLight,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardDark,
  },
  replyingToText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  replyingToName: {
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  cancelReplyButton: {
    padding: SPACING.xs,
  },
  repliesContainer: {
    marginTop: SPACING.sm,
    paddingLeft: SPACING.md,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.cardDark,
  },
  replyCard: {
    backgroundColor: COLORS.cardLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  xsAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  xsAvatarText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default PostDetailScreen;
