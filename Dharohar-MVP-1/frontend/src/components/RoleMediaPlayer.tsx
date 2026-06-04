import { useRef, useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';
import { getSonicPlayUrl } from '../services/assetService';
import './RoleMediaPlayer.css';

interface RoleMediaPlayerProps {
    src: string;
    /** 'full' = unlimited. 'preview' = capped at previewSeconds (default 30). */
    mode: 'full' | 'preview';
    previewSeconds?: number;
    label?: string;
    /** If true the player uses <video> regardless of extension */
    forceVideo?: boolean;
    /** The original asset id (for resolving SONIC play urls) */
    assetId?: string;
    /** The type of the asset */
    assetType?: 'BIO' | 'SONIC';
}

/**
 * Shared media player used across all roles.
 * - Community / Review / Admin → mode="full" (no time restriction)
 * - Public / General (no license) → mode="preview" (stops at 30 s)
 */
export const RoleMediaPlayer = ({
    src,
    mode,
    previewSeconds = 30,
    label,
    forceVideo = false,
    assetId,
    assetType,
}: RoleMediaPlayerProps) => {
    const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const [previewEnded, setPreviewEnded] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isVideo = forceVideo || /\.(mp4|ogv)$/i.test(src) || /\.(mp4|ogv)$/i.test(resolvedSrc || '');

    useEffect(() => {
        const resolveUrl = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // If it is explicitly marked as a SONIC asset, we have the assetId, and it is NOT a local upload
                if (assetType === 'SONIC' && assetId && !src.startsWith('/api/uploads/')) {
                    const cleanId = assetId.includes('/') ? assetId.substring(assetId.lastIndexOf('/') + 1) : assetId;
                    const s3url = await getSonicPlayUrl(cleanId);
                    setResolvedSrc(s3url);
                    return;
                }

                // If no explicit type was passed, fallback to checking src if it's NOT a storage URL
                // Wait, if assetDynamoService injects /storage/assetId for SONIC assets, the src DOES contain /storage/.
                // This means the frontend was incorrectly treating it as a standard GridFS URL.
                // If assetType === 'SONIC' wasn't provided but it is SONIC, we'd fail. 
                // That's why we MUST pass assetType='SONIC' from the parent components.

                // For all other cases (e.g., BIO or explicit storage URLs without SONIC type)
                setResolvedSrc(src);
            } catch (err) {
                console.error("Failed to resolve media URL:", err);
                setError("Failed to load media file.");
            } finally {
                setIsLoading(false);
            }
        };

        resolveUrl();
    }, [src, assetId, assetType]);

    // Preview mode: pause at previewSeconds and show a nudge
    useEffect(() => {
        if (mode !== 'preview' || isVideo) return; // Video preview handled via native events in our current setup or we can add it below. Let's just handle audio. Wait, video preview uses the same.
        const el = mediaRef.current;
        if (!el) return;

        const onTimeUpdate = () => {
            if (el.currentTime >= previewSeconds) {
                el.pause();
                el.currentTime = previewSeconds;
                setPreviewEnded(true);
                setIsPlaying(false);
            }
        };

        const onPlay = () => {
            setIsPlaying(true);
            if (previewEnded) {
                el.currentTime = 0;
                setPreviewEnded(false);
            }
        };

        const onPause = () => setIsPlaying(false);

        el.addEventListener('timeupdate', onTimeUpdate);
        el.addEventListener('play', onPlay);
        el.addEventListener('pause', onPause);
        return () => {
            el.removeEventListener('timeupdate', onTimeUpdate);
            el.removeEventListener('play', onPlay);
            el.removeEventListener('pause', onPause);
        };
    }, [mode, previewSeconds, previewEnded, isVideo]);

    // Format time (e.g., 0:00)
    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Custom Audio Handlers
    const togglePlay = () => {
        if (!mediaRef.current) return;
        if (isPlaying) {
            mediaRef.current.pause();
        } else {
            mediaRef.current.play();
        }
    };

    const handleTimeUpdate = () => {
        if (mediaRef.current) {
            setCurrentTime(mediaRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (mediaRef.current) {
            setDuration(mediaRef.current.duration);
        }
    };

    const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
        if (!mediaRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const fillPercentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newTime = fillPercentage * duration;
        mediaRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Clean up label by removing emojis if present for cleaner look that matches design
    const cleanLabel = label ? label.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim() : 'Audio Asset';

    return (
        <div className={`rmp-wrapper ${!isVideo ? 'is-audio' : 'is-video'}`}>
            {isVideo && label && <p className="rmp-label">{label}</p>}

            {isLoading ? (
                <div className="rmp-loading">Loading media...</div>
            ) : error ? (
                <div className="rmp-error">{error}</div>
            ) : (
                <div className={`rmp-player-area ${!isVideo ? 'custom-audio-area' : ''}`}>
                    {isVideo ? (
                        <video
                            ref={mediaRef as React.RefObject<HTMLVideoElement>}
                            controls
                            src={resolvedSrc!}
                            className="rmp-video"
                            preload="metadata"
                            onPlay={() => {
                                if (previewEnded) {
                                    mediaRef.current!.currentTime = 0;
                                    setPreviewEnded(false);
                                }
                            }}
                            onTimeUpdate={() => {
                                if (mode === 'preview' && mediaRef.current && mediaRef.current.currentTime >= previewSeconds) {
                                    mediaRef.current.pause();
                                    mediaRef.current.currentTime = previewSeconds;
                                    setPreviewEnded(true);
                                }
                            }}
                        />
                    ) : (
                        <div className="custom-audio-player">
                            <button className="custom-play-btn" onClick={togglePlay} type="button">
                                {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} style={{ marginLeft: '3px', marginTop: '1px' }} />}
                            </button>
                            <div className="custom-audio-content">
                                <div className="custom-audio-info">
                                    <span className="custom-audio-title">{cleanLabel}</span>
                                    <span className="custom-audio-time">
                                        {formatTime(currentTime)} / {formatTime(duration)}
                                    </span>
                                </div>
                                <div className="custom-audio-progress-container" onClick={handleSeek}>
                                    <div className="custom-audio-progress-bg">
                                        <div className="custom-audio-progress-fill" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                </div>
                            </div>
                            <audio
                                ref={mediaRef as React.RefObject<HTMLAudioElement>}
                                src={resolvedSrc!}
                                className="rmp-audio-hidden"
                                preload="metadata"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => setIsPlaying(false)}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Preview ended banner */}
            {mode === 'preview' && previewEnded && (
                <div className="rmp-preview-banner">
                    <span>🔒 {previewSeconds}-second preview ended</span>
                    <span className="rmp-preview-hint">Apply for a license to access the full file →</span>
                </div>
            )}

            {/* Static preview badge (before any play) */}
            {mode === 'preview' && !previewEnded && isVideo && (
                <div className="rmp-preview-badge">
                    🎧 {previewSeconds}s free preview
                </div>
            )}
        </div>
    );
};
