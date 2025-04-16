// src/components/InstagramAuth.jsx

import { useState, useEffect } from 'react';
import axios from 'axios';

const InstagramAuth = () => {
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  // Your Instagram App credentials
  const clientId = '652405294325582';
  const clientSecret = 'fe971954f18bcce5a514900b23efd451'; // In a real app, never expose this in client-side code
  const redirectUri = 'https://localhost:5173/callback';
  const scope = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish';

  // Check for authorization code on component mount (after redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      exchangeCodeForToken(code);
    }
  }, []);

  // Redirect to Instagram authorization page
  const handleLogin = () => {
    const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    window.location.href = authUrl;
  };

  // Exchange authorization code for access token
  const exchangeCodeForToken = async (code) => {
    setIsLoading(true);
    setError('');
    
    try {
      // In a real application, this request should be made from your backend
      // to keep your client_secret secure
      const formData = new URLSearchParams();
      formData.append('client_id', clientId);
      formData.append('client_secret', clientSecret);
      formData.append('grant_type', 'authorization_code');
      formData.append('redirect_uri', redirectUri);
      formData.append('code', code);
      
      const response = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      
      // Store the access token and user ID
      const token = response.data.access_token;
      const id = response.data.user_id;
      
      setAccessToken(token);
      setUserId(id);
      
      // Store in localStorage for persistence
      localStorage.setItem('instagram_access_token', token);
      localStorage.setItem('instagram_user_id', id);
      
      console.log('Authentication successful!');
    } catch (err) {
      setError('Failed to exchange code for token: ' + (err.message || 'Unknown error'));
      console.error('Error exchanging code for token:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="instagram-auth-container">
      <h2>Instagram Authentication</h2>
      
      {!accessToken ? (
        <button 
          onClick={handleLogin} 
          disabled={isLoading}
          className="login-button"
        >
          {isLoading ? 'Processing...' : 'Login with Instagram'}
        </button>
      ) : (
        <div className="auth-success">
          <p>Successfully authenticated!</p>
          <p>User ID: {userId}</p>
          <p>Access Token: {accessToken.substring(0, 10)}...</p>
        </div>
      )}
      
      {error && <p className="error-message">{error}</p>}
      
      {accessToken && (
        <div className="token-info">
          <h3>Your access token is stored in:</h3>
          <ul>
            <li>React state</li>
            <li>localStorage (for persistence)</li>
          </ul>
          <p>You can now use this token for further Instagram API operations.</p>
        </div>
      )}
    </div>
  );
};

export default InstagramAuth;