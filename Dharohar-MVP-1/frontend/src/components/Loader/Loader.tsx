import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ceremonialSymbol from '../../assets/image copy 2.png';
import './Loader.css';

interface LoaderProps {
    label?: string;
    exiting?: boolean;
}

/**
 * DHAROHAR Global Loader
 *
 * A premium institutional loader using the ceremonial symbol.
 * Rotates slowly (10s linear infinite) over a soft parchment overlay.
 * Fades in on mount, pass `exiting` to trigger fade-out before unmount.
 *
 * Usage:
 *   <Loader />                        — default, no label
 *   <Loader label="Processing..." />  — with label
 */
export const Loader = ({ label, exiting }: LoaderProps) => {
    const [show, setShow] = useState(false);
    const { t } = useTranslation();

    // Defer mounting by one frame so the fade-in animation actually plays
    useEffect(() => {
        const raf = requestAnimationFrame(() => setShow(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    if (!show) return null;

    const displayLabel = label || t('common.loading', 'Loading...');

    return (
        <div className={`dharohar-loader-overlay ${exiting ? 'exiting' : ''}`} role="status" aria-label={displayLabel}>
            <div className="dharohar-loader-symbol-wrap">
                <div className="dharohar-loader-ring" aria-hidden="true" />
                <img
                    src={ceremonialSymbol}
                    alt=""
                    className="dharohar-loader-image"
                    draggable={false}
                />
            </div>
            {displayLabel && (
                <p className="dharohar-loader-label">{displayLabel}</p>
            )}
        </div>
    );
};

export default Loader;
