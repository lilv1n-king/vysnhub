import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ProjectsStackParamList } from '../navigation/ProjectsStackNavigator';
import { Calendar, Package, ArrowRight, ArrowLeft, History } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Project } from '../../lib/types/project';
import { projectService } from '../../lib/services/projectService';
import { useTranslation } from 'react-i18next';

type ProjectHistoryScreenNavigationProp = StackNavigationProp<ProjectsStackParamList, 'ProjectHistory'>;

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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
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
  },
  viewButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  viewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default function ProjectHistoryScreen() {
  const navigation = useNavigation<ProjectHistoryScreenNavigationProp>();
  const auth = useAuth();
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Safety check for auth
  if (!auth) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.emptyState}>
          <Text style={styles.loadingText}>{t('projects.authenticationRequired')}</Text>
        </View>
      </View>
    );
  }

  const { user } = auth;

  const loadCompletedProjects = useCallback(async () => {
    if (!user) return;

    try {
      const projects = await projectService.getUserProjects();
      // Filter only completed projects
      const completedProjects = projects.filter(project => project.status === 'completed');
      setProjects(completedProjects);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert(t('projects.error'), `${t('projects.errorLoadingProjects')}: ${errorMessage}`);
      setProjects([]);
    }
  }, [user, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCompletedProjects();
    setRefreshing(false);
  }, [loadCompletedProjects]);

  useEffect(() => {
    const initializeProjects = async () => {
      setLoading(true);
      await loadCompletedProjects();
      setLoading(false);
    };

    initializeProjects();
  }, [loadCompletedProjects]);

  const handleViewProject = (projectId: string) => {
    navigation.navigate('ProjectDetail', { id: projectId });
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
      default:
        return { bg: '#dcfce7', text: '#16a34a' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('projects.completed');
      default:
        return t('projects.completed');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.emptyState}>
          <Text style={styles.loadingText}>{t('projects.loadingProjects')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#ffffff" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{t('projects.projectHistory')}</Text>
          <Text style={styles.subtitle}>
            {t('projects.completedProjectsDescription')}
          </Text>
        </View>

        {/* Projects List */}
        {projects.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIcon}>
              <History size={64} color="#d1d5db" />
            </View>
            <Text style={styles.emptyStateTitle}>
              {t('projects.noCompletedProjects')}
            </Text>
            <Text style={styles.emptyStateText}>
              {t('projects.noCompletedProjectsDescription')}
            </Text>
          </View>
        ) : (
          projects.map((project) => {
            const statusColors = getStatusColor(project.status);
            
            return (
              <Card key={project.id} style={styles.projectCard}>
                <View style={styles.projectHeader}>
                  <View style={styles.projectHeaderRow}>
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectTitle}>{project.project_name}</Text>
                      
                      <View style={styles.projectDetail}>
                        <Calendar size={16} color="#6b7280" />
                        <Text style={styles.projectDetailText}>
                          {t('projects.completed')} {formatDate(project.updated_at)}
                        </Text>
                      </View>
                      
                      {project.project_location && (
                        <View style={styles.projectDetail}>
                          <Package size={16} color="#6b7280" />
                          <Text style={styles.projectDetailText}>
                            {project.project_location}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                      <Text style={[styles.statusText, { color: statusColors.text }]}>
                        {getStatusText(project.status)}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.projectActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => handleViewProject(project.id)}
                  >
                    <Text style={styles.viewButtonText}>{t('projects.viewDetails')}</Text>
                    <ArrowRight size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}