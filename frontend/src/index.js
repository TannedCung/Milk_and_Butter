import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import 'antd/dist/reset.css'; // Use 'antd/dist/antd.css' for the default Ant Design styles

ReactDOM.render(
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <Router> {/* Wrap App with Router */}
            <App />
        </Router>
    </GoogleOAuthProvider>,
    document.getElementById('root')
);