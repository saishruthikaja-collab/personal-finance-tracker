import React, { useState, useEffect } from 'react';
import { getPosts, createPost, likePost, deletePost } from '../../services/api';
import { getComments, createComment, likeComment, deleteComment } from '../../services/api';
import './Forum.css';

const Forum = () => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    
    const user = JSON.parse(localStorage.getItem('user'));
    const categories = ['Budgeting', 'Saving', 'Investing', 'Debt', 'Tips', 'General'];
    
    useEffect(() => {
        fetchPosts();
    }, []);
    
    const fetchPosts = async () => {
        try {
            const data = await getPosts();
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };
    
    const fetchComments = async (postId) => {
        try {
            const data = await getComments(postId);
            setComments(data.comments || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };
    
    const handleCreatePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createPost(newPost);
            setShowCreatePost(false);
            setNewPost({ title: '', content: '', category: 'General' });
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleLikePost = async (postId) => {
        try {
            await likePost(postId);
            fetchPosts();
            if (selectedPost && selectedPost._id === postId) {
                fetchComments(postId);
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };
    
    const handleDeletePost = async (postId) => {
        if (window.confirm('Delete this post?')) {
            try {
                await deletePost(postId);
                if (selectedPost && selectedPost._id === postId) {
                    setSelectedPost(null);
                }
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };
    
    const handleCreateComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        
        try {
            await createComment(selectedPost._id, newComment);
            setNewComment('');
            fetchComments(selectedPost._id);
        } catch (error) {
            console.error('Error creating comment:', error);
        }
    };
    
    const handleLikeComment = async (commentId) => {
        try {
            await likeComment(commentId);
            fetchComments(selectedPost._id);
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };
    
    const handleDeleteComment = async (commentId) => {
        if (window.confirm('Delete this comment?')) {
            try {
                await deleteComment(commentId);
                fetchComments(selectedPost._id);
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };
    
    const openPost = async (post) => {
        setSelectedPost(post);
        await fetchComments(post._id);
    };
    
    return (
        <div className="forum-container">
            <div className="forum-header">
                <h2>💬 Community Forum</h2>
                <p className="forum-subtitle">Share financial tips and learn from others</p>
                <button className="create-post-btn" onClick={() => setShowCreatePost(!showCreatePost)}>
                    {showCreatePost ? 'Cancel' : '+ New Post'}
                </button>
            </div>
            
            {showCreatePost && (
                <div className="create-post-form">
                    <h3>Create New Post</h3>
                    <form onSubmit={handleCreatePost}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={newPost.title}
                            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                            required
                        />
                        <select
                            value={newPost.category}
                            onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <textarea
                            placeholder="Write your financial tip or question..."
                            value={newPost.content}
                            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                            rows="5"
                            required
                        ></textarea>
                        <button type="submit" disabled={loading}>Publish Post</button>
                    </form>
                </div>
            )}
            
            <div className="forum-content">
                {/* Posts List */}
                <div className="posts-list">
                    <h3>Latest Posts</h3>
                    {posts.length === 0 ? (
                        <p className="no-posts">No posts yet. Be the first to share a tip!</p>
                    ) : (
                        posts.map(post => (
                            <div 
                                key={post._id} 
                                className={`post-card ${selectedPost?._id === post._id ? 'active' : ''}`}
                                onClick={() => openPost(post)}
                            >
                                <div className="post-header">
                                    <span className="post-category">{post.category}</span>
                                    <span className="post-date">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="post-title">{post.title}</h4>
                                <p className="post-preview">{post.content.substring(0, 100)}...</p>
                                <div className="post-meta">
                                    <span>👤 {post.user?.email}</span>
                                    <span>❤️ {post.likeCount} likes</span>
                                    {post.user?._id === user?.id && (
                                        <button 
                                            className="delete-post-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeletePost(post._id);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {/* Comments Section */}
                {selectedPost && (
                    <div className="comments-section">
                        <div className="comments-header">
                            <h3>{selectedPost.title}</h3>
                            <button className="close-comments" onClick={() => setSelectedPost(null)}>✕</button>
                        </div>
                        <div className="post-detail">
                            <p>{selectedPost.content}</p>
                            <div className="post-actions">
                                <button 
                                    className="like-btn"
                                    onClick={() => handleLikePost(selectedPost._id)}
                                >
                                    ❤️ {selectedPost.likeCount || 0} Likes
                                </button>
                                <span className="post-category">📁 {selectedPost.category}</span>
                            </div>
                        </div>
                        
                        <div className="comments-list">
                            <h4>Comments ({comments.length})</h4>
                            {comments.length === 0 ? (
                                <p className="no-comments">No comments yet. Be the first to reply!</p>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment._id} className="comment-card">
                                        <div className="comment-header">
                                            <span className="comment-user">👤 {comment.user?.email}</span>
                                            <span className="comment-date">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="comment-content">{comment.content}</p>
                                        <div className="comment-actions">
                                            <button 
                                                className="like-btn small"
                                                onClick={() => handleLikeComment(comment._id)}
                                            >
                                                ❤️ {comment.likeCount || 0}
                                            </button>
                                            {comment.user?._id === user?.id && (
                                                <button 
                                                    className="delete-comment-btn"
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        <form onSubmit={handleCreateComment} className="add-comment-form">
                            <textarea
                                placeholder="Write a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows="3"
                            ></textarea>
                            <button type="submit">Post Comment</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Forum;