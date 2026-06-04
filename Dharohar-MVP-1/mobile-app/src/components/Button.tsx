import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, layout } from '../theme/spacing';
import { typography } from '../theme/typography';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    variant = 'primary',
    isLoading = false,
    style,
    disabled,
    ...props
}) => {
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';
    const isOutline = variant === 'outline';

    return (
        <TouchableOpacity
            style={[
                styles.button,
                isPrimary && styles.primary,
                isSecondary && styles.secondary,
                isOutline && styles.outline,
                variant === 'ghost' && styles.ghost,
                disabled && styles.disabled,
                style,
            ]}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={isPrimary || isSecondary ? colors.white : colors.terracotta} />
            ) : (
                <Text
                    style={[
                        styles.text,
                        isPrimary && styles.primaryText,
                        isSecondary && styles.secondaryText,
                        isOutline && styles.outlineText,
                        variant === 'ghost' && styles.ghostText,
                        disabled && styles.disabledText,
                    ]}
                >
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        minHeight: 48,
        borderRadius: layout.borderRadius,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    primary: {
        backgroundColor: colors.terracotta,
        ...layout.shadowSoft,
    },
    secondary: {
        backgroundColor: colors.burntUmber,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.terracotta,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    disabled: {
        backgroundColor: colors.parchment,
        borderColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
    },
    text: {
        ...typography.button,
    },
    primaryText: {
        color: colors.white,
    },
    secondaryText: {
        color: colors.white,
    },
    outlineText: {
        color: colors.terracotta,
    },
    ghostText: {
        color: colors.terracotta,
    },
    disabledText: {
        color: colors.textLight,
    },
});
