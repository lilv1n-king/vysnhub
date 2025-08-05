import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { ProjectsStackParamList } from '../navigation/ProjectsStackNavigator';
import { ArrowLeft, Calendar, MapPin, DollarSign, Target, Tag } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { useAuth } from '../../lib/contexts/AuthContext';
import { supabase } from '../../lib/utils/supabase';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#6b7280',
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
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dateInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  budgetInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6b7280',
    marginRight: 8,
  },
  budgetTextInput: {
    flex: 1,
    fontSize: 16,
  },
  discountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  percentSymbol: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  discountTextInput: {
    flex: 1,
    fontSize: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  selectedPriorityBadge: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  selectedPriorityText: {
    color: '#ffffff',
  },

  productInfo: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  productText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  createButton: {
    height: 56,
    marginTop: 32,
  },
});

type CreateProjectScreenNavigationProp = StackNavigationProp<ProjectsStackParamList, 'CreateProject'>;
type CreateProjectScreenRouteProp = RouteProp<ProjectsStackParamList, 'CreateProject'>;

export default function CreateProjectScreen() {
  const route = useRoute<CreateProjectScreenRouteProp>();
  const navigation = useNavigation<CreateProjectScreenNavigationProp>();
  const auth = useAuth();
  const { productInfo } = route.params || {};

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    status: 'planning' as const,
    priority: 'medium' as const,
    start_date: '',
    target_completion_date: '',
    estimated_budget: '',
    customer_discount: '0',
    notes: productInfo ? `Products:\n• ${productInfo.quantity}x ${productInfo.name} (${productInfo.itemNumber})` : '',
  });

  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateProject = async () => {
    if (!formData.name.trim() || !auth?.user || !supabase) {
      Alert.alert('Fehler', 'Bitte geben Sie mindestens einen Projektnamen ein');
      return;
    }

    setIsCreating(true);
    try {
      const projectData = {
        user_id: auth.user.id,
        project_name: formData.name.trim(),
        project_description: formData.description.trim() || null,
        project_location: formData.location.trim() || null,
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date || null,
        target_completion_date: formData.target_completion_date || null,
        estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : null,
        customer_discount: parseFloat(formData.customer_discount) || 0,
        project_notes: formData.notes.trim() || null,
      };

      const { data, error } = await supabase
        .from('user_projects')
        .insert([projectData])
        .select()
        .single();

      if (error) {
        Alert.alert('Fehler', `Projekt konnte nicht erstellt werden: ${error.message}`);
        return;
      }

      Alert.alert('Erfolg', 'Projekt wurde erfolgreich erstellt!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
            // Navigate to the new project detail
            navigation.navigate('ProjectDetail', { id: data.id });
          }
        }
      ]);
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Fehler', 'Projekt konnte nicht erstellt werden');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#6b7280" />
          <Text style={styles.backText}>Zurück</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Neues Projekt erstellen</Text>
        <Text style={styles.subtitle}>
          Erstellen Sie ein neues Projekt mit allen wichtigen Details
        </Text>

        {/* Product Info (if coming from product) */}
        {productInfo && (
          <View style={styles.productInfo}>
            <Text style={styles.productText}>
              📦 {productInfo.quantity}x {productInfo.name} ({productInfo.itemNumber})
            </Text>
          </View>
        )}

        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Target size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Grundinformationen</Text>
          </View>
          
          <Text style={styles.label}>Projektname *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder="z.B. Bürobeleuchtung Modernisierung"
          />

          <Text style={styles.label}>Beschreibung</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder="Detaillierte Projektbeschreibung..."
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Standort</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => handleInputChange('location', text)}
            placeholder="z.B. Berlin, Deutschland"
          />
        </View>



        {/* Timeline */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Calendar size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Zeitplan</Text>
          </View>

          <View style={styles.dateInputContainer}>
            <View style={styles.dateInput}>
              <Text style={styles.label}>Startdatum</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => {
                  // TODO: DatePicker implementieren
                  Alert.alert('Info', 'DatePicker wird noch implementiert');
                }}
              >
                <Text style={{ color: formData.start_date ? '#000000' : '#9ca3af' }}>
                  {formData.start_date || 'Datum auswählen'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateInput}>
              <Text style={styles.label}>Zieldatum</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => {
                  // TODO: DatePicker implementieren
                  Alert.alert('Info', 'DatePicker wird noch implementiert');
                }}
              >
                <Text style={{ color: formData.target_completion_date ? '#000000' : '#9ca3af' }}>
                  {formData.target_completion_date || 'Datum auswählen'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <DollarSign size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Finanzplanung</Text>
          </View>

          <Text style={styles.label}>Geschätztes Budget</Text>
          <View style={styles.budgetInput}>
            <Text style={styles.currencySymbol}>€</Text>
            <TextInput
              style={styles.budgetTextInput}
              value={formData.estimated_budget}
              onChangeText={(text) => handleInputChange('estimated_budget', text)}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Endkundenrabatt</Text>
          <View style={styles.discountInput}>
            <TextInput
              style={styles.discountTextInput}
              value={formData.customer_discount}
              onChangeText={(text) => handleInputChange('customer_discount', text)}
              placeholder="0"
              keyboardType="numeric"
            />
            <Text style={styles.percentSymbol}>%</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            Zusätzlicher Rabatt für Endkunden (z.B. 5%)
          </Text>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Tag size={24} color="#000000" />
            <Text style={styles.sectionTitle}>Zusätzliche Informationen</Text>
          </View>

          <Text style={styles.label}>Notizen</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => handleInputChange('notes', text)}
            placeholder="Zusätzliche Projektnotizen, Produkte, etc..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Create Button */}
        <Button 
          onPress={handleCreateProject}
          disabled={isCreating || !formData.name.trim()}
          style={styles.createButton}
        >
          {isCreating ? 'Projekt wird erstellt...' : 'Projekt erstellen'}
        </Button>
      </ScrollView>
    </View>
  );
}