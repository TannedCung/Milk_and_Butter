import React, { useEffect, useRef, useState } from 'react';

const AnimatedWrapper = ({ 
    children, 
    animation = 'fadeIn', 
    delay = 0, 
    duration = 0.6, 
    className = '',
    threshold = 0.1,
    triggerOnce = true
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce) {
                        observer.unobserve(entry.target);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin: '50px'
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [threshold, triggerOnce]);

    const animationStyle = {
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        animationFillMode: 'both'
    };

    const animationClass = isVisible ? `animate-${animation}` : '';

    return (
        <div 
            ref={elementRef}
            className={`${animationClass} ${className}`}
            style={animationStyle}
        >
            {children}
        </div>
    );
};

// Preset animation components for common use cases
export const FadeIn = ({ children, delay = 0, className = '' }) => (
    <AnimatedWrapper animation="fadeIn" delay={delay} className={className}>
        {children}
    </AnimatedWrapper>
);

export const SlideInLeft = ({ children, delay = 0, className = '' }) => (
    <AnimatedWrapper animation="slideInLeft" delay={delay} className={className}>
        {children}
    </AnimatedWrapper>
);

export const SlideInRight = ({ children, delay = 0, className = '' }) => (
    <AnimatedWrapper animation="slideInRight" delay={delay} className={className}>
        {children}
    </AnimatedWrapper>
);

export const SlideInUp = ({ children, delay = 0, className = '' }) => (
    <AnimatedWrapper animation="slideInUp" delay={delay} className={className}>
        {children}
    </AnimatedWrapper>
);

export const SlideInDown = ({ children, delay = 0, className = '' }) => (
    <AnimatedWrapper animation="slideInDown" delay={delay} className={className}>
        {children}
    </AnimatedWrapper>
);

export const ScaleIn = ({ children, delay = 0, className = '' }) => (
    <AnimatedWrapper animation="scaleIn" delay={delay} className={className}>
        {children}
    </AnimatedWrapper>
);

// Stagger container for list animations
export const StaggerContainer = ({ children, staggerDelay = 0.1, className = '' }) => {
    return (
        <div className={`animate-stagger ${className}`}>
            {React.Children.map(children, (child, index) => (
                <AnimatedWrapper 
                    animation="fadeIn" 
                    delay={index * staggerDelay}
                    key={index}
                >
                    {child}
                </AnimatedWrapper>
            ))}
        </div>
    );
};

export default AnimatedWrapper; 