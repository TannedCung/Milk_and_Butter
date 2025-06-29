import React, { useState, useEffect } from 'react';
import { FadeIn, SlideInRight } from './AnimatedWrapper';

const AnimatedNotification = ({ 
    message, 
    type = 'info', 
    duration = 3000, 
    onClose,
    position = 'top-right' 
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300); // Wait for exit animation
    };

    const getTypeClass = () => {
        switch (type) {
            case 'success':
                return 'notification-success';
            case 'error':
                return 'notification-error';
            case 'warning':
                return 'notification-warning';
            default:
                return 'notification-info';
        }
    };

    const getTypeIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✗';
            case 'warning':
                return '⚠';
            default:
                return 'ℹ';
        }
    };

    const positionClass = `notification-${position}`;

    if (!isVisible) {
        return (
            <div className={`notification ${getTypeClass()} ${positionClass} notification-exit`}>
                <div className="notification-content">
                    <span className="notification-icon">{getTypeIcon()}</span>
                    <span className="notification-message">{message}</span>
                    <button 
                        onClick={handleClose}
                        className="notification-close"
                        aria-label="Close notification"
                    >
                        ×
                    </button>
                </div>
            </div>
        );
    }

    return (
        <SlideInRight className={`notification ${getTypeClass()} ${positionClass}`}>
            <div className="notification-content">
                <span className="notification-icon animate-bounce">{getTypeIcon()}</span>
                <span className="notification-message">{message}</span>
                <button 
                    onClick={handleClose}
                    className="notification-close"
                    aria-label="Close notification"
                >
                    ×
                </button>
            </div>
        </SlideInRight>
    );
};

// Hook for managing notifications
export const useNotification = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        const notification = { id, message, type, duration };
        
        setNotifications(prev => [...prev, notification]);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    const NotificationContainer = () => (
        <div className="notification-container">
            {notifications.map((notification) => (
                <AnimatedNotification
                    key={notification.id}
                    message={notification.message}
                    type={notification.type}
                    duration={notification.duration}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );

    return {
        notifications,
        addNotification,
        removeNotification,
        NotificationContainer,
        // Convenience methods
        success: (message, duration) => addNotification(message, 'success', duration),
        error: (message, duration) => addNotification(message, 'error', duration),
        warning: (message, duration) => addNotification(message, 'warning', duration),
        info: (message, duration) => addNotification(message, 'info', duration),
    };
};

export default AnimatedNotification; 