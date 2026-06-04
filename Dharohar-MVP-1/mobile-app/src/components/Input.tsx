import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, layout } from '../theme/spacing';
import { typography } from '../theme/typography';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <TextInput
                style={[
                    styles.input,
                    error ? styles.inputError : null,
                    style
                ]}
                placeholderTextColor={colors.textLight}
                {...props}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        ...typography.bodySmall,
        fontWeight: '600',
        color: colors.burntUmber,
        marginBottom: spacing.xs,
    },
    input: {
        ...typography.body,
        minHeight: 48,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.mutedGold,
        borderRadius: layout.borderRadius,
        paddingHorizontal: spacing.md,
        color: colors.textMain,
    },
    inputError: {
        borderColor: colors.danger,
        borderWidth: 1.5,
    },
    errorText: {
        ...typography.bodySmall,
        color: colors.danger,
        marginTop: spacing.xs,
    },
});
