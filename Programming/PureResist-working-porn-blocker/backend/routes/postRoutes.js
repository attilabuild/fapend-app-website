const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const { isValidObjectId } = require('mongoose');

// Get all posts (with optional filtering by tag)
router.get('/', async (req, res) => {
  try {
    const { tag, userId } = req.query;
    const filter = {};
    
    // Add tag filter if provided
    if (tag && tag !== 'all') {
      filter.tag = tag;
    }
    
    // Add user filter if provided
    if (userId) {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID format'
        });
      }
      filter.userId = userId;
    }
    
    // Get posts with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalPosts = await Post.countDocuments(filter);
    
    res.json({
      success: true,
      data: posts,
      pagination: {
        total: totalPosts,
        page,
        limit,
        pages: Math.ceil(totalPosts / limit)
      }
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get posts',
      error: error.message
    });
  }
});

// Get a single post by ID
router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    
    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format'
      });
    }
    
    const post = await Post.findById(postId).lean();
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Error getting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post',
      error: error.message
    });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  try {
    const { userId, title, content, tag } = req.body;
    
    // Validate required fields
    if (!title || !content || !tag || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Title, content, tag, and userId are required'
      });
    }
    
    // Validate userId
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Get the username from User model
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create the post
    const post = new Post({
      userId,
      username: user.username,
      title,
      content,
      tag
    });
    
    await post.save();
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
});

// Update a post
router.put('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, tag } = req.body;
    const userId = req.body.userId; // This should match the post creator
    
    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format'
      });
    }
    
    // Validate required fields
    if (!title && !content && !tag) {
      return res.status(400).json({
        success: false,
        message: 'At least one of title, content, or tag must be provided'
      });
    }
    
    // Find the post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Verify ownership
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own posts'
      });
    }
    
    // Update the post
    if (title) post.title = title;
    if (content) post.content = content;
    if (tag) post.tag = tag;
    post.updatedAt = new Date();
    
    await post.save();
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
});

// Delete a post
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    if (!isValidObjectId(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID format'
      });
    }
    
    // Find the post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Verify ownership
    if (post.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }
    
    await Post.findByIdAndDelete(postId);
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

// Like a post
router.post('/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    
    if (!isValidObjectId(postId) || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }
    
    // Find the post
    const post = await Post.findById(postId);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user already liked this post
    const alreadyLiked = post.likedBy.includes(userId);
    
    if (alreadyLiked) {
      // Unlike the post
      post.likes = Math.max(0, post.likes - 1);
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
    } else {
      // Like the post
      post.likes += 1;
      post.likedBy.push(userId);
    }
    
    await post.save();
    
    res.json({
      success: true,
      message: alreadyLiked ? 'Post unliked successfully' : 'Post liked successfully',
      data: {
        likes: post.likes,
        liked: !alreadyLiked
      }
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post',
      error: error.message
    });
  }
});

// Like a comment
router.post('/:postId/comment/:commentId/like', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { userId } = req.body;

    if (!isValidObjectId(postId) || !isValidObjectId(commentId) || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const alreadyLiked = comment.likedBy.includes(userId);

    if (alreadyLiked) {
      comment.likes = Math.max(0, comment.likes - 1);
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId);
    } else {
      comment.likes += 1;
      comment.likedBy.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: alreadyLiked ? 'Comment unliked successfully' : 'Comment liked successfully',
      data: {
        likes: comment.likes,
        liked: !alreadyLiked
      }
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like comment',
      error: error.message
    });
  }
});

// Add a comment to a post or reply to a comment
router.post('/:postId/comment', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, content, parentId } = req.body; // parentId is optional

    if (!isValidObjectId(postId) || !isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newComment = {
      userId,
      username: user.username,
      content: content.trim(),
      createdAt: new Date(),
    };

    let savedComment;

    if (parentId) {
      // This is a reply
      if (!isValidObjectId(parentId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid parent comment ID format'
        });
      }
      const parentComment = post.comments.id(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
      parentComment.replies.push(newComment);
      savedComment = parentComment.replies[parentComment.replies.length - 1];
    } else {
      // This is a new top-level comment
      post.comments.push(newComment);
      savedComment = post.comments[post.comments.length - 1];
    }

    await post.save();

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: savedComment,
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

module.exports = router; 