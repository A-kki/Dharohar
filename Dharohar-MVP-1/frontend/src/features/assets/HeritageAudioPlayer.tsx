import React, { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';
import './HeritageAudioPlayer.css';

interface HeritageAudioPlayerProps {
    src: string;
    title?: string;
}

export const HeritageAudioPlayer: React.FC<HeritageAudioPlayerProps> = ({ src, title = "Play Archive" }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!audioRef.current) return;
        const current = audioRef.current.currentTime;
        const total = audioRef.current.duration;
        setCurrentTime(current);
        setProgress((current / total) * 100);
    };

    const handleLoadedMetadata = () => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!audioRef.current || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        let clientX: number;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
        } else {
            clientX = (e as React.MouseEvent).clientX;
        }

        const offset = clientX - rect.left;
        const newProgress = (offset / rect.width) * 100;
        const newTime = (offset / rect.width) * duration;

        audioRef.current.currentTime = newTime;
        setProgress(newProgress);
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // Reset when src changes
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
    }, [src]);

    return (
        <div className="heritage-audio-player">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            <button
                type="button"
                className="play-toggle"
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
            >
                {isPlaying ? <FiPause /> : <FiPlay className="play-icon-triangle" />}
            </button>

            <div className="audio-info">
                <span className="audio-title">{title}</span>
                {duration > 0 && (
                    <span className="audio-time">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                )}
            </div>

            <div className="progress-container" onClick={handleSeek}>
                <div className="progress-track">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
