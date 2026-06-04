import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';

const FramedCard = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.framedCard}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerBR} />
        {children}
    </View>
);

export default function ProfileScreen() {
    const router = useRouter();
    const [userData, setUserData] = useState<{ email?: string; roles?: string[] } | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('userData').then(d => {
            if (d) setUserData(JSON.parse(d));
        });
    }, []);

    const handleLogout = async () => {
        await AsyncStorage.multiRemove(['userToken', 'userRole', 'userData']);
        router.replace('/(auth)/login');
    };

    return (
        <SafeAreaView style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>Profile</Text>
                <View style={styles.diamondRow}>
                    <View style={styles.dividerLine} />
                    <View style={styles.diamond} />
                    <View style={styles.dividerLine} />
                </View>
            </View>

            <FramedCard>
                <View style={styles.logoWrap}>
                    <Image
                        source={require('../../src/assets/ceremonial-symbol.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.brand}>DHAROHAR</Text>
                    <Text style={styles.brandSub}>CULTURAL PRESERVATION</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.userInfo}>
                    <Text style={styles.userEmail}>{userData?.email || 'community@dharohar.dev'}</Text>
                    <Text style={styles.userRole}>COMMUNITY</Text>
                </View>

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutBtnText}>↩ Sign Out</Text>
                </TouchableOpacity>
            </FramedCard>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#f5ebdc' },
    header: { alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl },
    pageTitle: {
        fontFamily: 'serif', fontSize: 32, fontWeight: '800',
        color: colors.burntUmber, fontStyle: 'italic', marginBottom: 8,
    },
    diamondRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.mutedGold, opacity: 0.5 },
    diamond: { width: 8, height: 8, backgroundColor: colors.mutedGold, transform: [{ rotate: '45deg' }] },
    framedCard: {
        backgroundColor: '#fff', borderWidth: 1, borderColor: 'rgba(183,144,61,0.3)',
        borderRadius: 4, padding: spacing.xl, marginHorizontal: spacing.lg,
        marginTop: spacing.md, position: 'relative',
    },
    cornerTL: {
        position: 'absolute', top: -1, left: -1, width: 14, height: 14,
        borderTopWidth: 2, borderLeftWidth: 2, borderColor: colors.burntUmber, borderTopLeftRadius: 2,
    },
    cornerBR: {
        position: 'absolute', bottom: -1, right: -1, width: 14, height: 14,
        borderBottomWidth: 2, borderRightWidth: 2, borderColor: colors.burntUmber, borderBottomRightRadius: 2,
    },
    logoWrap: { alignItems: 'center', marginBottom: spacing.lg },
    logo: { width: 80, height: 80, marginBottom: spacing.sm },
    brand: {
        fontFamily: 'serif', fontSize: 22, fontWeight: '700',
        color: colors.burntUmber, letterSpacing: 4,
    },
    brandSub: { fontSize: 10, color: colors.textLight, letterSpacing: 3, marginTop: 4 },
    divider: { height: 1, backgroundColor: colors.mutedGold, opacity: 0.4, marginBottom: spacing.lg },
    userInfo: { marginBottom: spacing.xl },
    userEmail: { fontSize: 15, color: colors.textMain, fontWeight: '600', marginBottom: 4 },
    userRole: { fontSize: 11, color: colors.textLight, letterSpacing: 2, fontWeight: '600' },
    logoutBtn: {
        borderWidth: 1, borderColor: colors.mutedGold, borderRadius: 2,
        padding: spacing.md, alignItems: 'center',
    },
    logoutBtnText: { color: colors.burntUmber, fontWeight: '600', fontSize: 14 },
});
