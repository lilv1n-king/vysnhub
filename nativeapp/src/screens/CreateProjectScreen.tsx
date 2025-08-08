import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { ProjectsStackParamList } from '../navigation/ProjectsStackNavigator';
import { ArrowLeft, Calendar, MapPin, DollarSign, Target, Tag } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { useAuth } from '../../lib/contexts/AuthContext';
import { projectService } from '../../lib/services/projectService';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  createButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

type CreateProjectScreenNavigationProp = StackNavigationProp<ProjectsStackParamList, 'CreateProject'>;
type CreateProjectScreenRouteProp = RouteProp<ProjectsStackParamList, 'CreateProject'>;

export default function CreateProjectScreen() {
  const { t } = useTranslation();
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
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [targetDate, setTargetDate] = useState<Date | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE');
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      handleInputChange('start_date', selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleTargetDateChange = (event: any, selectedDate?: Date) => {
    setShowTargetDatePicker(false);
    if (selectedDate) {
      setTargetDate(selectedDate);
      handleInputChange('target_completion_date', selectedDate.toISOString().split('T')[0]);
    }
  };

  const handleCreateProject = async () => {
    if (!formData.name.trim() || !auth?.user) {
      Alert.alert(t('auth.error'), t('auth.createProjectError'));
      return;
    }
    
    console.log('🏗️ Creating project with name:', formData.name.trim());

    setIsCreating(true);
    try {
      const projectData = {
        project_name: formData.name.trim(),
        project_description: formData.description.trim() || undefined,
        project_location: formData.location.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date || undefined,
        target_completion_date: formData.target_completion_date || undefined,
        estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : undefined,
        customer_discount: parseFloat(formData.customer_discount) || 0,
        project_notes: formData.notes.trim() || undefined,
      };

      // Create project via API service
      const newProject = await projectService.createProject(projectData);

      Alert.alert(t('auth.success'), t('auth.projectCreatedSuccessfully'), [
        {
          text: t('auth.ok'),
          onPress: () => {
            navigation.goBack();
            // Navigate to the new project detail
            navigation.navigate('ProjectDetail', { id: newProject.id });
          }
        }
      ]);
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert(t('auth.error'), t('auth.projectCouldNotBeCreated'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header with Back Button and Title */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('projects.createNewProjectTitle')}</Text>
          </View>
        </View>

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
            <Text style={styles.sectionTitle}>{t('projects.basicInformation')}</Text>
          </View>
          
          <Text style={styles.label}>{t('projects.projectNameRequired')}</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
            placeholder={t('projects.projectNamePlaceholder')}
          />

          <Text style={styles.label}>{t('projects.description')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => handleInputChange('description', text)}
            placeholder={t('projects.descriptionPlaceholder')}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>{t('projects.location')}</Text>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => handleInputChange('location', text)}
            placeholder={t('projects.locationPlaceholder')}
          />
        </View>



        {/* Timeline */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Calendar size={24} color="#000000" />
            <Text style={styles.sectionTitle}>{t('projects.timeline')}</Text>
          </View>

          <View style={styles.dateInputContainer}>
            <View style={styles.dateInput}>
              <Text style={styles.label}>{t('projects.startDate')}</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={{ color: startDate ? '#000000' : '#9ca3af' }}>
                  {startDate ? formatDate(startDate) : t('projects.selectDate')}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateInput}>
              <Text style={styles.label}>{t('projects.targetDate')}</Text>
              <TouchableOpacity 
                style={styles.input}
                onPress={() => setShowTargetDatePicker(true)}
              >
                <Text style={{ color: targetDate ? '#000000' : '#9ca3af' }}>
                  {targetDate ? formatDate(targetDate) : t('projects.selectDate')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
            />
          )}

          {showTargetDatePicker && (
            <DateTimePicker
              value={targetDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTargetDateChange}
            />
          )}
        </View>

        {/* Financial Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <DollarSign size={24} color="#000000" />
            <Text style={styles.sectionTitle}>{t('projects.financialPlanning')}</Text>
          </View>

          <Text style={styles.label}>{t('projects.estimatedBudget')}</Text>
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

          <Text style={[styles.label, { marginTop: 16 }]}>{t('projects.customerDiscount')}</Text>
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
            {t('projects.customerDiscountHint')}
          </Text>
        </View>

        {/* Additional Notes */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Tag size={24} color="#000000" />
            <Text style={styles.sectionTitle}>{t('projects.additionalInformation')}</Text>
          </View>

          <Text style={styles.label}>{t('projects.notes')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.notes}
            onChangeText={(text) => handleInputChange('notes', text)}
            placeholder={t('projects.notesPlaceholder')}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Create Button */}
        <Button 
          onPress={handleCreateProject}
          disabled={isCreating || !formData.name.trim()}
          style={styles.createButton}
          textStyle={styles.createButtonText}
        >
          {isCreating ? t('projects.creating') : t('projects.createProject')}
        </Button>
      </ScrollView>
    </View>
  );
}