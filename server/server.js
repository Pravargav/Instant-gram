// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors({ origin: 'https://instant-gram-fr-pi.vercel.app' })); // Allow only your frontend
app.use(bodyParser.json());

app.post('/proxy/instagram/token', async (req, res) => {
  try {
    const { code } = req.body;
    
    const formData = new URLSearchParams();
    formData.append('client_id', '652405294325582');
    formData.append('client_secret', 'fe971954f18bcce5a514900b23efd451'); // Keep this secure on your server
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', 'https://instant-gram-fr-pi.vercel.app/callback');
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
    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Instagram token exchange error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to exchange Instagram code for token',
      details: error.response?.data || error.message
    });
  }
});

app.get('/api/instagram-media', async (req, res) => {
  try {
    const { currId ,accTok} = req.query;
    // const currId = '9846092805434911';
    // const accessToken = 'IGAAJRWZCHRX05BZAE1LTEtFSmYxRy13VUs2M2lFLVpBOC1fdUJ1WGMyZADlTczZAjZAUdJQ3p3cmhfdEhzYnBnd0RnQXFldS02VktDejd6ZAC1neVYycElSSVVEM0JXSE5UMDRvcWlPeGRxYTBMb2lfTHI0Y0pESzFVRDVNM0VGa0gxVQZDZD';
    
    const response = await axios.get(
      `https://graph.instagram.com/v22.0/${currId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${accTok}`
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Instagram media:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch Instagram media',
      details: error.response?.data || error.message
    });
  }
});

app.get('/api/instagram-reels', async (req, res) => {
  try {
    const { currId,accTok } = req.query;
    // const currId = '9846092805434911';
    // const accessToken = 'IGAAJRWZCHRX05BZAE1LTEtFSmYxRy13VUs2M2lFLVpBOC1fdUJ1WGMyZADlTczZAjZAUdJQ3p3cmhfdEhzYnBnd0RnQXFldS02VktDejd6ZAC1neVYycElSSVVEM0JXSE5UMDRvcWlPeGRxYTBMb2lfTHI0Y0pESzFVRDVNM0VGa0gxVQZDZD';
    
    // Fetch all media first
    const response = await axios.get(
      `https://graph.instagram.com/v22.0/${currId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username&access_token=${accTok}`
    );
    
    // Filter for VIDEO, REEL types and CAROUSEL_ALBUM with thumbnail_url
    const reelsOnly = response.data.data.filter(item => 
      (item.media_type === 'VIDEO' || 
       item.media_type === 'REEL' || 
      (item.media_type === 'CAROUSEL_ALBUM' && item.thumbnail_url)) &&
      item.media_url
    );
    
    res.json({
      data: reelsOnly,
      paging: response.data.paging
    });
  } catch (error) {
    console.error('Error fetching Instagram reels:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch Instagram reels',
      details: error.response?.data || error.message
    });
  }
});

// Route to fetch Instagram comments for a specific media
app.get('/api/instagram-comments', async (req, res) => {
  try {
    const { mediaId,accTok } = req.query;
    // const accessToken = 'IGAAJRWZCHRX05BZAE1LTEtFSmYxRy13VUs2M2lFLVpBOC1fdUJ1WGMyZADlTczZAjZAUdJQ3p3cmhfdEhzYnBnd0RnQXFldS02VktDejd6ZAC1neVYycElSSVVEM0JXSE5UMDRvcWlPeGRxYTBMb2lfTHI0Y0pESzFVRDVNM0VGa0gxVQZDZD';
    
    
    if (!mediaId) {
      return res.status(400).json({ error: 'Media ID is required' });
    }
    
    const response = await axios.get(
      `https://graph.instagram.com/v22.0/${mediaId}/comments`,
      {
        params: {
          fields: 'id,text,username,timestamp,like_count,replies{id,text,username,timestamp,like_count}',
          access_token: accTok
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Instagram comments:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Instagram API error',
        message: error.response.data.error?.message || 'Unknown error',
        code: error.response.data.error?.code || 'UNKNOWN'
      });
    } else if (error.request) {
      res.status(500).json({ error: 'No response from Instagram API' });
    } else {
      res.status(500).json({ error: 'Failed to fetch comments', message: error.message });
    }
  }
});


app.post('/api/instagram-comment-reply', async (req, res) => {
  try {
    const { commentId, message } = req.body;
    // const accessToken = 'IGAAJRWZCHRX05BZAE1LTEtFSmYxRy13VUs2M2lFLVpBOC1fdUJ1WGMyZADlTczZAjZAUdJQ3p3cmhfdEhzYnBnd0RnQXFldS02VktDejd6ZAC1neVYycElSSVVEM0JXSE5UMDRvcWlPeGRxYTBMb2lfTHI0Y0pESzFVRDVNM0VGa0gxVQZDZD';
    const {accTok}= req.query;
    if (!commentId) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }
    
    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Reply message cannot be empty' });
    }
    
    const response = await axios.post(
      `https://graph.instagram.com/v22.0/${commentId}/replies`,
      { message },
      {
        params: {
          access_token: accTok
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error posting Instagram comment reply:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        error: 'Instagram API error',
        message: error.response.data.error?.message || 'Unknown error',
        code: error.response.data.error?.code || 'UNKNOWN'
      });
    } else if (error.request) {
      res.status(500).json({ error: 'No response from Instagram API' });
    } else {
      res.status(500).json({ error: 'Failed to post reply', message: error.message });
    }
  }
});

app.get('/api/instagram-profile', async (req, res) => {
  try {
    // Using the same access token you used for media
    const {accTok} = req.query;
    // const accessToken = 'IGAAJRWZCHRX05BZAE1LTEtFSmYxRy13VUs2M2lFLVpBOC1fdUJ1WGMyZADlTczZAjZAUdJQ3p3cmhfdEhzYnBnd0RnQXFldS02VktDejd6ZAC1neVYycElSSVVEM0JXSE5UMDRvcWlPeGRxYTBMb2lfTHI0Y0pESzFVRDVNM0VGa0gxVQZDZD';
    
    // Call the Instagram Graph API /me endpoint
    const response = await axios.get(
      'https://graph.instagram.com/v22.0/me',
      {
        params: {
          fields: 'id,username,account_type,media_count,biography,website,name,profile_picture_url',
          access_token: accTok
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Instagram profile:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch Instagram profile',
      details: error.response?.data || error.message
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});