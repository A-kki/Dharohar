import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, layout } from '../theme/spacing';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    variant?: 'elevated' | 'outlined' | 'framed';
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'elevated',
    style,
    ...props
}) => {
    return (
        <View
            style={[
                styles.card,
                variant === 'elevated' && styles.elevated,
                variant === 'outlined' && styles.outlined,
                variant === 'framed' && styles.framed,
                style
            ]}
            {...props}
        >
            {/* Decorative corners for the 'framed' institutional variant */}
            {variant === 'framed' && (
                <>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </>
            )}
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.bgLight,
        borderRadius: layout.borderRadius,
        padding: spacing.lg,
        position: 'relative',
        overflow: 'hidden',
    },
    elevated: {
        ...layout.shadowSoft,
    },
    outlined: {
        borderWidth: 1,
        borderColor: colors.parchment,
    },
    framed: {
        borderWidth: 1,
        borderColor: colors.mutedGold,
        ...layout.shadowSoft,
        overflow: 'visible', // Visible to allow overlapping corners
    },
    corner: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderColor: colors.terracotta,
        borderWidth: 2,
    },
    topLeft: {
        top: 8,
        left: 8,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    bottomRight: {
        bottom: 8,
        right: 8,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    }
});
