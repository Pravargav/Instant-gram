import React, { useState, useEffect } from 'react';
import './ImageViewer.css';
import { useContext } from "react";
import { Appcontext } from "../App";

function ImageViewer() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeComments, setActiveComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [replyStates, setReplyStates] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});
  const {current_id ,currIdHelp,accesss_token,currAccTok } = useContext(Appcontext);

  useEffect(() => {
    const fetchInstagramMedia = async () => {
      try {
        setLoading(true);
        const idToUse = current_id || currIdHelp;
        const accToktoUse= currAccTok ||accesss_token;
        const response = await fetch(`https://instant-gram-navy.vercel.app/api/instagram-media?currId=${idToUse}&accTok=${accToktoUse}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setMedia(data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Instagram media:', err);
        setError('Failed to load Instagram media. Please try again later.');
        setLoading(false);
      }
    };

    fetchInstagramMedia();
  }, []);

  const fetchComments = async (mediaId) => {
    try {
      // Set loading state for this specific media item
      setLoadingComments(prev => ({ ...prev, [mediaId]: true }));
      const accToktoUse= currAccTok ||accesss_token;
      const response = await fetch(`https://instant-gram-navy.vercel.app/api/instagram-comments?mediaId=${mediaId}&accTok=${accToktoUse}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update active comments state
      setActiveComments(prev => ({
        ...prev,
        [mediaId]: data.data || []
      }));
    } catch (err) {
      console.error(`Error fetching comments for media ${mediaId}:`, err);
      // Store the error in active comments so we can display it
      setActiveComments(prev => ({
        ...prev,
        [mediaId]: { error: 'Failed to load comments. Please try again.' }
      }));
    } finally {
      // Clear loading state
      setLoadingComments(prev => ({ ...prev, [mediaId]: false }));
    }
  };

  const toggleComments = (mediaId) => {
    // If we already have comments for this media, toggle visibility
    if (activeComments[mediaId]) {
      setActiveComments(prev => {
        const newState = { ...prev };
        delete newState[mediaId];
        return newState;
      });
    } else {
      // Otherwise fetch the comments
      fetchComments(mediaId);
    }
  };

  // Toggle reply form for a specific comment
  const toggleReplyForm = (commentId) => {
    setReplyStates(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Handle reply input change
  const handleReplyChange = (commentId, value) => {
    setReplyStates(prev => ({
      ...prev,
      [commentId]: value
    }));
  };

  // Submit a reply to a comment
  const submitReply = async (commentId, mediaId) => {
    const replyText = replyStates[commentId];
    
    if (!replyText || replyText.trim() === '') {
      return; // Don't submit empty replies
    }
    
    try {
      setSubmittingReply(prev => ({ ...prev, [commentId]: true }));
      const accToktoUse= currAccTok ||accesss_token;
      const response = await fetch(`https://instant-gram-navy.vercel.app/api/instagram-comment-reply?accTok=${accToktoUse}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          commentId: commentId,
          message: replyText
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post reply');
      }
      
      // Reply posted successfully, clear the input and refresh comments
      setReplyStates(prev => {
        const newState = { ...prev };
        delete newState[commentId];
        return newState;
      });
      
      // Refresh comments to show the new reply
      fetchComments(mediaId);
      
    } catch (err) {
      console.error('Error posting reply:', err);
      alert(`Failed to post reply: ${err.message}`);
    } finally {
      setSubmittingReply(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const renderComments = (mediaId) => {
    const comments = activeComments[mediaId];
    const isLoading = loadingComments[mediaId];

    if (isLoading) {
      return <div className="comments-loading">Loading comments...</div>;
    }

    if (!comments || comments.length === 0) {
      return <div className="no-comments">No comments found.</div>;
    }

    if (comments.error) {
      return <div className="comments-error">{comments.error}</div>;
    }

    return (
      <div className="comments-section">
        <h4>Comments</h4>
        <ul className="comments-list">
          {comments.map(comment => (
            <li key={comment.id} className="comment">
              <div className="comment-content">
                <strong>{comment.username}</strong>: {comment.text}
                <button 
                  className="reply-button"
                  onClick={() => toggleReplyForm(comment.id)}
                >
                  Reply
                </button>
              </div>
              
              {/* Reply form */}
              {replyStates[comment.id] && (
                <div className="reply-form">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={typeof replyStates[comment.id] === 'string' ? replyStates[comment.id] : ''}
                    onChange={(e) => handleReplyChange(comment.id, e.target.value)}
                    disabled={submittingReply[comment.id]}
                  />
                  <button 
                    onClick={() => submitReply(comment.id, mediaId)}
                    disabled={submittingReply[comment.id]}
                  >
                    {submittingReply[comment.id] ? 'Posting...' : 'Post'}
                  </button>
                </div>
              )}
              
              {/* Display existing replies */}
              {comment.replies && comment.replies.data && comment.replies.data.length > 0 && (
                <ul className="replies-list">
                  {comment.replies.data.map(reply => (
                    <li key={reply.id} className="reply">
                      <strong>{reply.username}</strong>: {reply.text}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderMediaItem = (item) => {
    switch (item.media_type) {
      case 'IMAGE':
        return (
          <div className="media-item">
            <img src={item.media_url} alt={item.caption || 'Instagram image'} />
            <p>{item.caption}</p>
          </div>
        );
      case 'CAROUSEL_ALBUM':
        // For carousel albums, we just show a placeholder as the API doesn't return all images in one call
        return (
          <div className="media-item">
            <img src={item.media_url || item.thumbnail_url} alt={item.caption || 'Instagram carousel'} />
            <p>{item.caption} (Carousel Album)</p>
          </div>
        );
      default:
        return (
          <div className="media-item">
            <p>Unsupported media type: {item.media_type}</p>
          </div>
        );
    }
  };

  return (
    <div className="ImageViewer">
      <header className="ImageViewer-header">
        <h1>Instagram Media Feed</h1>
      </header>
      <main>
        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        
        {!loading && !error && media.length === 0 && (
          <p>No Instagram media found.</p>
        )}
        
        <div className="media-grid">
          {media.map(item => (
            <div key={item.id} className="media-container">
              {renderMediaItem(item)}
              <div className="media-actions">
                <button 
                  className={`comments-button ${activeComments[item.id] ? 'active' : ''}`}
                  onClick={() => toggleComments(item.id)}
                >
                  {activeComments[item.id] ? 'Hide Comments' : 'Show Comments'}
                </button>
              </div>
              {activeComments[item.id] && (
                <div className="comments-container">
                  {renderComments(item.id)}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default ImageViewer;