import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ProjectsStackParamList } from '../navigation/ProjectsStackNavigator';
import { Calendar, Package, ArrowRight, Plus, History } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Project } from '../../lib/types/project';
import { projectService } from '../../lib/services/projectService';
import { useTranslation } from 'react-i18next';


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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  header: {
    marginBottom: 16,
  },
  createButtonFullWidth: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#000000',
    borderColor: '#000000',
    marginBottom: 24,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  historyButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  historyButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  historySection: {
    marginTop: 4,
    marginBottom: 40,
    paddingHorizontal: 0,
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
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Safety check
  if (!auth) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
        <View style={styles.emptyState}>
          <Text style={styles.loadingText}>{t('projects.authenticationRequired')}</Text>
        </View>
      </View>
    );
  }

  const { user } = auth;

  const loadProjects = useCallback(async () => {
    if (!user) return;

    try {
      const projects = await projectService.getUserProjects();
      // Filter out completed projects
      const activeProjects = projects.filter(project => project.status !== 'completed');
      setProjects(activeProjects);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(t('projects.error'), `${t('projects.errorLoadingProjects')}: ${errorMessage}`);
      setProjects([]);
    }
  }, [user, t]);

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

  const handleViewHistory = () => {
    navigation.navigate('ProjectHistory');
  };



  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('projects.completed');
      case 'active':
        return t('projects.active');
      case 'planning':
        return t('projects.planning');
      case 'on_hold':
        return t('projects.onHold');
      case 'cancelled':
        return t('projects.cancelled');
      default:
        return t('projects.planning');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
        <View style={styles.emptyState}>
          <Text style={styles.loadingText}>{t('projects.loadingProjects')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      <ScrollView 
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('projects.activeProjects')}</Text>
        </View>

        {/* Create Button - Full Width */}
        <TouchableOpacity style={styles.createButtonFullWidth} onPress={handleCreateProject}>
          <Text style={styles.createButtonText}>{t('projects.newProject')}</Text>
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>

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
                          {t(project.priority || 'medium')} {t('priority')}
                        </Text>
                      </View>
                    </View>
                    
                                      <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                    <Text style={[styles.statusText, { color: statusColors.text }]}>
                      {getStatusText(project.status)}
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
                      {t('projects.viewDetails')}
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
            <Text style={styles.emptyStateTitle}>{t('projects.noProjectsYet')}</Text>
            <Text style={styles.emptyStateText}>
              {t('projects.createFirstProjectDescription')}
            </Text>
            <TouchableOpacity style={styles.createButtonFullWidth} onPress={handleCreateProject}>
              <Text style={styles.createButtonText}>{t('projects.newProject')}</Text>
              <Plus size={20} color="#ffffff" />
            </TouchableOpacity>
            
            {/* History Button auch bei Empty State */}
            <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
              <Text style={styles.historyButtonText}>{t('projects.viewHistory')}</Text>
              <History size={20} color="#374151" />
            </TouchableOpacity>
          </View>
        )}

        {/* History Button - unten platziert */}
        <View style={styles.historySection}>
          <TouchableOpacity style={styles.historyButton} onPress={handleViewHistory}>
            <Text style={styles.historyButtonText}>{t('projects.viewHistory')}</Text>
            <History size={20} color="#374151" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}