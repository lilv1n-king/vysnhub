import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  User, 
  LogOut, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  CreditCard,
  Edit3,
  Save,
  X,
  ArrowLeft
} from 'lucide-react-native';
import { useAuth } from '../../lib/contexts/AuthContext';
import Header from '../components/Header';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  profileCard: {
    padding: 20,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  customerNumber: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  discountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 12,
  },
  discountText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
  },
  saveButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default function SettingsScreen() {
  const navigation = useNavigation();
  const auth = useAuth();
  
  // Safety check - if auth context is not available, show error
  if (!auth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: '#ef4444', textAlign: 'center' }}>
          Authentication service not available
        </Text>
      </View>
    );
  }

  const { user, signOut, updateProfile } = auth;
  const [editing, setEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const profile = user?.profile;

  const handleEdit = (field: string, currentValue: string) => {
    setEditing(field);
    setEditValues({ [field]: currentValue || '' });
  };

  const handleSave = async (field: string) => {
    try {
      const { error } = await updateProfile({ [field]: editValues[field] });
      
      if (error) {
        Alert.alert('Error', `Failed to update ${field}: ${error.message}`);
      } else {
        setEditing(null);
        setEditValues({});
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setEditValues({});
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your VYSN account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (!profile?.first_name && !profile?.last_name) return 'U';
    return (profile?.first_name?.[0] || '') + (profile?.last_name?.[0] || '');
  };

  const getFullName = () => {
    if (!profile?.first_name && !profile?.last_name) return 'User';
    return `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  };

  const renderEditableField = (
    field: string,
    label: string,
    value: string,
    icon: React.ReactNode,
    placeholder?: string
  ) => {
    const isEditing = editing === field;
    
    return (
      <View style={styles.infoItem}>
        <View style={styles.infoIcon}>{icon}</View>
        <View style={styles.infoText}>
          <Text style={styles.infoLabel}>{label}</Text>
          {isEditing ? (
            <TextInput
              style={styles.editInput}
              value={editValues[field] || ''}
              onChangeText={(text) => setEditValues(prev => ({ ...prev, [field]: text }))}
              placeholder={placeholder}
              autoFocus
            />
          ) : (
            <Text style={styles.infoValue}>{value || 'Not set'}</Text>
          )}
        </View>
        <View style={styles.editActions}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => handleSave(field)}
              >
                <Save size={16} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <X size={16} color="#ffffff" />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(field, value)}
            >
              <Edit3 size={16} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.goBack()} />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color="#6b7280" />
          <Text style={styles.backButtonText}>Zurück</Text>
        </TouchableOpacity>
        
        <View style={styles.scrollContent}>
          <Text style={styles.loadingText}>Please sign in to view settings</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header onSettingsPress={() => navigation.goBack()} />
      
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={20} color="#6b7280" />
        <Text style={styles.backButtonText}>Zurück</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollContent}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <Card style={styles.profileCard}>
            <CardContent style={{ padding: 0 }}>
              <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials()}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.userName}>{getFullName()}</Text>
                  <Text style={styles.userEmail}>{user.email}</Text>
                  {profile && (
                    <View style={styles.customerInfo}>
                      <Text style={styles.customerNumber}>
                        Customer: {profile.customer_number}
                      </Text>
                      {profile.discount_percentage > 0 && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>
                            {profile.discount_percentage}% Discount
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.infoGrid}>
            {renderEditableField(
              'phone',
              'Phone Number',
              profile?.phone || '',
              <Phone size={20} color="#6b7280" />,
              '+49 123 456 7890'
            )}
            
            {renderEditableField(
              'company_name',
              'Company',
              profile?.company_name || '',
              <Building size={20} color="#6b7280" />,
              'Your Company GmbH'
            )}
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <View style={styles.infoGrid}>
            {renderEditableField(
              'address_line_1',
              'Street Address',
              profile?.address_line_1 || '',
              <MapPin size={20} color="#6b7280" />,
              'Musterstraße 123'
            )}
            
            {renderEditableField(
              'city',
              'City',
              profile?.city || '',
              <MapPin size={20} color="#6b7280" />,
              'Berlin'
            )}
            
            {renderEditableField(
              'postal_code',
              'Postal Code',
              profile?.postal_code || '',
              <MapPin size={20} color="#6b7280" />,
              '10115'
            )}
          </View>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <View style={styles.infoIcon}>
                <CreditCard size={20} color="#6b7280" />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Account Type</Text>
                <Text style={styles.infoValue}>
                  {profile?.customer_type?.charAt(0).toUpperCase() + profile?.customer_type?.slice(1) || 'Standard'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}