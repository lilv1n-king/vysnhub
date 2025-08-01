import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, StyleSheet } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outline';
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDefault: {
    backgroundColor: '#000000',
  },
  buttonOutline: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  text: {
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
  },
  textDefault: {
    color: '#ffffff',
  },
  textOutline: {
    color: '#374151',
  },
});

export default function Button({ 
  children, 
  onPress, 
  variant = 'default', 
  className = '', 
  style,
  textStyle 
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        variant === 'default' ? styles.buttonDefault : styles.buttonOutline,
        style
      ]}
    >
      <Text 
        style={[
          styles.text,
          variant === 'default' ? styles.textDefault : styles.textOutline,
          textStyle
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}