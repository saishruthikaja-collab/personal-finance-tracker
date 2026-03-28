const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');
const router = express.Router();

// ============ POSTS ============

// Get all posts
router.get('/posts', protect, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'email')
            .sort({ createdAt: -1 });
        
        const postsWithLikeCount = posts.map(post => ({
            ...post.toObject(),
            likeCount: post.likes.length,
            userLiked: post.likes.includes(req.user._id)
        }));
        
        res.json({ posts: postsWithLikeCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create post
router.post('/posts', protect, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        
        const post = await Post.create({
            user: req.user._id,
            title,
            content,
            category
        });
        
        const populatedPost = await Post.findById(post._id).populate('user', 'email');
        
        res.status(201).json({ post: populatedPost });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like post
router.post('/posts/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        const userIndex = post.likes.indexOf(req.user._id);
        
        if (userIndex === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(userIndex, 1);
        }
        
        await post.save();
        
        res.json({ likeCount: post.likes.length, liked: userIndex === -1 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete post
router.delete('/posts/:id', protect, async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Delete all comments for this post
        await Comment.deleteMany({ post: req.params.id });
        
        res.json({ message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ COMMENTS ============

// Get comments for a post
router.get('/posts/:postId/comments', protect, async (req, res) => {
    try {
        const comments = await Comment.find({ post: req.params.postId })
            .populate('user', 'email')
            .sort({ createdAt: -1 });
        
        const commentsWithLikeCount = comments.map(comment => ({
            ...comment.toObject(),
            likeCount: comment.likes.length,
            userLiked: comment.likes.includes(req.user._id)
        }));
        
        res.json({ comments: commentsWithLikeCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create comment
router.post('/posts/:postId/comments', protect, async (req, res) => {
    try {
        const { content } = req.body;
        
        const comment = await Comment.create({
            user: req.user._id,
            post: req.params.postId,
            content
        });
        
        const populatedComment = await Comment.findById(comment._id).populate('user', 'email');
        
        res.status(201).json({ comment: populatedComment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like comment
router.post('/comments/:id/like', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        const userIndex = comment.likes.indexOf(req.user._id);
        
        if (userIndex === -1) {
            comment.likes.push(req.user._id);
        } else {
            comment.likes.splice(userIndex, 1);
        }
        
        await comment.save();
        
        res.json({ likeCount: comment.likes.length, liked: userIndex === -1 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete comment
router.delete('/comments/:id', protect, async (req, res) => {
    try {
        const comment = await Comment.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        res.json({ message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;