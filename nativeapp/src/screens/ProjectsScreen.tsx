import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ProjectsStackParamList } from '../navigation/ProjectsStackNavigator';
import { Calendar, Package, ArrowRight, Plus } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { useAuth } from '../../lib/contexts/AuthContext';
import { supabase } from '../../lib/utils/supabase';
import { Project } from '../../lib/types/project';


type ProjectsScreenNavigationProp = StackNavigationProp<ProjectsStackParamList, 'ProjectsList'>;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerContainer: {
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
  },
  projectCard: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  projectHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  projectHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  projectDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  projectDetailText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
  },
  projectActions: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  primaryActionButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  primaryActionButtonText: {
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  headerText: {
    flex: 1,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default function ProjectsScreen() {
  const navigation = useNavigation<ProjectsScreenNavigationProp>();
  const auth = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Safety check
  if (!auth) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.emptyState}>
          <Text style={styles.loadingText}>Authentication required</Text>
        </View>
      </View>
    );
  }

  const { user } = auth;

  const loadProjects = useCallback(async () => {
    if (!user || !supabase) return;

    try {
      const { data, error } = await supabase
        .from('user_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        // Only show alert if it's not a "table doesn't exist" error
        if (error.code !== '42P01') {
          Alert.alert('Error', `Failed to load projects: ${error.message}`);
        }
        setProjects([]);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Error', `Failed to load projects: ${errorMessage}`);
      setProjects([]);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  }, [loadProjects]);

  useEffect(() => {
    const initializeProjects = async () => {
      setLoading(true);
      await loadProjects();
      setLoading(false);
    };

    initializeProjects();
  }, [loadProjects]);

  const handleCreateProject = () => {
    navigation.navigate('CreateProject' as any);
  };

  const handleViewProject = (projectId: string) => {
    navigation.navigate('ProjectDetail', { id: projectId });
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
        <Header />
        <View style={styles.emptyState}>
          <Text style={styles.loadingText}>Loading projects...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header with Create Button */}
        <View style={styles.headerActions}>
          <View style={styles.headerText}>
            <Text style={styles.title}>My Projects</Text>
            <Text style={styles.subtitle}>
              Create and manage your lighting projects.
            </Text>
          </View>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateProject}>
            <Plus size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>New Project</Text>
          </TouchableOpacity>
        </View>

        {/* Projects List */}
        {projects.length > 0 ? (
          projects.map((project) => {
            const statusColors = getStatusColor(project.status);
            return (
              <Card key={project.id} style={styles.projectCard}>
                {/* Project Header */}
                <View style={styles.projectHeader}>
                  <View style={styles.projectHeaderRow}>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectTitle}>{project.project_name}</Text>
                      
                      <View style={styles.projectDetail}>
                        <Calendar size={20} color="#6b7280" />
                        <Text style={styles.projectDetailText}>
                          {formatDate(project.updated_at)}
                        </Text>
                      </View>
                      
                      <View style={styles.projectDetail}>
                        <Package size={20} color="#6b7280" />
                        <Text style={styles.projectDetailText}>
                          {project.priority || 'medium'} priority
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.statusText, { color: statusColors.text }]}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Project Actions */}
                <View style={styles.projectActions}>
                  
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.primaryActionButton]}
                    onPress={() => handleViewProject(project.id)}
                  >
                    <ArrowRight size={16} color="#ffffff" />
                    <Text style={[styles.actionButtonText, styles.primaryActionButtonText]}>
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <Package size={48} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No Projects Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first lighting project to get started.
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateProject}>
              <Plus size={20} color="#ffffff" />
              <Text style={styles.createButtonText}>Neues Projekt</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}