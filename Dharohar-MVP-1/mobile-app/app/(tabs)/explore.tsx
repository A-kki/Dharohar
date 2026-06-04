import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

// Dummy Data mimicking web mockCommunities & getPublicAssets
const DUMMY_ASSETS = [
  { id: '1', title: 'Monpa Weaving Tech', community: 'Monpa Tribe', desc: 'Detailed weaving instructions', type: 'BIO', risk: 'LOW' },
  { id: '2', title: 'Himalayan Healing Chants', community: 'Kinnaura', desc: 'Audio recording of seasonal healing chants', type: 'SONIC', risk: 'MEDIUM' },
];

export default function ExploreScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Knowledge Archives</Text>
      <Text style={styles.subtitle}>Showing community-approved assets</Text>
    </View>
  );

  const renderAsset = ({ item }: { item: typeof DUMMY_ASSETS[0] }) => (
    <Card variant="framed" style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Text style={styles.assetTitle}>{item.title}</Text>
        <View style={[styles.badge, item.risk === 'MEDIUM' && styles.badgeMedium]}>
          <Text style={styles.badgeText}>{item.type} • {item.risk} RISK</Text>
        </View>
      </View>
      <Text style={styles.communityName}>{item.community}</Text>
      <Text style={styles.desc}>{item.desc}</Text>

      <View style={styles.assetFooter}>
        <Button
          title="Apply for License"
          variant="outline"
          style={{ width: '100%' }}
          onPress={() => { }}
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={DUMMY_ASSETS}
        keyExtractor={(item) => item.id}
        renderItem={renderAsset}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.terracotta} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.parchment,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.xxl * 1.5,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cardContainer: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  assetTitle: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    backgroundColor: colors.forest,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: layout.borderRadius,
  },
  badgeMedium: {
    backgroundColor: colors.warning,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  communityName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.burntUmber,
    marginBottom: spacing.sm,
  },
  desc: {
    ...typography.body,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  assetFooter: {
    marginTop: spacing.sm,
  }
});
