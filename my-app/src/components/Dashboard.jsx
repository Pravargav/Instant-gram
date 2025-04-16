import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleViewMedia = () => {
    navigate('/media-viewer'); // This will navigate to your MediaViewer component
  };

  const handleViewProfile = () => {
    navigate('/profile'); // This will navigate to your Profile component
  };

  const handleViewReels = () => {
    navigate('/reels-viewer'); // This will navigate to your Profile component
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Instagram Dashboard</h2>
      <div className="token-display">
        <h3>Access Token!!</h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={handleViewMedia}
            style={{
              padding: '10px 20px',
              background: '#405DE6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '20px'
            }}
          >
            View Instagram Media
          </button>
          <button 
            onClick={handleViewProfile}
            style={{
              padding: '10px 20px',
              background: '#5851DB',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '20px'
            }}
          >
            View Instagram Profile
          </button>
          <button 
            onClick={handleViewReels}
            style={{
              padding: '10px 20px',
              background: '#5851DB',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              marginTop: '20px'
            }}
          >
            View Instagram Reels
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;