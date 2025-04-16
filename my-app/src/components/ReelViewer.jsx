import React, { useState, useEffect, useRef } from 'react';
import './ReelViewer.css';
import { useContext } from "react";
import { Appcontext } from "../App";

function ReelViewer() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const reelRefs = useRef([]);
  const {current_id ,currIdHelp,access_token,currAccTok} = useContext(Appcontext);
  useEffect(() => {
    const fetchInstagramReels = async () => {
      try {
        setLoading(true);
        const idToUse = current_id || currIdHelp;
        const accTokToUse = access_token || currAccTok;
        const response = await fetch(`https://instant-gram-navy.vercel.app/api/instagram-reels?currId=${idToUse}&accTok=${accTokToUse}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        // Filter for VIDEO, REEL types and CAROUSEL_ALBUM with thumbnail_url
        const videoReels = (data.data || []).filter(item => 
          item.media_type === 'VIDEO' || 
          item.media_type === 'REEL' || 
          (item.media_type === 'CAROUSEL_ALBUM' && item.thumbnail_url)
        );
        
        setReels(videoReels);
        reelRefs.current = videoReels.map(() => React.createRef());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Instagram reels:', err);
        setError('Failed to load Instagram reels. Please try again later.');
        setLoading(false);
      }
    };

    fetchInstagramReels();
  }, []);

  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        const index = Number(entry.target.dataset.index);
        const videoElement = reelRefs.current[index]?.current;
        
        if (entry.isIntersecting) {
          // Play the video that is in view
          if (videoElement && videoElement.paused) {
            videoElement.play().catch(err => console.error('Error playing video:', err));
            setCurrentReelIndex(index);
          }
        } else {
          // Pause the video that is out of view
          if (videoElement && !videoElement.paused) {
            videoElement.pause();
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: '0px',
      threshold: 0.7, // 70% of the item must be visible
    });

    // Observe all reel containers
    const reelContainers = document.querySelectorAll('.reel-container');
    reelContainers.forEach(container => {
      observer.observe(container);
    });

    return () => {
      reelContainers.forEach(container => {
        observer.unobserve(container);
      });
    };
  }, [reels.length]);

  // Function to navigate to next reel
  const goToNextReel = () => {
    if (currentReelIndex < reels.length - 1) {
      const nextIndex = currentReelIndex + 1;
      document.querySelectorAll('.reel-container')[nextIndex].scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Function to navigate to previous reel
  const goToPrevReel = () => {
    if (currentReelIndex > 0) {
      const prevIndex = currentReelIndex - 1;
      document.querySelectorAll('.reel-container')[prevIndex].scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderReel = (reel, index) => {
    const isCurrentReel = index === currentReelIndex;
    
    return (
      <div 
        className={`reel-container ${isCurrentReel ? 'active-reel' : ''}`} 
        key={reel.id} 
        data-index={index}
      >
        <div className="reel-content">
          <video 
            ref={reelRefs.current[index]}
            src={reel.media_url}
            loop
            playsInline
            preload="metadata"
            poster={reel.thumbnail_url || ''}
            controls={false}
            onClick={(e) => {
              const video = e.target;
              if (video.paused) {
                video.play();
              } else {
                video.pause();
              }
            }}
          />
          
          <div className="reel-info">
            <h3>{reel.username || 'Instagram User'}</h3>
            <p>{reel.caption || ''}</p>
            <div className="reel-progress">
              {isCurrentReel && <div className="progress-indicator"></div>}
            </div>
          </div>
          
          <div className="reel-controls">
            <button 
              className="play-pause-btn" 
              onClick={() => {
                const video = reelRefs.current[index].current;
                if (video.paused) {
                  video.play();
                } else {
                  video.pause();
                }
              }}
            >
              {reelRefs.current[index]?.current?.paused ? 'Play' : 'Pause'}
            </button>
            <div className="reel-actions">
              <span className="action-btn">❤️</span>
              <span className="action-btn">💬</span>
              <span className="action-btn">↗️</span>
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="navigation-controls">
            {currentReelIndex > 0 && (
              <button className="nav-btn prev-btn" onClick={goToPrevReel}>
                ↑
              </button>
            )}
            {currentReelIndex < reels.length - 1 && (
              <button className="nav-btn next-btn" onClick={goToNextReel}>
                ↓
              </button>
            )}
          </div>
          
          {/* Current reel indicator */}
          <div className="reel-counter">
            {currentReelIndex + 1} / {reels.length}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="ReelViewer">
      
      <main className="reels-container">
        {loading && <p className="loading-message">Loading reels...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!loading && !error && reels.length === 0 && (
          <p className="no-reels-message">No Instagram reels found.</p>
        )}
        
        {reels.map((reel, index) => renderReel(reel, index))}
      </main>
    </div>
  );
}

export default ReelViewer;