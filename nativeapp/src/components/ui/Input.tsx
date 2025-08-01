import React from 'react';
import { TextInput, ViewStyle, TextStyle, StyleSheet } from 'react-native';

interface InputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle & TextStyle;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
});

export default function Input({ 
  value, 
  onChangeText, 
  placeholder, 
  style,
  secureTextEntry,
  multiline,
  numberOfLines
}: InputProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={[styles.input, style]}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      numberOfLines={numberOfLines}
      placeholderTextColor="#9CA3AF"
    />
  );
}