import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/colors';

// Tab icon — emoji + label, no wrapping
const TabIcon = ({ focused, label, icon }: { focused: boolean; label: string; icon: string }) => (
  <View style={styles.tabIcon}>
    <Text style={[styles.tabEmoji, focused && styles.emojiActive]}>{icon}</Text>
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false, // we render our own label inside TabIcon
      }}
    >
      {/* My Submissions */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Submissions',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Submissions" icon="📋" />,
        }}
      />

      {/* Upload Asset */}
      <Tabs.Screen
        name="upload"
        options={{
          title: 'Upload',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Upload" icon="☁️" />,
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Profile" icon="👤" />,
        }}
      />

      {/* Hidden screens */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(183,144,61,0.35)',
    height: 64,         // fixed height — prevents squishing
    paddingBottom: 4,
    paddingTop: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
    width: 80,           // fixed width prevents label overflow
    gap: 2,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.45,
  },
  emojiActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.textLight,
    letterSpacing: 0.2,
    textAlign: 'center',
    width: '100%',       // fills the fixed width container
  },
  tabLabelActive: {
    color: colors.terracotta,
    fontWeight: '700',
  },
});
