import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMic, FiVideo, FiUpload, FiArrowLeft, FiMapPin, FiClock, FiCheckCircle, FiX } from 'react-icons/fi';
import { submitAsset } from '../../services/assetService';
import apiClient from '../../services/apiClient';
import { Loader } from '../../components/Loader/Loader';
import { HeritageAudioPlayer } from './HeritageAudioPlayer';
import { useTranslation } from 'react-i18next';
import './UploadAsset.css';

type SubmissionType = 'BIO' | 'SONIC' | null;
type RecordingType = 'AUDIO' | 'VIDEO' | null;

export const UploadAsset = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [type, setType] = useState<SubmissionType>(null);
    const [formData, setFormData] = useState<any>({
        title: '',
        community: '',
        tribalMember: '',
        description: '',
        category: 'MEDICINAL',
        riskTier: 'LOW',
        performanceContext: 'FESTIVAL',
        lyrics: '',
        culturalMeaning: '',
        location: t('upload.detecting', 'Detecting...'),
        timestamp: new Date().toLocaleString()
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Media State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingType, setRecordingType] = useState<RecordingType>(null);
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
    const [mediaUploaded, setMediaUploaded] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

    const navigate = useNavigate();
    const [isLocating, setIsLocating] = useState(false);

    const detectLocation = () => {
        setIsLocating(true);
        setFormData((prev: any) => ({ ...prev, location: t('upload.searchingCoords', 'Searching for precise coordinates...') }));

        if (!navigator.geolocation) {
            setFormData((prev: any) => ({ ...prev, location: t('upload.geoNotSupported', 'Geolocation not supported') }));
            setIsLocating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                setFormData((prev: any) => ({
                    ...prev,
                    location: `${latitude.toFixed(6)}° N, ${longitude.toFixed(6)}° E(acc: ±${Math.round(accuracy)}m)`
                }));
                setIsLocating(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setFormData((prev: any) => ({ ...prev, location: t('upload.geoDenied', 'Permission denied or timed out') }));
                setIsLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Auto-detect on step 2
    useEffect(() => {
        if (step === 2) {
            detectLocation();
        }
    }, [step]);

    // Cleanup streams on unmount only (do NOT revoke mediaUrl early — it's still in use by the player)
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleTypeSelect = (selectedType: SubmissionType) => {
        setType(selectedType);
        setStep(2);
    };

    const startRecording = async (recType: RecordingType) => {
        try {
            const constraints = recType === 'VIDEO' ? { audio: true, video: true } : { audio: true };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (recType === 'VIDEO' && videoPreviewRef.current) {
                videoPreviewRef.current.srcObject = stream;
            }

            // Pick a MIME type the browser actually supports
            const preferredMime = recType === 'VIDEO'
                ? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' :
                    MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : '')
                : (MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
                    MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' :
                        MediaRecorder.isTypeSupported('audio/ogg;codecs=opus') ? 'audio/ogg;codecs=opus' : '');

            const mediaRecorder = preferredMime
                ? new MediaRecorder(stream, { mimeType: preferredMime })
                : new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                // Use the recorder's actual mimeType — never guess 'audio/wav'
                const actualMime = mediaRecorder.mimeType || (recType === 'VIDEO' ? 'video/webm' : 'audio/webm');
                const blob = new Blob(audioChunksRef.current, { type: actualMime });
                const url = URL.createObjectURL(blob);
                setMediaBlob(blob);
                setMediaUrl(url);
                setMediaUploaded(true);

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingType(recType);
        } catch (err) {
            console.error("Error accessing media devices:", err);
            alert("Could not access camera/microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingType(null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, _fileType: 'AUDIO' | 'VIDEO') => {
        const file = e.target.files?.[0];
        if (file) {
            if (mediaUrl) URL.revokeObjectURL(mediaUrl);
            const url = URL.createObjectURL(file);
            setMediaBlob(file);
            setMediaUrl(url);
            setMediaUploaded(true);
        }
    };

    const resetMedia = () => {
        if (mediaUrl) URL.revokeObjectURL(mediaUrl);
        setMediaUrl(null);
        setMediaBlob(null);
        setMediaUploaded(false);
    };

    const [submitError, setSubmitError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError('');
        try {
            let mediaFileId: string | undefined;
            if (mediaBlob) {
                const mime = mediaBlob.type || 'audio/webm';
                const ext = mime.includes('mp4') ? 'mp4'
                    : mime.includes('ogg') ? 'ogg'
                        : mime.includes('video') ? 'webm'
                            : 'webm';

                // ── Decoupled Local Upload Flow (BIO and SONIC) ──
                const fd = new FormData();
                fd.append('file', new File([mediaBlob], `recording.${ext}`, { type: mime }));
                const uploadRes = await apiClient.post<{ fileId: string }>('/storage/upload', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                mediaFileId = uploadRes.data.fileId;
            }

            // ── Step 2: submit asset to Dharohar DB ─────────────
            await submitAsset({
                type: type!,
                title: formData.title,
                description: formData.description,
                recordeeName: formData.tribalMember,
                communityName: formData.community,
                riskTier: formData.riskTier,
                ...(mediaFileId ? { mediaFileId } : {}),
                metadata: {
                    category: formData.category,
                    performanceContext: formData.performanceContext,
                    location: formData.location,
                    timestamp: formData.timestamp,
                }
            } as any);
            setSuccess(true);
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || t('upload.submitFailed', 'Submission failed. Please check your connection and try again.'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader label={t('upload.archivingLoader', 'Archiving submission...')} />;
    }

    if (success) {
        return (
            <div className="alert-success">
                <h3>{t('upload.submitSuccess', 'Governance Submission Successful')}</h3>
                <p>{t('upload.submitSuccessDesc', 'Your archival record has been timestamped and encrypted. It is now pending institutional review.')}</p>
                <div className="summary-pills">
                    <span className="pill"><FiCheckCircle /> {t('upload.metadataLogged', 'Metadata Logged')}</span>
                    {mediaUploaded && <span className="pill"><FiCheckCircle /> {t('upload.mediaEncrypted', 'Media Encrypted')}</span>}
                </div>
                <button className="primary-btn" onClick={() => navigate('/dashboard/assets/mine')}>{t('upload.viewSubmissions', 'View My Submissions')}</button>
            </div>
        );
    }

    if (step === 1) {
        return (
            <div className="upload-container">
                <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem', color: 'var(--color-burnt-umber)' }}>{t('upload.archivalInitiation', 'Archival Initiation')}</h2>
                    <p>{t('upload.selectStructure', 'Select the structure of the cultural knowledge you wish to preserve.')}</p>
                </header>

                <div className="selection-grid">
                    <div className="selection-card" onClick={() => handleTypeSelect('BIO')}>
                        <h3>DHAROHAR-BIO</h3>
                        <p>{t('upload.bioDesc', 'Biological knowledge, medicinal practices, agricultural techniques, and ecological wisdom.')}</p>
                    </div>
                    <div className="selection-card" onClick={() => handleTypeSelect('SONIC')}>
                        <h3>DHAROHAR-SONIC</h3>
                        <p>{t('upload.sonicDesc', 'Musical archives, ritual chants, oral histories, and performance media.')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="upload-container">
            <button className="back-btn" onClick={() => setStep(1)}>
                <FiArrowLeft /> {t('upload.backToSelection', 'Back to Selection')}
            </button>

            <div className="metadata-bar">
                <div className="metadata-item">
                    <FiMapPin /> <strong>{t('upload.location', 'Location:')}</strong> {formData.location}
                    <button
                        type="button"
                        className={`refresh-location-btn ${isLocating ? 'spinning' : ''}`}
                        onClick={detectLocation}
                        title={t('upload.redetectLocation', 'Re-detect precise location')}
                        disabled={isLocating}
                    >
                        <FiClock />
                    </button>
                </div>
                <div className="metadata-item">
                    <FiClock /> <strong>{t('upload.timestamp', 'Timestamp:')}</strong> {formData.timestamp}
                </div>
            </div>

            <form className="institutional-form" onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group half">
                        <label>{t('upload.assetTitle', 'Asset Title')}</label>
                        <input
                            required
                            type="text"
                            placeholder={t('upload.assetTitlePlaceholder', 'e.g. Monsoon Chants')}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="form-group half">
                        <label>{t('upload.submittingMember', 'Submitting Member Name')}</label>
                        <input
                            required
                            type="text"
                            placeholder={t('upload.tribalMemberPlaceholder', 'Full Name of Tribal Member')}
                            value={formData.tribalMember}
                            onChange={e => setFormData({ ...formData, tribalMember: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>{t('upload.communityOrigin', 'Community Origin')}</label>
                    <input
                        required
                        type="text"
                        placeholder={t('upload.communityPlaceholder', 'e.g. Warli Tribe')}
                        value={formData.community}
                        onChange={e => setFormData({ ...formData, community: e.target.value })}
                    />
                </div>

                {type === 'BIO' ? (
                    <>
                        <div className="form-group">
                            <label>{t('upload.knowledgeCategory', 'Knowledge Category')}</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="MEDICINAL">{t('upload.catMedicinal', 'Medicinal Practice')}</option>
                                <option value="AGRICULTURAL">{t('upload.catAgricultural', 'Agricultural Technique')}</option>
                                <option value="ECOLOGICAL">{t('upload.catEcological', 'Ecological Wisdom')}</option>
                                <option value="RITUAL">{t('upload.catRitual', 'Ritual Practice')}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('upload.voiceArchive', 'Voice Archive / Oral Description')}</label>
                            {!mediaUploaded ? (
                                <div className="media-actions">
                                    <button
                                        type="button"
                                        className={`media - btn ${isRecording ? 'recording' : ''} `}
                                        onClick={isRecording ? stopRecording : () => startRecording('AUDIO')}
                                    >
                                        <FiMic />
                                        {isRecording ? t('upload.stopRecording', 'Stop Recording') : t('upload.startVoice', 'Start Voice Recording')}
                                    </button>
                                    <label className="media-btn">
                                        <FiUpload /> {t('upload.uploadVoice', 'Upload Voice File')}
                                        <input
                                            type="file"
                                            accept="audio/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileUpload(e, 'AUDIO')}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="media-preview-container-custom">
                                    <HeritageAudioPlayer src={mediaUrl!} title={t('upload.voicePreview', 'Voice Archive Preview')} />
                                    <button type="button" className="remove-media-btn" onClick={resetMedia} title={t('upload.removeMedia', 'Remove Media')}>
                                        <FiX />
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="form-group">
                            <label>{t('upload.performanceContext', 'Performance Context')}</label>
                            <select value={formData.performanceContext} onChange={e => setFormData({ ...formData, performanceContext: e.target.value })}>
                                <option value="FESTIVAL">{t('upload.contextFestival', 'Festival / Celebration')}</option>
                                <option value="RITUAL">{t('upload.contextRitual', 'Sacred Ritual')}</option>
                                <option value="AGRICULTURAL">{t('upload.contextAgricultural', 'Seed/Harvest Time')}</option>
                                <option value="CELEBRATION">{t('upload.contextGathering', 'Community Gathering')}</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>{t('upload.sonicVisualMedia', 'Sonic & Visual Media')}</label>

                            {!mediaUploaded && isRecording && recordingType === 'VIDEO' && (
                                <div className="live-camera-preview">
                                    <video ref={videoPreviewRef} autoPlay muted playsInline />
                                    <div className="recording-indicator">
                                        <span className="dot"></span> REC
                                    </div>
                                </div>
                            )}

                            {!mediaUploaded ? (
                                <div className="media-actions">
                                    <button
                                        type="button"
                                        className={`media - btn ${isRecording && recordingType === 'AUDIO' ? 'recording' : ''} `}
                                        onClick={isRecording ? stopRecording : () => startRecording('AUDIO')}
                                        disabled={isRecording && recordingType === 'VIDEO'}
                                    >
                                        <FiMic />
                                        {isRecording && recordingType === 'AUDIO' ? t('upload.stopAudio', 'Stop Audio') : t('upload.recordAudio', 'Record Audio')}
                                    </button>
                                    <button
                                        type="button"
                                        className={`media - btn ${isRecording && recordingType === 'VIDEO' ? 'recording' : ''} `}
                                        onClick={isRecording ? stopRecording : () => startRecording('VIDEO')}
                                        disabled={isRecording && recordingType === 'AUDIO'}
                                    >
                                        <FiVideo />
                                        {isRecording && recordingType === 'VIDEO' ? t('upload.stopVideo', 'Stop Video') : t('upload.recordVideo', 'Record Video')}
                                    </button>
                                    <label className="media-btn">
                                        <FiUpload /> {t('upload.uploadMedia', 'Upload Media')}
                                        <input
                                            type="file"
                                            accept="audio/*,video/*"
                                            style={{ display: 'none' }}
                                            onChange={(e) => handleFileUpload(e, 'VIDEO')}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="media-preview-container-custom">
                                    {mediaBlob?.type.startsWith('video') ? (
                                        <video src={mediaUrl!} controls className="video-preview-player" />
                                    ) : (
                                        <HeritageAudioPlayer src={mediaUrl!} title={t('upload.sonicPreview', 'Sonic Archive Preview')} />
                                    )}
                                    <button type="button" className="remove-media-btn" onClick={resetMedia} title={t('upload.removeMedia', 'Remove Media')}>
                                        <FiX />
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className="form-group">
                    <label>{t('upload.detailedDescription', 'Detailed Description & Cultural Meaning')}</label>
                    <textarea
                        required
                        rows={4}
                        placeholder={t('upload.descriptionPlaceholder', 'Detailed historical context and significance...')}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label>{t('upload.riskTier', 'Sensitivity Risk Tier')}</label>
                        <select value={formData.riskTier} onChange={e => setFormData({ ...formData, riskTier: e.target.value })}>
                            <option value="LOW">{t('common.riskLow', 'Low Risk')}</option>
                            <option value="MEDIUM">{t('common.riskMedium', 'Moderate Risk')}</option>
                            <option value="HIGH">{t('common.riskHigh', 'High Risk')}</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    {submitError && (
                        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid #ef4444', borderRadius: '4px', color: '#7f1d1d', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                            ⚠ {submitError}
                        </div>
                    )}
                    <button type="submit" className="primary-btn" disabled={loading || isRecording}>
                        {loading ? t('upload.archiving', 'Archiving...') : t('upload.finalizeSubmission', 'Finalize Governance Submission')}
                    </button>
                </div>
            </form>
        </div>
    );
};
