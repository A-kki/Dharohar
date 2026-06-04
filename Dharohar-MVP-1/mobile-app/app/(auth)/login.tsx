import React, { useState } from 'react';
import {
    View, Text, StyleSheet, KeyboardAvoidingView, Platform,
    ScrollView, TextInput, TouchableOpacity, Image, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../src/services/apiClient';
import { colors } from '../../src/theme/colors';
import { spacing, layout } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        setError('');

        try {
            // Matches exact web endpoint: /auth/login (not /api/auth/login)
            const res = await apiClient.post('/auth/login', { email, password });
            const { token, user } = res.data;
            // Backend returns user.role (string) — same as web AuthPages.tsx line 30
            const roles: string[] = [user.role];

            if (!roles.includes('community') && !roles.includes('admin')) {
                setError('Access denied. This app is for Community members only.');
                setLoading(false);
                return;
            }

            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userRole', user.role);
            await AsyncStorage.setItem('userData', JSON.stringify({ id: user.id, email, roles }));
            router.replace('/(tabs)');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.page}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
            >
                {/* Framed card — mirrors web's `framed-section` */}
                <View style={styles.card}>
                    {/* Logo + title — mirrors web login header */}
                    <View style={styles.headerBlock}>
                        <Image
                            source={require('../../src/assets/ceremonial-symbol.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.brand}>DHAROHAR</Text>
                        <Text style={styles.subtitle}>Sign In to DHAROHAR</Text>
                        <Text style={styles.hint}>Access your governance dashboard</Text>
                    </View>

                    {/* Error */}
                    {!!error && (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>⚠ {error}</Text>
                        </View>
                    )}

                    {/* Email */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.textLight}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    {/* Password */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.textLight}
                            secureTextEntry
                        />
                    </View>

                    {/* Submit — primary-btn */}
                    <TouchableOpacity
                        style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading
                            ? <ActivityIndicator color={colors.white} />
                            : <Text style={styles.primaryBtnText}>Sign In</Text>
                        }
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.parchment,
    },
    scroll: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        paddingVertical: spacing.xxl,
    },
    // Mirrors `framed-section` class
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: colors.bgLight,
        borderWidth: 1,
        borderColor: colors.mutedGold,
        borderRadius: 4,
        padding: spacing.xl,
        // Decorative corner shadows (institutional)
        shadowColor: colors.burntUmber,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    headerBlock: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logo: {
        width: 72,
        height: 72,
        marginBottom: spacing.sm,
    },
    brand: {
        fontFamily: 'serif',
        fontSize: 24,
        fontWeight: '700',
        color: colors.burntUmber,
        letterSpacing: 4,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontFamily: 'serif',
        fontSize: 18,
        color: colors.textMain,
        marginBottom: spacing.xs / 2,
    },
    hint: {
        fontSize: 13,
        color: colors.textLight,
    },
    // Matches web error div styling
    errorBox: {
        backgroundColor: 'rgba(239,68,68,0.08)',
        borderWidth: 1,
        borderColor: '#ef4444',
        borderRadius: 4,
        padding: spacing.sm,
        marginBottom: spacing.md,
    },
    errorText: {
        color: '#7f1d1d',
        fontSize: 13,
    },
    fieldGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMain,
        marginBottom: 6,
    },
    // Matches web input: gold border, 0.75rem padding, 2px border-radius
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.mutedGold,
        borderRadius: 2,
        padding: spacing.md,
        fontSize: 15,
        color: colors.textMain,
    },
    // Matches web `.primary-btn`
    primaryBtn: {
        backgroundColor: colors.terracotta,
        borderRadius: 2,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    primaryBtnDisabled: {
        opacity: 0.6,
    },
    primaryBtnText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 1,
    },
});
