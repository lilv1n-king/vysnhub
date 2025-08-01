import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
    elevation: 1, // Behalte elevation für Android
  },
  cardContent: {
    padding: 16,
  },
});

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardContent({ children, style }: CardProps) {
  return <View style={[styles.cardContent, style]}>{children}</View>;
}