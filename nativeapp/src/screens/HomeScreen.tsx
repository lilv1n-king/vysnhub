import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Tag, Zap } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { handleHighlightAction } from '../../lib/utils/highlightActions';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { homeContentService } from '../../lib/services/homeContentService';
import { HomeEvent, HomeHighlight } from '../../lib/types/homeContent';
import { productService } from '../../lib/services/productService';

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
  const { t, i18n } = useTranslation();
  const [events, setEvents] = useState<HomeEvent[]>([]);
  const [highlights, setHighlights] = useState<HomeHighlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHomeContent();
  }, [i18n.language]); // Neu laden wenn Sprache wechselt

  const loadHomeContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verwende aktuelle i18n Sprache
      const currentLanguage = i18n.language.startsWith('de') ? 'de' : 'en';
      console.log('🌍 Loading home content for language:', currentLanguage);
      
      const content = await homeContentService.getHomeContent(currentLanguage);
      setEvents(content.events);
      setHighlights(content.highlights);
    } catch (err) {
      console.error('Error loading home content:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (productId?: number) => {
    if (productId) {
      // Navigate to product detail
      navigation.navigate('Products', { productId });
    } else {
      // Default navigation to Products tab
      navigation.navigate('Products');
    }
  };

  const handleHighlightPress = async (highlight: HomeHighlight) => {
    try {
      await handleHighlightAction(highlight, {
        navigate: (screen: string, params?: any) => {
          navigation.navigate(screen as any, params);
        }
      });
    } catch (error) {
      console.error('Error handling highlight action:', error);
    }
  };

  const renderHighlight = (highlight: HomeHighlight, index: number) => {
    const badgeStyle = homeContentService.getBadgeStyle(highlight.badge_type);
    
    return (
      <TouchableOpacity key={highlight.id} onPress={() => handleHighlightPress(highlight)}>
        <Card style={styles.catalogCardLarge}>
          <CardContent style={styles.catalogContentLarge}>
            <View style={styles.catalogContentTop}>
              <View style={styles.catalogTextContainer}>
                {highlight.badge_text && (
                  <View style={[styles.badge, { backgroundColor: badgeStyle.backgroundColor }]}>
                    <Tag size={16} color={badgeStyle.color} />
                    <Text style={[styles.badgeText, { color: badgeStyle.color }]}>
                      {highlight.badge_text}
                    </Text>
                  </View>
                )}
                
                <Text style={styles.cardTitleLarge}>
                  {highlight.title}
                </Text>
                <Text style={styles.cardDescriptionLarge}>
                  {highlight.description}
                </Text>
              </View>
              
              {highlight.image_url && (
                <View style={styles.catalogImageContainer}>
                  <Image 
                    source={highlight.image_url.startsWith('http') 
                      ? { uri: highlight.image_url }
                      : require('../../assets/VYSN_KAT.png')
                    }
                    style={styles.catalogImageLarge}
                    resizeMode="contain"
                  />
                </View>
              )}
            </View>
            
            <View style={styles.catalogButtonContainer}>
              <Button 
                style={{ backgroundColor: '#000000', paddingVertical: 14, width: '100%' }}
                textStyle={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}
              >
                {highlight.button_text || t('common.viewDetails')}
              </Button>
            </View>
          </CardContent>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEvent = (event: HomeEvent) => {
    const formattedDate = homeContentService.formatEventDate(event.start_datetime);
    const eventTypeText = homeContentService.getEventTypeText(event.event_type);
    
    return (
      <Card key={event.id} style={styles.eventCard}>
        <CardContent style={styles.eventContent}>
          <View style={styles.eventBadge}>
            <Text style={styles.eventBadgeText}>{eventTypeText}</Text>
          </View>
          
          <Text style={styles.eventName}>
            {event.event_name}
          </Text>
          <Text style={styles.eventDescription}>
            {event.event_description}
          </Text>
          
          <Text style={styles.eventDate}>
            {formattedDate}
          </Text>
          
          {event.event_location && (
            <Text style={styles.eventDate}>
              📍 {event.event_location}{event.city ? `, ${event.city}` : ''}
            </Text>
          )}
          
          <Button 
            style={{ backgroundColor: '#000000', paddingHorizontal: 16, paddingVertical: 12, marginTop: 8 }}
            textStyle={{ color: '#ffffff', fontSize: 14, fontWeight: '500' }}
          >
            {t('home.registerForFree')}
          </Button>
        </CardContent>
      </Card>
    );
  };



  return (
    <View style={styles.container}>
              <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      <ScrollView style={styles.scrollContent}>


        {/* Loading State */}
        {loading && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={{ marginTop: 16, color: '#6b7280' }}>Inhalte werden geladen...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#ef4444', textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity 
              onPress={loadHomeContent}
              style={{ marginTop: 16, backgroundColor: '#000000', padding: 12, borderRadius: 8 }}
            >
              <Text style={{ color: '#ffffff' }}>Erneut versuchen</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Aktuelle Highlights */}
        {!loading && !error && highlights.length > 0 && (
          <View style={styles.sectionMargin}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Zap size={24} color="#000000" style={{ marginRight: 8 }} />
              <Text style={[styles.eventTitle, { marginBottom: 0 }]}>{t('home.currentHighlights')}</Text>
            </View>
            
            {highlights.map((highlight, index) => renderHighlight(highlight, index))}
          </View>
        )}

        {/* Event Section */}
        {!loading && !error && events.length > 0 && (
          <View style={styles.sectionMargin}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Calendar size={24} color="#000000" style={{ marginRight: 8 }} />
              <Text style={[styles.eventTitle, { marginBottom: 0 }]}>{t('home.upcomingEvents')}</Text>
            </View>
            
            {events.map(renderEvent)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}