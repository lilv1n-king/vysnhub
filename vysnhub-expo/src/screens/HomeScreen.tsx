import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Tag } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionMargin: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  catalogCard: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  catalogContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  catalogTextContainer: {
    flex: 1,
    padding: 16,
  },
  catalogImageContainer: {
    justifyContent: 'center',
    padding: 16,
  },
  catalogImage: {
    width: 96,
    height: 120,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  newReleaseBadge: {
    backgroundColor: '#f3f4f6',
  },
  newProductBadge: {
    backgroundColor: '#dcfce7',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  eventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  eventContent: {
    padding: 16,
  },
  eventBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  eventBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  eventDate: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
});

export default function HomeScreen() {
  const navigation = useNavigation();

  const handleProductPress = () => {
    // Erstmal einfach zum Products Tab navigieren
    navigation.navigate('Products');
  };

  const handleSettingsPress = () => {
    console.log('Settings button pressed - Auth coming soon!');
  };

  return (
    <View style={styles.container}>
      <Header onSettingsPress={handleSettingsPress} />
      <ScrollView style={styles.scrollContent}>
        {/* Header */}
        <View style={styles.sectionMargin}>
          <Text style={styles.title}>VYSN Hub</Text>
          <Text style={styles.subtitle}>
            Your complete lighting solution platform
          </Text>
        </View>

        {/* New Catalog */}
        <View style={styles.sectionMargin}>
          <TouchableOpacity>
            <Card style={styles.catalogCard}>
              <CardContent style={styles.catalogContent}>
                <View style={styles.catalogTextContainer}>
                  <View style={[styles.badge, styles.newReleaseBadge]}>
                    <Tag size={16} color="#000000" />
                    <Text style={styles.badgeText}>New Release</Text>
                  </View>
                  
                  <Text style={styles.cardTitle}>
                    VYSN Catalog 2025
                  </Text>
                  <Text style={styles.cardDescription}>
                    Complete product overview
                  </Text>
                  
                  <Button 
                    style={{ backgroundColor: '#000000', paddingHorizontal: 16, paddingVertical: 8 }}
                    textStyle={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}
                  >
                    Download
                  </Button>
                </View>
                
                <View style={styles.catalogImageContainer}>
                  <Image 
                    source={require('../../assets/VYSN_KAT.png')}
                    style={styles.catalogImage}
                    resizeMode="contain"
                  />
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        </View>

        {/* New Product */}
        <View style={styles.sectionMargin}>
          <TouchableOpacity onPress={handleProductPress}>
            <Card style={styles.catalogCard}>
              <CardContent style={styles.catalogContent}>
                <View style={styles.catalogTextContainer}>
                  <View style={[styles.badge, styles.newProductBadge]}>
                    <Tag size={16} color="#16a34a" />
                    <Text style={[styles.badgeText, { color: '#16a34a' }]}>New in Range</Text>
                  </View>
                  
                  <Text style={styles.cardTitle}>
                    Nydle T - Touch Dimmable LED
                  </Text>
                  <Text style={styles.cardDescription}>
                    Touch-dimming, 5.4W, 2700K
                  </Text>
                  
                  <Button 
                    style={{ backgroundColor: '#000000', paddingHorizontal: 16, paddingVertical: 8 }}
                    textStyle={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}
                  >
                    View Details
                  </Button>
                </View>
                
                <View style={styles.catalogImageContainer}>
                  <Image 
                    source={{ uri: 'https://vysninstructionmanuals.web.app/products/V109001B2B_1.jpg' }}
                    style={styles.catalogImage}
                    resizeMode="contain"
                  />
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Event Section */}
        <View style={styles.sectionMargin}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Calendar size={24} color="#000000" style={{ marginRight: 8 }} />
            <Text style={[styles.eventTitle, { marginBottom: 0 }]}>Upcoming Events</Text>
          </View>
          
          <Card style={styles.eventCard}>
            <CardContent style={styles.eventContent}>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>Networking Event</Text>
              </View>
              
              <Text style={styles.eventName}>
                Lighting Professional Meetup Berlin
              </Text>
              <Text style={styles.eventDescription}>
                Meet other lighting professionals and electrical engineers for a relaxed exchange about current projects and new technologies.
              </Text>
              
              <Text style={styles.eventDate}>
                Thursday, January 30, 2025 • 6:00 PM - 9:00 PM
              </Text>
              
              <Button 
                style={{ backgroundColor: '#000000', paddingHorizontal: 16, paddingVertical: 12, marginTop: 8 }}
                textStyle={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}
              >
                Register for Free
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}