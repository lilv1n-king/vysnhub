import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Calendar, Package, Copy, ArrowRight } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';

const dummyProjects = [
  {
    id: 1,
    name: 'Office Renovation - Building A',
    date: '2024-12-15',
    products: [
      'LED Panel 40W 4000K',
      'Track Light System',
      'Emergency Exit Signs'
    ],
    totalItems: 24,
    status: 'Completed'
  },
  {
    id: 2,
    name: 'Retail Store Lighting',
    date: '2024-11-28',
    products: [
      'LED Downlights 15W',
      'Linear LED Strips',
      'Pendant Lights'
    ],
    totalItems: 18,
    status: 'Completed'
  },
  {
    id: 3,
    name: 'Warehouse Installation',
    date: '2024-10-20',
    products: [
      'High Bay LED 150W',
      'Motion Sensors',
      'Industrial Fixtures'
    ],
    totalItems: 32,
    status: 'Completed'
  },
  {
    id: 4,
    name: 'Restaurant Ambience',
    date: '2024-09-14',
    products: [
      'Dimmable LED Spots',
      'Color Temperature Tunable',
      'Decorative Pendants'
    ],
    totalItems: 16,
    status: 'Completed'
  }
];

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
});

export default function ProjectsScreen() {
  const navigation = useNavigation();

  const handleViewProject = (projectId: number) => {
    console.log('View project:', projectId);
    // navigation.navigate('ProjectDetail', { id: projectId });
  };

  const handleCopyProject = (projectId: number) => {
    console.log('Copy project:', projectId);
  };

  const handleSettingsPress = () => {
    console.log('Settings button pressed - Auth coming soon!');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <Header onSettingsPress={handleSettingsPress} />
      <ScrollView style={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>My Projects</Text>
          <Text style={styles.subtitle}>
            View and manage your recent lighting installations.
          </Text>
        </View>

        {/* Projects List */}
        {dummyProjects.length > 0 ? (
          dummyProjects.map((project) => (
            <Card key={project.id} style={styles.projectCard}>
              {/* Project Header */}
              <View style={styles.projectHeader}>
                <View style={styles.projectHeaderRow}>
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle}>{project.name}</Text>
                    
                    <View style={styles.projectDetail}>
                      <Calendar size={20} color="#6b7280" />
                      <Text style={styles.projectDetailText}>
                        {formatDate(project.date)}
                      </Text>
                    </View>
                    
                    <View style={styles.projectDetail}>
                      <Package size={20} color="#6b7280" />
                      <Text style={styles.projectDetailText}>
                        {project.totalItems} items
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{project.status}</Text>
                  </View>
                </View>
              </View>

              {/* Project Actions */}
              <View style={styles.projectActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleCopyProject(project.id)}
                >
                  <Copy size={16} color="#374151" />
                  <Text style={styles.actionButtonText}>Copy Project</Text>
                </TouchableOpacity>
                
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
          ))
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <Package size={48} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No Projects Yet</Text>
            <Text style={styles.emptyStateText}>
              Start your first lighting project by browsing our product catalog.
            </Text>
            <Button 
              style={{ backgroundColor: '#000000', paddingHorizontal: 16, paddingVertical: 12 }}
              textStyle={{ color: '#ffffff', fontSize: 16, fontWeight: '500' }}
              onPress={() => navigation.navigate('Products')}
            >
              Browse Products
            </Button>
          </View>
        )}
      </ScrollView>
    </View>
  );
}