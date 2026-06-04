import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface SplashLoaderProps {
    onDone: () => void;
}

export const SplashLoader: React.FC<SplashLoaderProps> = ({ onDone }) => {
    const rotateAnim = new Animated.Value(0);
    const opacityAnim = new Animated.Value(0);

    useEffect(() => {
        // Fade in
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Rotate continuously (10s per revolution, matching web CSS)
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 10000,
                useNativeDriver: true,
            })
        ).start();

        // After 2.5s, fade out then call onDone
        const timeout = setTimeout(() => {
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => onDone());
        }, 2500);

        return () => clearTimeout(timeout);
    }, []);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
            <View style={styles.symbolWrap}>
                {/* Outer gold ring — matches .dharohar-loader-ring */}
                <View style={styles.ring} />
                {/* Rotating ceremonial symbol */}
                <Animated.Image
                    source={require('../assets/ceremonial-symbol.png')}
                    style={[styles.image, { transform: [{ rotate }] }]}
                    resizeMode="contain"
                />
            </View>
            <Text style={styles.label}>INITIALIZING DHAROHAR ECOSYSTEM...</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(245, 235, 220, 0.92)', // #f5ebdc parchment
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    symbolWrap: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        height: 120,
    },
    ring: {
        position: 'absolute',
        width: 144,
        height: 144,
        borderRadius: 72,
        borderWidth: 1,
        borderColor: 'rgba(183, 144, 61, 0.35)',
    },
    image: {
        width: 96,
        height: 96,
    },
    label: {
        marginTop: spacing.xl,
        fontFamily: 'serif',
        fontSize: 11,
        letterSpacing: 3,
        color: colors.burntUmber,
        opacity: 0.75,
        textTransform: 'uppercase',
    },
});
