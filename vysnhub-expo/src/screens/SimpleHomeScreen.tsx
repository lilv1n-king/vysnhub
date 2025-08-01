import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
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
    lineHeight: 24,
  },
});

export default function SimpleHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>VYSN Hub</Text>
        <Text style={styles.text}>
          Welcome to VYSN Hub - your complete lighting solution platform.
        </Text>
        <Text style={styles.text}>
          Navigate using the tabs below to explore products, scan QR codes, chat with AI, and manage projects.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}