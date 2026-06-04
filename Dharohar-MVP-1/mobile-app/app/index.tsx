import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../src/theme/colors';

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            setIsAuthenticated(!!token);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={colors.terracotta} />
            </View>
        );
    }

    // Redirect based on auth state
    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.parchment,
    },
});
