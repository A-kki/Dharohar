import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, KeyboardAvoidingView, Platform, SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { TranscriptionRecorder } from '../../src/components/TranscriptionRecorder';
import apiClient from '../../src/services/apiClient';

type SubmissionType = 'BIO' | 'SONIC' | null;

// ──────────────────────────────────────────────────────────────
// Shared corner-bracket card (matches web framed-section)
// ──────────────────────────────────────────────────────────────
const FramedCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
    <View style={[styles.framedCard, style]}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerBR} />
        {children}
    </View>
);

// ──────────────────────────────────────────────────────────────
// Page header (matching web layout — back button + serif title + diamond)
// ──────────────────────────────────────────────────────────────
const PageHeader = ({ title, onBack }: { title: string; onBack?: () => void }) => (
    <View style={styles.pageHeaderWrap}>
        {onBack ? (
            <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
                <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
        ) : <View style={styles.backBtn} />}
        <Text style={styles.pageTitle}>{title}</Text>
        <View style={styles.diamondRow}>
            <View style={styles.dividerLine} />
            <View style={styles.diamond} />
            <View style={styles.dividerLine} />
        </View>
    </View>
);

// ──────────────────────────────────────────────────────────────
// Step 1 — Archival Initiation (type selector)
// ──────────────────────────────────────────────────────────────
const TypeSelector = ({ onSelect }: { onSelect: (t: SubmissionType) => void }) => (
    <ScrollView contentContainerStyle={styles.scroll}>
        <PageHeader title="Upload Asset" />

        <FramedCard style={styles.archivalCard}>
            <Text style={styles.archivalTitle}>Archival Initiation</Text>
            <Text style={styles.archivalSubtitle}>
                Select the structure of the cultural knowledge you wish to preserve.
            </Text>

            {/* Side-by-side BIO / SONIC cards — matches web screenshot exactly */}
            <View style={styles.typeRow}>
                <TouchableOpacity
                    style={styles.typeCard}
                    onPress={() => onSelect('BIO')}
                    activeOpacity={0.8}
                >
                    <View style={styles.cornerTL} />
                    <View style={styles.cornerBR} />
                    <Text style={styles.typeCardTitle}>DHAROHAR-BIO</Text>
                    <Text style={styles.typeCardDesc}>
                        Biological knowledge, medicinal practices, agricultural techniques, and ecological wisdom.
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.typeCard}
                    onPress={() => onSelect('SONIC')}
                    activeOpacity={0.8}
                >
                    <View style={styles.cornerTL} />
                    <View style={styles.cornerBR} />
                    <Text style={styles.typeCardTitle}>DHAROHAR-SONIC</Text>
                    <Text style={styles.typeCardDesc}>
                        Musical archives, ritual chants, oral histories, and performance media.
                    </Text>
                </TouchableOpacity>
            </View>
        </FramedCard>
    </ScrollView>
);

// ──────────────────────────────────────────────────────────────
// Step 2 — Asset form
// ──────────────────────────────────────────────────────────────
export default function UploadScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [type, setType] = useState<SubmissionType>(null);
    const [formData, setFormData] = useState({
        title: '', community: '', description: '', category: 'MEDICINAL', riskTier: 'LOW',
    });
    const [transcript, setTranscript] = useState('');
    const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
    const [mediaUri, setMediaUri] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleTypeSelect = (t: SubmissionType) => { setType(t); setStep(2); };

    const submitForm = async () => {
        if (!formData.title || !formData.community) {
            setSubmitError('Please fill in the title and community fields.');
            return;
        }
        setIsSubmitting(true);
        setSubmitError('');
        try {
            let mediaFileId: string | undefined;
            if (mediaBlob && mediaUri) {
                const ext = mediaUri.split('.').pop() || 'm4a';
                const fd = new FormData();
                fd.append('file', { uri: mediaUri, type: `audio/${ext}`, name: `recording.${ext}` } as any);
                const up = await apiClient.post('/storage/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                mediaFileId = up.data.fileId;
            }
            const finalDesc = transcript
                ? `${formData.description}\n\n[LIVE AI TRANSCRIPT]\n${transcript}`
                : formData.description;

            await apiClient.post('/assets', {
                type: type!, title: formData.title, description: finalDesc,
                recordeeName: 'Mobile User', communityName: formData.community,
                riskTier: formData.riskTier,
                ...(mediaFileId ? { mediaFileId } : {}),
                metadata: { category: formData.category, source: 'MOBILE_APP', timestamp: new Date().toISOString() }
            });
            setStep(3);
        } catch (e: any) {
            setSubmitError(e.response?.data?.message || 'Submission failed. Check your connection.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success screen
    if (step === 3) {
        return (
            <SafeAreaView style={styles.page}>
                <View style={styles.successWrap}>
                    <FramedCard style={styles.successCard}>
                        <Text style={styles.successTitle}>Archive Preserved</Text>
                        <Text style={styles.successDesc}>
                            Your institutional record has been timestamped, encrypted, and submitted for review.
                        </Text>
                        <TouchableOpacity
                            style={styles.primaryBtn}
                            onPress={() => {
                                setStep(1); setType(null); setTranscript('');
                                setFormData({ title: '', community: '', description: '', category: 'MEDICINAL', riskTier: 'LOW' });
                                router.push('/(tabs)');
                            }}
                        >
                            <Text style={styles.primaryBtnText}>Return to Dashboard</Text>
                        </TouchableOpacity>
                    </FramedCard>
                </View>
            </SafeAreaView>
        );
    }

    // Step 1 — type selection
    if (step === 1) {
        return (
            <SafeAreaView style={styles.page}>
                <TypeSelector onSelect={handleTypeSelect} />
            </SafeAreaView>
        );
    }

    // Step 2 — form
    return (
        <SafeAreaView style={styles.page}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    <PageHeader title="Upload Asset" onBack={() => setStep(1)} />

                    <FramedCard>
                        <Text style={styles.formSectionTitle}>New DHAROHAR-{type} Archive</Text>

                        {!!submitError && (
                            <View style={styles.errorBox}>
                                <Text style={styles.errorText}>⚠ {submitError}</Text>
                            </View>
                        )}

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Asset Title</Text>
                            <TextInput style={styles.input} placeholder="e.g. Monsoon Chants"
                                placeholderTextColor={colors.textLight} value={formData.title}
                                onChangeText={t => setFormData({ ...formData, title: t })} />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Village / Community Origin</Text>
                            <TextInput style={styles.input} placeholder="e.g. Warli Tribe"
                                placeholderTextColor={colors.textLight} value={formData.community}
                                onChangeText={t => setFormData({ ...formData, community: t })} />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Context & Description</Text>
                            <TextInput style={[styles.input, styles.textArea]} multiline
                                placeholder="Historical context and significance..." placeholderTextColor={colors.textLight}
                                value={formData.description} onChangeText={t => setFormData({ ...formData, description: t })}
                                textAlignVertical="top" />
                        </View>

                        {/* Voice recording section */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Voice Archive / Oral Description</Text>
                            <TranscriptionRecorder
                                onTranscriptChange={setTranscript}
                                onRecordingComplete={(uri, blob) => { setMediaUri(uri); setMediaBlob(blob); }}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.primaryBtn, isSubmitting && { opacity: 0.6 }]}
                            onPress={submitForm} disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.primaryBtnText}>Finalize Governance Submission</Text>}
                        </TouchableOpacity>
                    </FramedCard>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#f5ebdc' },
    scroll: { paddingBottom: 48 },

    // ── Page Header ──
    pageHeaderWrap: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        alignItems: 'center',
    },
    backBtn: { alignSelf: 'flex-start', marginBottom: spacing.sm, minHeight: 24 },
    backBtnText: { fontSize: 14, color: colors.burntUmber, fontWeight: '500' },
    pageTitle: {
        fontFamily: 'serif', fontSize: 32, fontWeight: '800',
        color: colors.burntUmber, fontStyle: 'italic', textAlign: 'center', marginBottom: 8,
    },
    diamondRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.lg },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.mutedGold, opacity: 0.5 },
    diamond: { width: 8, height: 8, backgroundColor: colors.mutedGold, transform: [{ rotate: '45deg' }] },

    // ── Framed card ──
    framedCard: {
        backgroundColor: '#fff',
        borderWidth: 1, borderColor: 'rgba(183,144,61,0.3)', borderRadius: 4,
        padding: spacing.xl, marginHorizontal: spacing.lg,
        marginBottom: spacing.md, position: 'relative',
    },
    cornerTL: {
        position: 'absolute', top: -1, left: -1, width: 14, height: 14,
        borderTopWidth: 2, borderLeftWidth: 2, borderColor: colors.burntUmber, borderTopLeftRadius: 2,
    },
    cornerBR: {
        position: 'absolute', bottom: -1, right: -1, width: 14, height: 14,
        borderBottomWidth: 2, borderRightWidth: 2, borderColor: colors.burntUmber, borderBottomRightRadius: 2,
    },

    // ── Archival Initiation card (step 1) ──
    archivalCard: { alignItems: 'center' },
    archivalTitle: {
        fontFamily: 'serif', fontSize: 28, fontWeight: '800',
        color: colors.burntUmber, fontStyle: 'italic',
        textAlign: 'center', marginBottom: 8,
    },
    archivalSubtitle: {
        fontSize: 14, color: colors.textLight, textAlign: 'center',
        marginBottom: spacing.xl, lineHeight: 21,
    },
    typeRow: { flexDirection: 'row', gap: 12, width: '100%' },
    typeCard: {
        flex: 1, borderWidth: 1, borderColor: colors.mutedGold, borderRadius: 4,
        padding: spacing.lg, backgroundColor: '#fff',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
        position: 'relative',
    },
    typeCardTitle: {
        fontFamily: 'serif', fontSize: 15, fontWeight: '800',
        color: colors.terracotta, letterSpacing: 1,
        textAlign: 'center', marginBottom: 8,
    },
    typeCardDesc: {
        fontSize: 12, color: colors.textLight, textAlign: 'center', lineHeight: 18,
    },

    // ── Form (step 2) ──
    formSectionTitle: {
        fontFamily: 'serif', fontSize: 20, fontWeight: '700',
        color: colors.burntUmber, marginBottom: spacing.lg,
    },
    fieldGroup: { marginBottom: spacing.md },
    label: { fontSize: 13, fontWeight: '600', color: colors.textMain, marginBottom: 6 },
    input: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: colors.mutedGold,
        borderRadius: 2, padding: spacing.md, fontSize: 15, color: colors.textMain,
    },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    errorBox: {
        padding: spacing.sm, backgroundColor: 'rgba(239,68,68,0.08)',
        borderWidth: 1, borderColor: '#ef4444', borderRadius: 4, marginBottom: spacing.md,
    },
    errorText: { color: '#7f1d1d', fontSize: 13 },
    primaryBtn: {
        backgroundColor: colors.terracotta, borderRadius: 2,
        padding: spacing.md, alignItems: 'center', marginTop: spacing.sm,
    },
    primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1 },

    // ── Success ──
    successWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    successCard: { alignItems: 'center' },
    successTitle: {
        fontFamily: 'serif', fontSize: 26, fontWeight: '700',
        color: '#1fa363', marginBottom: spacing.md,
    },
    successDesc: {
        fontSize: 14, color: colors.textLight, textAlign: 'center',
        lineHeight: 21, marginBottom: spacing.lg,
    },
});
