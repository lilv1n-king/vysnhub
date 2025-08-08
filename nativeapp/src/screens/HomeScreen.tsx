import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Tag, Zap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
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
    marginBottom: 16,
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    minHeight: 112,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  catalogCardLarge: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    minHeight: 280,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  catalogContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  catalogContentLarge: {
    flexDirection: 'column',
    padding: 0,
  },
  catalogContentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  catalogImageLarge: {
    width: 140,
    height: 170,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 3,
  },
  catalogButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
  cardTitleLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  cardDescriptionLarge: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 12,
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  const { t } = useTranslation();

  const handleProductPress = () => {
    // Erstmal einfach zum Products Tab navigieren
    navigation.navigate('Products');
  };



  return (
    <View style={styles.container}>
              <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      <ScrollView style={styles.scrollContent}>


        {/* Aktuelle Highlights */}
        <View style={styles.sectionMargin}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Zap size={24} color="#000000" style={{ marginRight: 8 }} />
            <Text style={[styles.eventTitle, { marginBottom: 0 }]}>{t('home.currentHighlights')}</Text>
          </View>
          
          <TouchableOpacity>
            <Card style={styles.catalogCardLarge}>
              <CardContent style={styles.catalogContentLarge}>
                <View style={styles.catalogContentTop}>
                  <View style={styles.catalogTextContainer}>
                    <View style={[styles.badge, styles.newReleaseBadge]}>
                      <Tag size={16} color="#000000" />
                      <Text style={styles.badgeText}>{t('home.newRelease')}</Text>
                    </View>
                    
                    <Text style={styles.cardTitleLarge}>
                      {t('home.catalog2025')}
                    </Text>
                    <Text style={styles.cardDescriptionLarge}>
                      {t('home.catalogDescription')}
                    </Text>
                  </View>
                  
                  <View style={styles.catalogImageContainer}>
                    <Image 
                      source={require('../../assets/VYSN_KAT.png')}
                      style={styles.catalogImageLarge}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                
                <View style={styles.catalogButtonContainer}>
                  <Button 
                    style={{ backgroundColor: '#000000', paddingVertical: 14, width: '100%' }}
                    textStyle={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}
                  >
                    {t('common.download')}
                  </Button>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleProductPress}>
            <Card style={styles.catalogCardLarge}>
              <CardContent style={styles.catalogContentLarge}>
                <View style={styles.catalogContentTop}>
                  <View style={styles.catalogTextContainer}>
                    <View style={[styles.badge, styles.newProductBadge]}>
                      <Tag size={16} color="#16a34a" />
                      <Text style={[styles.badgeText, { color: '#16a34a' }]}>{t('home.newInRange')}</Text>
                    </View>
                    
                    <Text style={styles.cardTitleLarge}>
                      Nydle T - Touch Dimmable LED
                    </Text>
                    <Text style={styles.cardDescriptionLarge}>
                      Touch-dimming, 5.4W, 2700K
                    </Text>
                  </View>
                  
                  <View style={styles.catalogImageContainer}>
                    <Image 
                      source={{ uri: 'https://vysninstructionmanuals.web.app/products/V109001B2B_1.jpg' }}
                      style={styles.catalogImageLarge}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                
                <View style={styles.catalogButtonContainer}>
                  <Button 
                    style={{ backgroundColor: '#000000', paddingVertical: 14, width: '100%' }}
                    textStyle={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}
                  >
                    {t('common.viewDetails')}
                  </Button>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Event Section */}
        <View style={styles.sectionMargin}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Calendar size={24} color="#000000" style={{ marginRight: 8 }} />
            <Text style={[styles.eventTitle, { marginBottom: 0 }]}>{t('home.upcomingEvents')}</Text>
          </View>
          
          <Card style={styles.eventCard}>
            <CardContent style={styles.eventContent}>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>{t('home.networkingEvent')}</Text>
              </View>
              
              <Text style={styles.eventName}>
                {t('home.eventTitle')}
              </Text>
              <Text style={styles.eventDescription}>
                {t('home.eventDescription')}
              </Text>
              
              <Text style={styles.eventDate}>
                {t('home.eventDate')}
              </Text>
              
              <Button 
                style={{ backgroundColor: '#000000', paddingHorizontal: 16, paddingVertical: 12, marginTop: 8 }}
                textStyle={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}
              >
                {t('home.registerForFree')}
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}