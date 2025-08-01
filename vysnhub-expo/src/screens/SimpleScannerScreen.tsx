import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  text: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default function SimpleScannerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Scanner</Text>
      <Text style={styles.text}>
        QR Code and Barcode scanner will be available here.
      </Text>
    </SafeAreaView>
  );
}