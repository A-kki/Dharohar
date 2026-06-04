import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

interface PageTransitionProps {
    children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransitionStage] = useState('fadeInUp'); // Base animation class

    useEffect(() => {
        if (location.pathname !== displayLocation.pathname) {
            // Re-trigger animation on route change
            setTransitionStage('');

            // Allow DOM to process empty state, then trigger animation class
            const timer1 = setTimeout(() => {
                setDisplayLocation(location);
                setTransitionStage('fadeInUp');
            }, 50);

            return () => clearTimeout(timer1);
        }
    }, [location, displayLocation]);

    return (
        <div className={`page-transition-wrapper ${transitionStage}`}>
            {children}
        </div>
    );
};
