import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Button } from './Button';
import { colors } from '../theme/colors';
import { spacing, layout } from '../theme/spacing';
import { typography } from '../theme/typography';
import { Input } from './Input';

// Secure API keys should ideally be passed through a secure backend proxy or process.env, 
// using a placeholder here for the client-side demonstration based on user requests.
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface TranscriptionRecorderProps {
    onTranscriptChange: (text: string) => void;
    onRecordingComplete: (uri: string, blob: Blob | null) => void;
}

export const TranscriptionRecorder: React.FC<TranscriptionRecorderProps> = ({
    onTranscriptChange,
    onRecordingComplete
}) => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [duration, setDuration] = useState(0);

    // Timer Effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                alert('Microphone permission is required to record archiving sessions.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // We use HIGH_QUALITY to give Gemini the best chance
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);
            setDuration(0);
            setTranscript(''); // Clear previous runs

            // Notify parent to clear form as well
            onTranscriptChange('');

        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecordingAndTranscribe = async () => {
        if (!recording) return;

        setIsRecording(false);
        setIsProcessing(true);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            if (!uri) throw new Error('No URI created for recording');

            // 1. Fetch the raw audio file from the device
            const response = await fetch(uri);
            const audioBlob = await response.blob();

            // Pass the audio back to the parent for the storage API
            onRecordingComplete(uri, audioBlob);

            // 2. Convert to Base64 for Gemini
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64data = reader.result?.toString().split(',')[1];

                if (base64data) {
                    try {
                        // Note: Mobile SDKs for gemini cannot stream audio cleanly in real-time chunking natively 
                        // without complex WebRTC bridges, so we process immediately post-recording as a "live" batch
                        // Switched to gemini-1.5-flash to bypass 2.0-flash quota exhaustion
                        const model = genAI.getGenerativeModel(
                            { model: "gemini-1.5-flash" },
                            { apiVersion: "v1beta" } // fallback to v1beta for 1.5-flash
                        );

                        const prompt = "Please transcribe the following audio file verbatim. Note: It may contain indigenous or non-english words, transcribe them phonetically if unsure.";

                        const result = await model.generateContent([
                            prompt,
                            {
                                inlineData: {
                                    mimeType: 'audio/m4a', // Mobile preset
                                    data: base64data
                                }
                            }
                        ]);

                        const textResponse = result.response.text();
                        setTranscript(textResponse);
                        onTranscriptChange(textResponse);

                    } catch (geminiError: any) {
                        console.error('Gemini Transcription Error:', geminiError);

                        // Handle 429 Quota Exceeded prominently
                        if (geminiError.message && geminiError.message.includes('429')) {
                            const errorMsg = 'Notice: AI transcription quota exceeded. Please manually type the transcript below.';
                            setTranscript(errorMsg);
                        } else {
                            const errorMsg = 'Notice: AI transcription failed or took too long. You may manually type the transcript below.';
                            setTranscript(errorMsg);
                        }
                    } finally {
                        setIsProcessing(false);
                    }
                }
            };

        } catch (err) {
            console.error('Failed to stop recording', err);
            setIsProcessing(false);
        }

        setRecording(null);
    };

    return (
        <View style={styles.container}>
            {/* Recording Control Unit */}
            <View style={[styles.controlBox, isRecording && styles.controlBoxActive]}>
                <View style={styles.timeRow}>
                    {isRecording && <View style={styles.recordingDot} />}
                    <Text style={[styles.timerText, isRecording && styles.timerTextActive]}>
                        {isRecording ? formatTime(duration) : 'Ready to Record'}
                    </Text>
                </View>

                {!isRecording ? (
                    <Button
                        title={transcript ? "Record Again" : "Start Voice Recording"}
                        onPress={startRecording}
                        disabled={isProcessing}
                        style={{ width: '100%' }}
                    />
                ) : (
                    <Button
                        title="Stop & Transcribe"
                        variant="outline"
                        onPress={stopRecordingAndTranscribe}
                        style={{ width: '100%', borderColor: colors.danger }}
                    />
                )}
            </View>

            {/* Processing State */}
            {isProcessing && (
                <View style={styles.processingPlate}>
                    <Text style={styles.processingText}>Gemini AI is analyzing audio structure...</Text>
                </View>
            )}

            {/* Transcript Result Area */}
            {(transcript !== '' || isProcessing) && (
                <View style={styles.transcriptBox}>
                    <Text style={styles.label}>Live AI Transcript / Field Notes</Text>
                    <Input
                        style={styles.textArea}
                        value={transcript}
                        onChangeText={(text) => {
                            setTranscript(text);
                            onTranscriptChange(text);
                        }}
                        multiline
                        numberOfLines={6}
                        placeholder="Transcript will appear here or you can type manually..."
                        placeholderTextColor={colors.textLight}
                    />
                    <Text style={styles.hintText}>You may edit the transcript prior to archiving to ensure phonetic accuracy.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: spacing.md,
    },
    controlBox: {
        backgroundColor: colors.bgLight,
        padding: spacing.lg,
        borderRadius: layout.borderRadius,
        borderWidth: 1,
        borderColor: colors.mutedGold,
        alignItems: 'center',
    },
    controlBoxActive: {
        borderColor: colors.terracotta,
        borderStyle: 'dashed',
        borderWidth: 2,
        backgroundColor: 'rgba(161, 75, 59, 0.05)',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.danger,
        marginRight: spacing.sm,
    },
    timerText: {
        ...typography.h3,
        color: colors.textLight,
    },
    timerTextActive: {
        color: colors.terracotta,
    },
    processingPlate: {
        marginVertical: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.parchment,
        borderRadius: layout.borderRadius,
        alignItems: 'center',
    },
    processingText: {
        ...typography.bodySmall,
        color: colors.forest,
        fontWeight: '600'
    },
    transcriptBox: {
        marginTop: spacing.lg,
    },
    label: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.burntUmber,
        marginBottom: spacing.xs,
    },
    textArea: {
        minHeight: 140,
        textAlignVertical: 'top',
    },
    hintText: {
        ...typography.bodySmall,
        color: colors.textLight,
        fontStyle: 'italic',
        marginTop: spacing.xs,
    }
});
