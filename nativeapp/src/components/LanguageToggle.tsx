import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const styles = StyleSheet.create({
  toggleButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  toggleButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
});

export default function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'de' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const isGerman = i18n.language === 'de';

  return (
    <TouchableOpacity
      style={[styles.toggleButton, isGerman && styles.toggleButtonActive]}
      onPress={toggleLanguage}
    >
      <Text style={[styles.toggleText, isGerman && styles.toggleTextActive]}>
        {isGerman ? 'DE' : 'EN'}
      </Text>
    </TouchableOpacity>
  );
}