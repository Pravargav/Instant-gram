import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://instant-gram-navy.vercel.app/api/instagram-profile');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setProfile(data);
        // window.localStorage.setItem("current_Logged_In_Id", profile.id);
      } catch (err) {
        console.error('Error fetching Instagram profile:', err);
        setError('Failed to load Instagram profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleBack = () => {
    window.localStorage.setItem("current_Logged_In_Id", profile.id);
    navigate('/dashboard'); // Navigate back to the dashboard
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">{error}</div>
        <button onClick={handleBack} className="back-button">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={handleBack} className="back-button">Back to Dashboard</button>
        <h1>Instagram Profile</h1>
      </div>

      {profile && (
        <div className="profile-card">
          {profile.profile_picture_url ? (
            <div className="profile-image">
              <img src={profile.profile_picture_url} alt={profile.username} />
            </div>
          ) : (
            <div className="profile-image">
              <div style={{ 
                width: '100%', 
                height: '100%', 
                background: '#f0f0f0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '60px',
                color: '#888'
              }}>
                {profile.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          )}
          
          <div className="profile-info">
            <h2>{profile.name || profile.username}</h2>
            <h3>@{profile.username}</h3>
            
            <div className="profile-stats">
              <div className="stat">
                <span className="value">{profile.media_count || 0}</span>
                <span className="label">Posts</span>
              </div>
              <div className="stat">
                <span className="value">{profile.account_type || 'Personal'}</span>
                <span className="label">Account Type</span>
              </div>
            </div>
            
            {profile.biography && (
              <div className="profile-bio">
                <h4>Bio</h4>
                <p>{profile.biography}</p>
              </div>
            )}
            
            {profile.website && (
              <div className="profile-website">
                <h4>Website</h4>
                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                  {profile.website}
                </a>
              </div>
            )}
            
            <div className="profile-meta">
              <div className="meta-item">
                <strong>Instagram ID:</strong> {profile.id}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;