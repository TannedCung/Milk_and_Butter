import { useState, useCallback } from 'react';

const useAnimatedLoading = (initialState = false) => {
    const [isLoading, setIsLoading] = useState(initialState);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);

    const startLoading = useCallback(() => {
        setIsLoading(true);
        setIsSuccess(false);
        setIsError(false);
    }, []);

    const stopLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    const setSuccess = useCallback(() => {
        setIsLoading(false);
        setIsSuccess(true);
        setIsError(false);
        // Auto-reset success state after 2 seconds
        setTimeout(() => {
            setIsSuccess(false);
        }, 2000);
    }, []);

    const setError = useCallback(() => {
        setIsLoading(false);
        setIsError(true);
        setIsSuccess(false);
        // Auto-reset error state after 3 seconds
        setTimeout(() => {
            setIsError(false);
        }, 3000);
    }, []);

    const reset = useCallback(() => {
        setIsLoading(false);
        setIsSuccess(false);
        setIsError(false);
    }, []);

    // Generate appropriate CSS classes for animations
    const getButtonClasses = useCallback((baseClasses = '') => {
        let classes = baseClasses;
        
        if (isLoading) {
            classes += ' loading-state animate-pulse';
        }
        
        if (isSuccess) {
            classes += ' success-state animate-bounce';
        }
        
        if (isError) {
            classes += ' error-state animate-shake';
        }
        
        return classes.trim();
    }, [isLoading, isSuccess, isError]);

    // Get loading spinner component
    const LoadingSpinner = useCallback(() => {
        if (!isLoading) return null;
        return <span className="loading-spinner" />;
    }, [isLoading]);

    // Get success icon component
    const SuccessIcon = useCallback(() => {
        if (!isSuccess) return null;
        return <span className="success-icon">✓</span>;
    }, [isSuccess]);

    // Get error icon component
    const ErrorIcon = useCallback(() => {
        if (!isError) return null;
        return <span className="error-icon">✗</span>;
    }, [isError]);

    return {
        isLoading,
        isSuccess,
        isError,
        startLoading,
        stopLoading,
        setSuccess,
        setError,
        reset,
        getButtonClasses,
        LoadingSpinner,
        SuccessIcon,
        ErrorIcon
    };
};

export default useAnimatedLoading; 