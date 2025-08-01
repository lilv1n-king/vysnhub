import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Switch } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { ProjectsStackParamList } from '../navigation/ProjectsStackNavigator';
import { ArrowLeft, Calendar, Package, Edit, Trash2, Save, X, MapPin, DollarSign, Target, Tag } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../../lib/contexts/AuthContext';
import { supabase } from '../../lib/utils/supabase';
import { Project } from '../../lib/types/project';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  projectHeader: {
    marginBottom: 24,
  },
  projectTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  projectInfoText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
  },
  editForm: {
    gap: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#000000',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  dangerButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
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
    paddingVertical: 8,
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  removeTagButton: {
    padding: 2,
  },
  addTagInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
});

type ProjectDetailScreenNavigationProp = StackNavigationProp<ProjectsStackParamList, 'ProjectDetail'>;
type ProjectDetailScreenRouteProp = RouteProp<ProjectsStackParamList, 'ProjectDetail'>;

export default function ProjectDetailScreen() {
  const route = useRoute<ProjectDetailScreenRouteProp>();
  const navigation = useNavigation<ProjectDetailScreenNavigationProp>();
  const auth = useAuth();
  const { id } = route.params;
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    location: '',
    status: 'planning' as Project['status'],
    priority: 'medium' as Project['priority'],
    start_date: '',
    target_completion_date: '',
    estimated_budget: '',
    notes: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  // Safety check
  if (!auth) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
        </View>
        <View style={[styles.scrollContent, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.errorText}>Authentication required</Text>
        </View>
      </View>
    );
  }

  const { user } = auth;

  const loadProject = useCallback(async () => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        Alert.alert('Error', 'Failed to load project');
        return;
      }

      setProject(data);
      setEditData({
        name: data.project_name || '',
        description: data.project_description || '',
        location: data.project_location || '',
        status: data.status || 'planning',
        priority: data.priority || 'medium',
        start_date: data.start_date || '',
        target_completion_date: data.target_completion_date || '',
        estimated_budget: data.estimated_budget ? data.estimated_budget.toString() : '',
        notes: data.project_notes || '',
        tags: data.tags || []
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to load project');
    }
  }, [id, user]);

  useEffect(() => {
    const initializeProject = async () => {
      setLoading(true);
      await loadProject();
      setLoading(false);
    };

    initializeProject();
  }, [loadProject]);

  const handleSave = async () => {
    if (!project || !supabase) return;

    try {
      const { error } = await supabase
        .from('user_projects')
        .update({
          project_name: editData.name,
          project_description: editData.description,
          project_location: editData.location,
          status: editData.status,
          priority: editData.priority,
          start_date: editData.start_date || null,
          target_completion_date: editData.target_completion_date || null,
          estimated_budget: editData.estimated_budget ? parseFloat(editData.estimated_budget) : null,
          project_notes: editData.notes,
          tags: editData.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);

      if (error) {
        Alert.alert('Error', 'Failed to update project');
        return;
      }

      await loadProject();
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update project');
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editData.tags.includes(newTag.trim())) {
      setEditData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { bg: '#fee2e2', text: '#dc2626' };
      case 'high':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'medium':
        return { bg: '#dbeafe', text: '#2563eb' };
      case 'low':
        return { bg: '#f3f4f6', text: '#6b7280' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!project || !supabase) return;

            try {
              const { error } = await supabase
                .from('user_projects')
                .delete()
                .eq('id', project.id);

              if (error) {
                Alert.alert('Error', 'Failed to delete project');
                return;
              }

              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete project');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#dcfce7', text: '#16a34a' };
      case 'active':
        return { bg: '#dbeafe', text: '#2563eb' };
      case 'planning':
        return { bg: '#f3f4f6', text: '#6b7280' };
      case 'on_hold':
        return { bg: '#fef3c7', text: '#d97706' };
      case 'cancelled':
        return { bg: '#fee2e2', text: '#dc2626' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
        </View>
        <View style={[styles.scrollContent, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.loadingText}>Loading project...</Text>
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
        </View>
        <View style={[styles.scrollContent, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.errorText}>Project not found</Text>
        </View>
      </View>
    );
  }

  const statusColors = getStatusColor(project.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Project Details</Text>
        
        <View style={styles.headerActions}>
          {editing ? (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                <Save size={20} color="#16a34a" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => setEditing(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={() => setEditing(true)}>
                <Edit size={20} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollContent}>
        {editing ? (
          /* Edit Form */
          <View style={styles.editForm}>
            <View>
              <Text style={styles.label}>Project Name</Text>
              <TextInput
                style={styles.input}
                value={editData.name}
                onChangeText={(text) => setEditData(prev => ({ ...prev, name: text }))}
                placeholder="Enter project name"
              />
            </View>

            <View>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.description}
                onChangeText={(text) => setEditData(prev => ({ ...prev, description: text }))}
                placeholder="Enter project description"
                multiline
                numberOfLines={4}
              />
            </View>

            <View>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={editData.location}
                onChangeText={(text) => setEditData(prev => ({ ...prev, location: text }))}
                placeholder="Project location"
              />
            </View>

            <View>
              <Text style={styles.label}>Status</Text>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {(['planning', 'active', 'completed', 'on_hold', 'cancelled'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusBadge,
                      { 
                        backgroundColor: editData.status === status ? '#000000' : '#f3f4f6',
                        marginTop: 0 
                      }
                    ]}
                    onPress={() => setEditData(prev => ({ ...prev, status }))}
                  >
                    <Text style={[
                      styles.statusText,
                      { color: editData.status === status ? '#ffffff' : '#6b7280' }
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityContainer}>
                {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityBadge,
                      editData.priority === priority && styles.selectedPriorityBadge
                    ]}
                    onPress={() => setEditData(prev => ({ ...prev, priority }))}
                  >
                    <Text style={[
                      styles.priorityText,
                      editData.priority === priority && styles.selectedPriorityText
                    ]}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={styles.label}>Dates</Text>
              <View style={styles.dateInputContainer}>
                <View style={styles.dateInput}>
                  <Text style={[styles.label, { marginBottom: 4, fontSize: 14 }]}>Start Date</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.start_date}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, start_date: text }))}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View style={styles.dateInput}>
                  <Text style={[styles.label, { marginBottom: 4, fontSize: 14 }]}>Target Date</Text>
                  <TextInput
                    style={styles.input}
                    value={editData.target_completion_date}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, target_completion_date: text }))}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>
            </View>

            <View>
              <Text style={styles.label}>Estimated Budget</Text>
              <View style={styles.budgetInput}>
                <Text style={styles.currencySymbol}>€</Text>
                <TextInput
                  style={styles.budgetTextInput}
                  value={editData.estimated_budget}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, estimated_budget: text }))}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View>
              <Text style={styles.label}>Tags</Text>
              <View style={styles.tagContainer}>
                {editData.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity 
                      style={styles.removeTagButton}
                      onPress={() => handleRemoveTag(tag)}
                    >
                      <X size={14} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <TextInput
                style={styles.addTagInput}
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add new tag"
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
            </View>

            <View>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.notes}
                onChangeText={(text) => setEditData(prev => ({ ...prev, notes: text }))}
                placeholder="Additional notes"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        ) : (
          /* View Mode */
          <View>
            <View style={styles.projectHeader}>
              <Text style={styles.projectTitle}>{project.project_name}</Text>
              
              <View style={styles.projectInfo}>
                <Calendar size={20} color="#6b7280" />
                <Text style={styles.projectInfoText}>
                  Created {formatDate(project.created_at)}
                </Text>
              </View>
              
              <View style={styles.projectInfo}>
                <Package size={20} color="#6b7280" />
                <Text style={styles.projectInfoText}>
                  {project.priority || 'medium'} priority
                </Text>
              </View>
              
              {project.project_location && (
                <View style={styles.projectInfo}>
                  <MapPin size={20} color="#6b7280" />
                  <Text style={styles.projectInfoText}>
                    {project.project_location}
                  </Text>
                </View>
              )}
              
              {project.estimated_budget && (
                <View style={styles.projectInfo}>
                  <DollarSign size={20} color="#6b7280" />
                  <Text style={styles.projectInfoText}>
                    Budget: €{project.estimated_budget.toLocaleString()}
                  </Text>
                </View>
              )}
              
              {project.target_completion_date && (
                <View style={styles.projectInfo}>
                  <Target size={20} color="#6b7280" />
                  <Text style={styles.projectInfoText}>
                    Due {formatDate(project.target_completion_date)}
                  </Text>
                </View>
              )}
              
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusText, { color: statusColors.text }]}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Text>
              </View>
            </View>

            {project.project_description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <View style={styles.card}>
                  <Text style={{ fontSize: 16, color: '#374151', lineHeight: 24 }}>
                    {project.project_description}
                  </Text>
                </View>
              </View>
            )}

            {project.tags && project.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.card}>
                  <View style={styles.tagContainer}>
                    {project.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Tag size={16} color="#6b7280" />
                        <Text style={[styles.tagText, { marginLeft: 6, marginRight: 0 }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {project.project_notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.card}>
                  <Text style={{ fontSize: 16, color: '#374151', lineHeight: 24 }}>
                    {project.project_notes}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}