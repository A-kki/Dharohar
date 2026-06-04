import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

export default function RegisterScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            router.replace('/(auth)/login');
        }, 1000);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Join DHAROHAR</Text>
                    <Text style={styles.subtitle}>Help us preserve our history</Text>
                </View>

                <View style={styles.formContainer}>
                    <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        value={name}
                        onChangeText={setName}
                    />

                    <Input
                        label="Email Address"
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Password"
                        placeholder="Create a password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Register"
                            onPress={handleRegister}
                            isLoading={loading}
                            style={{ width: '100%' }}
                        />
                    </View>

                    <Button
                        title="Already have an account? Sign In"
                        variant="ghost"
                        onPress={() => router.back()}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.parchment,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        ...typography.h2,
        fontSize: 28,
    },
    subtitle: {
        ...typography.body,
        color: colors.forest,
    },
    formContainer: {
        backgroundColor: colors.bgLight,
        padding: spacing.xl,
        borderRadius: 8,
        shadowColor: colors.textMain,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 3,
    },
    buttonContainer: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
});
