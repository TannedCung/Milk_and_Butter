// src/components/GoogleLoginButton.js

import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import './GoogleLoginButton.css'; // Create a separate CSS file for specific styles

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

      // Destructure the tokens and user data from the response
      const { access_token, refresh_token, user } = response.data;

      // Store tokens in local storage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);

      // Update authentication state with user info
      setAuth({ user, isAuthenticated: true });
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
            <button 
              className="google-login-button"
              onClick={renderProps.onClick} 
              disabled={renderProps.disabled}
            >
              Sign in with Google
            </button>
          )}
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginButton;
