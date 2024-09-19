// src/components/GoogleLoginButton.js

import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { Button } from 'antd'; // Import Ant Design Button
import 'antd/dist/reset.css'; // Import Ant Design styles

const GoogleLoginButton = ({ setAuth }) => {
  // Function to handle the login success case
  const handleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential; // Extract token from the response

    try {
      // Make POST request to the backend with the Google OAuth token
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/google/`,
        { token }
      );

      // Store tokens in local storage
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);

      // Update authentication state with user info
      setAuth({ user: response.data.email, isAuthenticated: true });
    } catch (error) {
      // Handle any errors that occur during the request
      console.error('Login failed', error);
    }
  };

  // Handle login failure case
  const handleError = () => {
    console.error('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="button-container">
        <GoogleLogin
          onSuccess={handleSuccess} // On successful login
          onError={handleError}     // On login error
          render={(renderProps) => (
            <Button
            type="primary"
            icon={<img src="https://www.gstatic.com/images/branding/product/1x/gsa_logo_dark_24dp.png" alt="Google Logo" style={{ width: '20px', marginRight: '8px' }} />}
          >
            Sign in with Google
          </Button>
          )}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
