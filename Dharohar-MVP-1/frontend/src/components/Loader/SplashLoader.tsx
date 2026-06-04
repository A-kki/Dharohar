import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Loader } from './Loader';

interface SplashLoaderProps {
    children: ReactNode;
}

/**
 * Ensures the Dharohar Institutional Loader is shown for at least 2.5 seconds
 * when the application first boots up, providing a premium entry experience.
 */
export const SplashLoader = ({ children }: SplashLoaderProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Enforce a 2.5s minimum load time
        const timer = setTimeout(() => {
            setIsExiting(true); // Trigger fade out animation

            // Wait for fade-out animation to finish (400ms defined in Loader.css)
            setTimeout(() => {
                setIsLoading(false);
            }, 400);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    // While initializing, mount the full screen styling
    if (isLoading) {
        return (
            <div style={{ position: 'relative', width: '100vw', height: '100vh', background: 'var(--color-parchment, #f5ebdc)' }}>
                <Loader label="Initializing Dharohar Ecosystem..." exiting={isExiting} />
            </div>
        );
    }

    return <>{children}</>;
};
