import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator, SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import apiClient from '../../src/services/apiClient';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Asset {
  _id: string;
  title: string;
  communityName: string;
  type: 'BIO' | 'SONIC';
  approvalStatus: ApprovalStatus;
  createdAt: string;
  riskTier?: string;
  description?: string;
  recordeeName?: string;
  reviewComment?: string;
  mediaUrl?: string;
  transcript?: string;
  metadata?: Record<string, any>;
}

// ── Status badge — dot + colored text + border ──────────────────
const StatusBadge = ({ status }: { status: ApprovalStatus }) => {
  const cfg = {
    PENDING: { border: '#c47d0e', text: '#c47d0e', dot: '#c47d0e', label: 'PENDING' },
    APPROVED: { border: '#1fa363', text: '#1fa363', dot: '#1fa363', label: 'APPROVED' },
    REJECTED: { border: '#dc2626', text: '#dc2626', dot: '#dc2626', label: 'REJECTED' },
  };
  const c = cfg[status] || cfg.PENDING;
  return (
    <View style={[styles.badge, { borderColor: c.border }]}>
      <View style={[styles.badgeDot, { backgroundColor: c.dot }]} />
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
};

// ── Card with institutional L-bracket corners ────────────────────
const FramedCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.framedCard, style]}>
    <View style={styles.cornerTL} />
    <View style={styles.cornerBR} />
    {children}
  </View>
);

// ── Inline audio player placeholder ─────────────────────────────
const VoicePlayer = ({ label }: { label: string }) => (
  <View style={styles.playerBox}>
    <Text style={styles.playerLabel}>🎙 {label.toUpperCase()}</Text>
    <View style={styles.playerControls}>
      <TouchableOpacity style={styles.playBtn}>
        <Text style={styles.playBtnText}>▶</Text>
      </TouchableOpacity>
      <Text style={styles.playerTime}>0:00 / 0:00</Text>
      <Text style={styles.playerVolume}>🔈</Text>
    </View>
  </View>
);

// ── Main Screen ──────────────────────────────────────────────────
export default function MySubmissionsScreen() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [expandedMediaId, setExpandedMediaId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get('/assets/mine');
        setAssets(res.data);
      } catch (e: any) {
        setError(e.response?.data?.message || 'Failed to load submissions. Is the server running?');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderAsset = ({ item }: { item: Asset }) => (
    <FramedCard style={styles.assetCard}>
      <View style={styles.assetRow}>
        <View style={styles.assetInfo}>
          <Text style={styles.assetTitle}>{item.title}</Text>
          <Text style={styles.assetMeta}>
            {item.communityName} • {item.type} • Submitted: {new Date(item.createdAt).toLocaleDateString('en-GB')}
          </Text>
        </View>
        <View style={styles.assetButtons}>
          {item.mediaUrl && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setExpandedMediaId(p => p === item._id ? null : item._id)}
            >
              <Text style={styles.actionBtnText}>
                {expandedMediaId === item._id ? '↑ Hide' : '↓ Play'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.actionBtn} onPress={() => setSelectedAsset(item)}>
            <Text style={styles.actionBtnText}>Details</Text>
          </TouchableOpacity>
          <StatusBadge status={item.approvalStatus} />
        </View>
      </View>

      {item.mediaUrl && expandedMediaId === item._id && (
        <VoicePlayer label={item.type === 'SONIC' ? 'Your Sonic Archive' : 'Your Voice Recording'} />
      )}

      {item.approvalStatus === 'REJECTED' && item.reviewComment && (
        <View style={styles.feedbackBox}>
          <Text style={styles.feedbackText}>
            <Text style={{ fontWeight: '700' }}>Reviewer Feedback: </Text>
            {item.reviewComment}
          </Text>
        </View>
      )}
    </FramedCard>
  );

  return (
    <SafeAreaView style={styles.page}>
      {/* Page header */}
      <View style={styles.pageHeaderWrap}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/(tabs)/upload')} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>My Submissions</Text>
        <View style={styles.diamondRow}>
          <View style={styles.dividerLine} />
          <View style={styles.diamond} />
          <View style={styles.dividerLine} />
        </View>
      </View>

      <FlatList
        data={assets}
        keyExtractor={item => item._id}
        renderItem={renderAsset}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: spacing.md }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {!!error && (
              <View style={[styles.errorBox, { marginTop: spacing.md }]}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            {!error && (
              <Text style={[styles.trackDesc, { marginTop: spacing.md, marginHorizontal: spacing.sm }]}>
                Track the status of your community's archival submissions. Rejected submissions include reviewer feedback.
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.terracotta} size="large" />
            </View>
          ) : !error ? (
            <Text style={styles.noData}>No submissions found. Upload your first cultural asset!</Text>
          ) : null
        }
      />

      {/* Details Modal */}
      <Modal visible={!!selectedAsset} transparent animationType="fade" onRequestClose={() => setSelectedAsset(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedAsset(null)}>
          <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => { }}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedAsset(null)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedAsset && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <StatusBadge status={selectedAsset.approvalStatus} />
                    <Text style={styles.typeTag}>DHAROHAR-{selectedAsset.type}</Text>
                  </View>
                  <Text style={styles.modalTitle}>{selectedAsset.title}</Text>
                  <Text style={styles.modalCommunity}>{selectedAsset.communityName}</Text>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailSectionTitle}>Submission Info</Text>
                    <Text style={styles.detailItem}>🕐 {new Date(selectedAsset.createdAt).toLocaleString()}</Text>
                    {selectedAsset.riskTier && <Text style={styles.detailItem}>ℹ️ Risk: {selectedAsset.riskTier}</Text>}
                    {selectedAsset.recordeeName && <Text style={styles.detailItem}>📋 Recordee: {selectedAsset.recordeeName}</Text>}
                  </View>
                  {selectedAsset.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Description</Text>
                      <Text style={styles.descText}>"{selectedAsset.description}"</Text>
                    </View>
                  )}
                  {selectedAsset.transcript && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Oral History Transcript</Text>
                      <View style={styles.transcriptBox}>
                        <Text style={styles.transcriptText}>{selectedAsset.transcript}</Text>
                      </View>
                    </View>
                  )}
                  {selectedAsset.approvalStatus === 'REJECTED' && selectedAsset.reviewComment && (
                    <View style={styles.feedbackBox}>
                      <Text style={[styles.feedbackText, { color: '#7f1d1d' }]}>
                        <Text style={{ fontWeight: '700' }}>Reviewer Feedback: </Text>
                        {selectedAsset.reviewComment}
                      </Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f5ebdc' },

  pageHeaderWrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: spacing.xs },
  backBtnText: { fontSize: 14, color: colors.burntUmber, fontWeight: '500' },
  pageTitle: {
    fontFamily: 'serif', fontSize: 32, fontWeight: '800',
    color: colors.burntUmber, fontStyle: 'italic', textAlign: 'center', marginBottom: 8,
  },
  diamondRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.mutedGold, opacity: 0.5 },
  diamond: { width: 8, height: 8, backgroundColor: colors.mutedGold, transform: [{ rotate: '45deg' }] },

  framedCard: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(183,144,61,0.3)',
    borderRadius: 4, padding: spacing.lg, marginHorizontal: spacing.lg,
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

  outerFrame: { marginHorizontal: spacing.md },
  trackDesc: { fontSize: 13, color: colors.terracotta, marginBottom: spacing.lg, lineHeight: 20 },

  // ── Error box — INSIDE the framed card now ──
  errorBox: {
    padding: spacing.sm,
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderWidth: 1, borderColor: '#ef4444', borderRadius: 4,
    marginBottom: spacing.md,
  },
  errorText: { color: '#7f1d1d', fontSize: 13 },

  assetCard: { marginHorizontal: 0, marginBottom: spacing.md },
  assetRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  assetInfo: { flex: 1 },
  assetTitle: {
    fontFamily: 'serif', fontSize: 16, fontWeight: '700',
    color: colors.burntUmber, marginBottom: 4,
  },
  assetMeta: { fontSize: 12, color: '#888', lineHeight: 18 },
  assetButtons: {
    alignItems: 'flex-end', gap: 6,
    justifyContent: 'flex-start', flexShrink: 0,
  },
  actionBtn: {
    borderWidth: 1, borderColor: '#aaa', borderRadius: 3,
    paddingVertical: 4, paddingHorizontal: 10, backgroundColor: '#fff',
  },
  actionBtnText: { fontSize: 12, color: colors.textMain, fontWeight: '500' },
  badge: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10, gap: 5,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  feedbackBox: {
    marginTop: spacing.sm, padding: spacing.sm,
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderWidth: 1, borderColor: '#ef4444', borderRadius: 4,
  },
  feedbackText: { fontSize: 13, color: '#7f1d1d', lineHeight: 19 },
  playerBox: {
    marginTop: spacing.sm, borderWidth: 1, borderColor: colors.mutedGold,
    borderRadius: 4, padding: spacing.sm, backgroundColor: 'rgba(0,0,0,0.02)',
  },
  playerLabel: { fontSize: 10, fontWeight: '700', color: colors.burntUmber, letterSpacing: 1, marginBottom: 6 },
  playerControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.burntUmber, alignItems: 'center', justifyContent: 'center',
  },
  playBtnText: { color: '#fff', fontSize: 10 },
  playerTime: { fontSize: 13, color: colors.textLight, flex: 1 },
  playerVolume: { fontSize: 16 },
  center: { padding: spacing.xl, alignItems: 'center' },
  noData: { fontSize: 14, color: colors.textLight, textAlign: 'center', padding: spacing.xl },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: colors.mutedGold,
    borderRadius: 4, width: '100%', maxHeight: '90%', padding: spacing.xl,
    elevation: 20,
  },
  closeBtn: { position: 'absolute', top: spacing.md, right: spacing.md, zIndex: 1, padding: spacing.sm },
  closeBtnText: { fontSize: 20, color: colors.textLight },
  typeTag: { fontSize: 12, fontWeight: '700', color: colors.terracotta, letterSpacing: 1 },
  modalTitle: { fontFamily: 'serif', fontSize: 24, fontWeight: '700', color: colors.textMain, marginBottom: 4 },
  modalCommunity: { fontSize: 15, color: colors.terracotta, fontWeight: '600', marginBottom: spacing.lg },
  detailSection: {
    marginBottom: spacing.lg, borderBottomWidth: 1,
    borderBottomColor: colors.mutedGold, paddingBottom: spacing.md,
  },
  detailSectionTitle: { fontFamily: 'serif', fontSize: 14, fontWeight: '700', color: colors.textMain, marginBottom: spacing.sm },
  detailItem: { fontSize: 14, color: colors.textMain, marginBottom: 4 },
  descText: { fontSize: 14, lineHeight: 22, fontStyle: 'italic', color: colors.textMain },
  transcriptBox: { padding: spacing.sm, backgroundColor: 'rgba(0,0,0,0.02)', borderWidth: 1, borderColor: colors.mutedGold },
  transcriptText: { fontSize: 13, color: colors.textMain, lineHeight: 20 },
});
