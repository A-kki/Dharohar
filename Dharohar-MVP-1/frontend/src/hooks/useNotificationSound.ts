import notificationSound from '../assets/Notification_Sound.wav';

/**
 * Returns a play() function that triggers the DHAROHAR notification sound.
 * Uses a fresh Audio instance each time so overlapping calls work correctly.
 * Silently swallows autoplay policy errors (e.g. user hasn't interacted yet).
 */
export const useNotificationSound = () => {
    const play = () => {
        const audio = new Audio(notificationSound);
        audio.play().catch(() => { /* silently ignore autoplay policy errors */ });
    };
    return play;
};
