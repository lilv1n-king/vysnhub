import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Switch, Image, Platform, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { ProjectsStackParamList } from '../navigation/ProjectsStackNavigator';
import { ArrowLeft, Calendar, Package, Edit, Trash2, Save, X, MapPin, DollarSign, Target, Tag, Eye, EyeOff, Plus, Minus, AlertTriangle, ShoppingCart, Check } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Project } from '../../lib/types/project';
import { projectService, ProjectOrderStatus } from '../../lib/services/projectService';
import { apiService } from '../../lib/services/apiService';
import { VysnProduct } from '../../lib/types/product';
import { getProductByItemNumber } from '../../lib/utils/product-data';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';

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
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },

  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  // Product styles
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  margeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  margeToggleActive: {
    backgroundColor: '#374151',
    borderColor: '#374151',
  },
  margeToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  margeToggleTextActive: {
    color: '#ffffff',
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginRight: 16,
  },
  productContent: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productTitleContainer: {
    flex: 1,
  },
  productDeleteButton: {
    padding: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  productItemNumber: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  productQuantity: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  quantityControlsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  quantityInput: {
    width: 50,
    height: 32,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  margeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  costPriceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
  },
  salePriceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  noProductsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  projectInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  projectInfoCard: {
    width: '48%',
    height: 70,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    justifyContent: 'center',
  },
  budgetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  budgetEditButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  budgetEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetSaveButton: {
    backgroundColor: '#374151',
    padding: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  budgetCancelButton: {
    backgroundColor: '#f3f4f6',
    padding: 6,
    borderRadius: 6,
    marginLeft: 4,
  },
  statusSection: {
    marginTop: 12,
    marginBottom: 32,
  },
  statusLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  editLabel: {
    fontSize: 16,
    color: '#374151',
    marginRight: 8,
  },
  budgetEditInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  budgetWarning: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetWarningText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  statusPickerScroll: {
    marginTop: 8,
  },
  statusOption: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  statusOptionSelected: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  statusOptionTextSelected: {
    color: '#ffffff',
  },
  
  // Responsive inline editing styles
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minHeight: 32,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editInput: {
    flex: 1,
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  saveButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 6,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cancelButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6b7280',
    borderRadius: 6,
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  projectInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    paddingHorizontal: 4,
  },
  projectInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 4,
    marginRight: 6,
    width: 50,
    flexShrink: 0,
  },
  projectInfoValue: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
    lineHeight: 14,
  },
  dateEditButton: {
    flex: 1,
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  dateEditText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  
  // Modal styles für DatePicker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 15,
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: 'bold',
  },
  datePicker: {
    alignSelf: 'center',
  },
  
  // Ordered product controls
  orderedProductControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderedBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  orderedBadgeText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  
  // Header action buttons
  editActionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginRight: 8,
  },
  saveActionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 12,
    marginRight: 8,
  },
  cancelActionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6b7280',
    borderRadius: 12,
    marginRight: 8,
  },
  orderActionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 12,
    marginRight: 8,
  },
  largeOrderButton: {
    marginTop: 16,
    backgroundColor: '#000000',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  orderButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  fullWidthCard: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  detailValue: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'right',
  },
  detailInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
    minWidth: 120,
    textAlign: 'right',
  },
  detailDateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    minWidth: 120,
  },
  detailDateText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 6,
  },
  headerDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageSymbol: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  compactPercentageInput: {
    width: 80,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  detailTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  detailTextValue: {
    flexWrap: 'wrap',
    flex: 1,
  },
  titleInput: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 0,
    paddingVertical: 4,
    paddingHorizontal: 8,
    minHeight: 32,
    maxHeight: 32,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    flex: 1,
  },
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameEditActions: {
    flexDirection: 'row',
    marginLeft: 8,
    gap: 4,
  },
  nameActionButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameEditIcon: {
    marginLeft: 8,
    opacity: 0.6,
  },
  editActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  headerEditActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerSaveButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCancelButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  wideTextArea: {
    fontSize: 16,
    color: '#000000',
    textAlignVertical: 'top',
    minHeight: 100,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    lineHeight: 24,
  },
  wideTextValue: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    padding: 16,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 8,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  compactEditInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 10,
    backgroundColor: '#ffffff',
    height: 24,
    textAlignVertical: 'center',
    flex: 1,
  },
  compactDateInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#ffffff',
    height: 24,
    justifyContent: 'center',
    flex: 1,
  },
  compactDateText: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
  },
});

type ProjectDetailScreenNavigationProp = StackNavigationProp<ProjectsStackParamList, 'ProjectDetail'>;
type ProjectDetailScreenRouteProp = RouteProp<ProjectsStackParamList, 'ProjectDetail'>;

export default function ProjectDetailScreen() {
  const route = useRoute() as ProjectDetailScreenRouteProp;
  const navigation = useNavigation() as ProjectDetailScreenNavigationProp;
  const auth = useAuth();
  const { t } = useTranslation();
  const { id } = route.params;
  
  const [project, setProject] = useState(null as Project | null);
  const [loading, setLoading] = useState(true);

  const [showMarge, setShowMarge] = useState(false);
  const [userProfile, setUserProfile] = useState(null as any);
  const [projectProducts, setProjectProducts] = useState([] as any[]);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    location: '',
    status: 'planning' as any,

    start_date: '',
    target_completion_date: '',
    estimated_budget: '',
    notes: '',
    tags: [] as string[],
    customer_discount: 0 // Projektspezifischer Endkundenrabatt
  });
  const [newTag, setNewTag] = useState('');
  
  // Central editing state
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  
  // Temporary values for editing
  const [tempName, setTempName] = useState('');
  const [tempDescription, setTempDescription] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempStartDate, setTempStartDate] = useState(null as Date | null);
  const [tempTargetDate, setTempTargetDate] = useState(null as Date | null);
  const [tempBudget, setTempBudget] = useState('');
  const [tempCustomerDiscount, setTempCustomerDiscount] = useState('');
  
  // DatePicker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showTargetDatePicker, setShowTargetDatePicker] = useState(false);
  
  // Order state
  const [isOrdering, setIsOrdering] = useState(false);
  const [isProjectOrdered, setIsProjectOrdered] = useState(false);
  const [orderStatus, setOrderStatus] = useState<ProjectOrderStatus | null>(null);

  // Safety check
  if (!auth) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
        <View style={styles.centerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.errorText}>{t('projects.authenticationRequired')}</Text>
        </View>
      </View>
    );
  }

  const { user } = auth;

  const loadProject = useCallback(async () => {
    if (!user) return;

    try {
      const data = await projectService.getProject(id);

      if (!data) {
        Alert.alert(t('projects.error'), t('projects.couldNotLoadProject'));
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
        tags: data.tags || [],
        customer_discount: data.customer_discount || 0
      });

      // TODO: Load user profile for discount via API service
      // For now, set a default profile
      setUserProfile({ discount_percentage: 0 });

      console.log('✅ Project loaded successfully, now checking order status...');
      
      // Erst Order Status laden, dann Produkte parsen
      try {
        const status = await projectService.getProjectOrderStatus(data.id);
        setOrderStatus(status);
        console.log('📦 Order status loaded:', status);
        
        // Jetzt Produkte mit korrektem orderStatus parsen
        await parseProjectProductsWithOrderStatus(data.project_notes || '', status);
      } catch (error) {
        console.log('⚠️ Order status check failed:', error);
        // Fallback: keine Orders
        const fallbackStatus = {
          hasOrders: false,
          orderedItems: [],
          availableToOrder: []
        };
        setOrderStatus(fallbackStatus);
        
        // Parse products with fallback status
        await parseProjectProductsWithOrderStatus(data.project_notes || '', fallbackStatus);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      Alert.alert(t('projects.error'), t('projects.couldNotLoadProject'));
    }
  }, [id, user, t]);

  const checkIfProjectIsOrdered = async (projectId: string) => {
    try {
      console.log(`🔍 Checking order status for project: ${projectId}`);
      
      // Verwende eine einfachere URL ohne Komma-getrennte Status
      const response = await Promise.race([
        apiService.get(`/api/orders?project_id=${projectId}`),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout after 5s')), 5000))
      ]) as any;
      
      console.log('📋 Order check response:', response);
      
      if (response.success && response.data && response.data.orders) {
        // Filtere nach relevanten Status
        const activeOrders = response.data.orders.filter((order: any) => 
          ['pending', 'confirmed', 'processing', 'shipped'].includes(order.order_status)
        );
        
        if (activeOrders.length > 0) {
          setIsProjectOrdered(true);
          console.log('⚠️ Project is already ordered:', activeOrders.length, 'active orders found');
        } else {
          setIsProjectOrdered(false);
          console.log('✅ Project not yet ordered (no active orders)');
        }
      } else {
        console.log('📝 No orders data in response, assuming not ordered');
        setIsProjectOrdered(false);
      }
    } catch (error: any) {
      console.error('❌ Error checking order status:', error);
      console.log('🔧 API Error details:', error.response?.data || error.message);
      
      // Bei API-Fehlern erlauben wir die Bestellung (fail-safe)
      setIsProjectOrdered(false);
    }
  };

  const parseProjectProductsWithOrderStatus = async (notes: string, currentOrderStatus: any) => {
    console.log('🔍 Parsing products with order status:', { 
      hasOrders: currentOrderStatus?.hasOrders, 
      orderedItems: currentOrderStatus?.orderedItems?.length || 0 
    });
    
    const products: any[] = [];
    const lines = notes.split('\n');
    const productMap = new Map(); // Sammle alle Instanzen desselben Produkts
    
    // Erst alle Zeilen sammeln und nach itemNumber gruppieren
    for (const line of lines) {
      const match = line.match(/•?\s*(\d+)x\s+(.+?)\s+\(([^)]+)\)/);
      if (match) {
        const [, quantity, name, itemNumber] = match;
        const trimmedItemNumber = itemNumber.trim();
        // Entferne künstliche Suffixe aus alten Notizen (z.B. _ordered, _new_<ts>)
        const baseItemNumber = trimmedItemNumber
          .replace(/_ordered$/i, '')
          .replace(/_new_\d+$/i, '');
        
        if (!productMap.has(baseItemNumber)) {
          productMap.set(baseItemNumber, {
            totalQuantity: 0,
            name: name.trim(),
            itemNumber: baseItemNumber
          });
        }
        productMap.get(baseItemNumber).totalQuantity += parseInt(quantity);
      }
    }
    
    // Jetzt für jedes eindeutige Produkt die Kacheln erstellen
    for (const [itemNumber, productInfo] of productMap) {
      try {
        const productData = await getProductByItemNumber(itemNumber);
        if (productData) {
          const hasOrders = !!currentOrderStatus?.hasOrders;
          const orderedQuantity = hasOrders 
            ? (currentOrderStatus.orderedItems?.find(item => item.productId === productData.id)?.totalQuantity || 0)
            : 0;
          
          console.log(`📦 Product ${itemNumber}: total=${productInfo.totalQuantity}, ordered=${orderedQuantity}`);
          
          if (hasOrders && orderedQuantity > 0) {
            // 1. Kachel für bereits bestellte Menge
            products.push({
              quantity: orderedQuantity,
              itemNumber: `${itemNumber}_ordered`,
              name: productInfo.name,
              productData,
              isOrdered: true,
              uniqueKey: `${itemNumber}_ordered`,
              baseItemNumber: itemNumber
            });
            
            // 2. Kachel für neue Menge (wenn vorhanden)
            const newQuantity = productInfo.totalQuantity - orderedQuantity;
            if (newQuantity > 0) {
              const timestamp = Date.now();
              products.push({
                quantity: newQuantity,
                itemNumber: `${itemNumber}_new_${timestamp}`,
                name: productInfo.name,
                productData,
                isOrdered: false,
                uniqueKey: `${itemNumber}_new_${timestamp}`,
                baseItemNumber: itemNumber
              });
            }
          } else {
            // Noch nicht bestelltes Produkt: normale Kachel
            products.push({
              quantity: productInfo.totalQuantity,
              itemNumber: itemNumber,
              name: productInfo.name,
              productData,
              isOrdered: false,
              uniqueKey: `${itemNumber}_unordered`,
              baseItemNumber: itemNumber
            });
          }
        }
      } catch (error) {
        console.log('Fehler beim Laden des Produkts:', itemNumber, error);
      }
    }
    
    console.log('✅ Parsed products:', products.map(p => ({ 
      key: p.uniqueKey, 
      qty: p.quantity, 
      ordered: p.isOrdered 
    })));
    
    setProjectProducts(products);
  };

  const updateProductQuantity = async (itemNumber: string, newQuantity: number) => {
    if (!project) return;
    
    console.log(`🔢 Updating quantity for ${itemNumber}: ${newQuantity}`);

    try {
      // Update local state immediately for better UX
      const updatedProducts = projectProducts.map(product => 
        product.itemNumber === itemNumber 
          ? { ...product, quantity: newQuantity }
          : product
      );
      
      // Remove duplicates and merge quantities
      const mergedProducts = mergeProductDuplicates(updatedProducts);
      setProjectProducts(mergedProducts);

      // Wenn bereits Bestellungen existieren, berechne nachträglich bestellbare Mengen neu
      if (orderStatus?.hasOrders) {
        const orderedMap: Record<number, number> = {};
        (orderStatus.orderedItems || []).forEach(item => {
          orderedMap[item.productId] = item.totalQuantity;
        });
        const newAvailable = mergedProducts
          .map((p: any) => ({
            productId: p.id,
            availableQuantity: Math.max(0, (p.quantity || 0) - (orderedMap[p.id] || 0))
          }))
          .filter(i => i.availableQuantity > 0);
        setOrderStatus(prev => prev ? { ...prev, availableToOrder: newAvailable } : prev);
      }

      // Update project_notes in database (in background)
      const updatedNotes = generateProjectNotes(mergedProducts);
      
      // Don't await - let it run in background for better UX
      projectService.updateProject(project.id, {
        project_notes: updatedNotes
      }).catch(error => {
        console.error('Fehler beim Aktualisieren der Produktmenge:', error);
        // Revert local changes on error
        parseProjectProducts(project.project_notes || '');
      });
      
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Produktmenge:', error);
    }
  };

  const removeProductFromProject = async (itemNumber: string) => {
    if (!project) return;

    Alert.alert(
      t('projects.removeProduct'),
      t('projects.removeProductConfirm'),
      [
        { text: t('projects.cancel'), style: 'cancel' },
        {
          text: t('projects.remove'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Update local state
              const updatedProducts = projectProducts.filter(product => 
                product.itemNumber !== itemNumber
              );
              setProjectProducts(updatedProducts);

              // Update project_notes in database
              const updatedNotes = generateProjectNotes(updatedProducts);
              
              try {
                // Update project via API service
                await projectService.updateProject(project.id, {
                  project_notes: updatedNotes
                });
              } catch (error) {
                console.error('Fehler beim Entfernen des Produkts:', error);
                // Revert local changes on error
                await parseProjectProducts(project.project_notes || '');
              }
            } catch (error) {
              console.error('Fehler beim Entfernen des Produkts:', error);
            }
          }
        }
      ]
    );
  };

  const mergeProductDuplicates = (products: any[]) => {
    const productMap = new Map();
    
    products.forEach(product => {
      if (productMap.has(product.itemNumber)) {
        const existing = productMap.get(product.itemNumber);
        existing.quantity += product.quantity;
      } else {
        productMap.set(product.itemNumber, { ...product });
      }
    });
    
    return Array.from(productMap.values());
  };

  const generateProjectNotes = (products: any[]) => {
    if (products.length === 0) return '';
    
    // Ensure no duplicates before generating notes
    const mergedProducts = mergeProductDuplicates(products);
    
    const productLines = mergedProducts.map(product => 
      `• ${product.quantity}x ${product.name} (${product.itemNumber})`
    );
    
    return `Products:\n${productLines.join('\n')}`;
  };

  useEffect(() => {
    const initializeProject = async () => {
      setLoading(true);
      await loadProject();
      setLoading(false);
    };

    initializeProject();
  }, [loadProject]);

  const handleStatusChange = async (newStatus: Project['status']) => {
    if (!project) return;

    try {
      // Update project via API service
      await projectService.updateProject(project.id, {
        status: newStatus
      });
      
      await loadProject();
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert(t('projects.error'), t('projects.couldNotUpdateProject'));
    }
  };



  // Central edit handlers
  const handleEdit = () => {
    // Temp values setzen
    setTempName(project?.project_name || '');
    setTempDescription(project?.project_description || '');
    setTempLocation(project?.project_location || '');
    setTempStartDate(project?.start_date ? new Date(project.start_date) : null);
    setTempTargetDate(project?.target_completion_date ? new Date(project.target_completion_date) : null);
    setTempBudget(project?.estimated_budget?.toString() || '');
    setTempCustomerDiscount((project?.customer_discount || 0).toString());
    
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowStartDatePicker(false);
    setShowTargetDatePicker(false);
  };

  const handleSaveAll = async () => {
    if (!project) return;
    
    const updateData = {
      project_name: tempName.trim(),
      project_description: tempDescription.trim() || undefined,
      project_location: tempLocation.trim() || undefined,
      start_date: tempStartDate?.toISOString().split('T')[0] || undefined,
      target_completion_date: tempTargetDate?.toISOString().split('T')[0] || undefined,
      estimated_budget: parseFloat(tempBudget) || 0,
      customer_discount: parseFloat(tempCustomerDiscount) || 0,
    };

    try {
      // Update project via API service
      await projectService.updateProject(project.id, updateData);
      
      setProject(prev => prev ? { ...prev, ...updateData } : prev);
      setIsEditing(false);
      Alert.alert(t('common.success'), t('auth.projectUpdatedSuccessfully'));
    } catch (error) {
      console.error('Error updating project:', error);
      Alert.alert(t('projects.error'), t('projects.couldNotUpdateProject'));
    }
  };



  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    
    if (selectedDate && event.type !== 'dismissed') {
      setTempStartDate(selectedDate);
      if (Platform.OS === 'ios') {
        setShowStartDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowStartDatePicker(false);
    }
  };

  const handleTargetDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowTargetDatePicker(false);
    }
    
    if (selectedDate && event.type !== 'dismissed') {
      setTempTargetDate(selectedDate);
      if (Platform.OS === 'ios') {
        setShowTargetDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowTargetDatePicker(false);
    }
  };

  const handleSave = async () => {
    if (!project) return;

    try {
      // Update project via API service
      await projectService.updateProject(project.id, {
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
        customer_discount: editData.customer_discount
      });

      await loadProject();
    } catch (error) {
      console.error('Error saving project:', error);
      Alert.alert(t('projects.error'), t('projects.couldNotUpdateProject'));
    }
  };

  const handleEditName = () => {
    setTempName(project?.project_name || '');
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!project || !tempName.trim()) return;

    try {
      await projectService.updateProject(project.id, {
        project_name: tempName.trim()
      });
      setIsEditingName(false);
      await loadProject();
    } catch (error) {
      console.error('Error saving project name:', error);
      Alert.alert(t('projects.error'), t('projects.couldNotUpdateProject'));
    }
  };

  const handleCancelName = () => {
    setTempName('');
    setIsEditingName(false);
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



  const handleDelete = () => {
    Alert.alert(
      t('projects.deleteProject'),
      t('projects.deleteProjectConfirm'),
      [
        { text: t('projects.cancel'), style: 'cancel' },
        {
          text: t('projects.delete'),
          style: 'destructive',
          onPress: async () => {
            if (!project) return;

            try {
              // Delete project via API service
              await projectService.deleteProject(project.id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert(t('projects.error'), t('projects.couldNotDeleteProject'));
            }
          }
        }
      ]
    );
  };

  const handleOrder = () => {
    if (!project || !auth?.user || !orderStatus) return;

    // Prüfe ob das Projekt Produkte enthält
    if (!project.project_notes || projectProducts.length === 0) {
      Alert.alert(
        t('projects.order.error'),
        t('projects.order.noProducts'),
        [{ text: 'OK' }]
      );
      return;
    }

    // Neue Logik: Nur neue/unbestellte Produkte bestellen
    const newProducts = projectProducts.filter(item => {
      return item.isOrdered !== true;
    });

    if (newProducts.length === 0) {
      Alert.alert(
        t('projects.order.error'),
        orderStatus?.hasOrders ? t('projects.order.allOrdered') : t('projects.order.noProducts'),
        [{ text: 'OK' }]
      );
      return;
    }

    const orderNumber = orderStatus?.hasOrders ? (orderStatus.orderedItems?.length || 0) + 1 : 1;
    const message = orderStatus?.hasOrders 
      ? t('projects.order.confirmReorder', { 
          projectName: project.project_name,
          orderNumber,
          newItems: newProducts.length 
        })
      : t('projects.order.confirmMessage', { projectName: project.project_name });

    // Erstelle Liste der neuen Artikel für Bestätigung
    const itemsList = newProducts.map(item => {
      return `• ${item.productData?.vysnName || item.name || 'Unbekanntes Produkt'} (${item.quantity}x)`;
    }).join('\n');

    Alert.alert(
      orderStatus?.hasOrders ? t('projects.order.reorderTitle', { orderNumber }) : t('projects.order.title'),
      `${message}\n\n${t('projects.order.newItems')}:\n${itemsList}`,
      [
        { text: t('projects.cancel'), style: 'cancel' },
        {
          text: t('projects.order.send'),
          onPress: async () => {
            setIsOrdering(true);
            try {
              console.log('📧 Sending order email for project:', project.project_name);
              
              // Prüfe ob es sich um eine Nachbestellung handelt
              const isReorder = orderStatus?.hasOrders || false;
              
              const orderItems = newProducts.map(item => ({
                itemNumber: item.itemNumber,
                name: item.productData?.vysnName || item.name,
                quantity: item.quantity
              }));

              console.log(`📦 ${orderNumber}. Order with ${orderItems.length} new items`);
              
              const response = await apiService.post('/api/email/order', {
                projectId: project.id,
                isReorder: isReorder,
                orderNumber,
                reorderItems: isReorder ? orderItems : undefined, // Bei Nachbestellung: reorderItems
                customerInfo: {
                  name: auth.user.user_metadata?.full_name || auth.user.email?.split('@')[0] || 'Kunde',
                  email: auth.user.email || '',
                  company: auth.user.user_metadata?.company || undefined
                },
                orderNotes: isReorder 
                  ? `${orderNumber}. Nachbestellung über VYSN Hub App\nProjekt: ${project.project_name}\nNur neue Artikel: ${orderItems.length}`
                  : `1. Bestellung über VYSN Hub App\nProjekt: ${project.project_name}`
              });

              if (response.success) {
                // Nach erfolgreichem Senden: Status direkt aktualisieren,
                // damit kein Doppelklick möglich ist und UI "ordered" zeigt.
                try {
                  const status = await projectService.getProjectOrderStatus(project.id);
                  setOrderStatus(status);
                  
                  // Produkte mit neuem Status neu parsen
                  await parseProjectProductsWithOrderStatus(project.project_notes || '', status);
                  console.log('🔄 Products reparsed with new order status');
                } catch (e) {
                  // Fallback: markiere als ordered, wenn API grad nicht erreichbar
                  const fallbackStatus = { hasOrders: true, orderedItems: [], availableToOrder: [] };
                  setOrderStatus(fallbackStatus);
                  
                  // Produkte mit Fallback-Status neu parsen
                  await parseProjectProductsWithOrderStatus(project.project_notes || '', fallbackStatus);
                }

                Alert.alert(
                  t('projects.order.success'),
                  isReorder 
                    ? t('projects.order.reorderSuccessMessage', { orderNumber })
                    : t('projects.order.successMessage'),
                  [{ text: 'OK' }]
                );
                console.log(`✅ ${orderNumber}. Order email sent successfully`);
              } else {
                throw new Error(response.error || 'Unknown error');
              }
            } catch (error: any) {
              console.error('❌ Error sending order email:', error);
              
              // Spezielle Behandlung für bereits bestellte Projekte
              if (error.message?.includes('already ordered') || 
                  (error.response && error.response.data?.error === 'Project already ordered')) {
                Alert.alert(
                  t('projects.order.error'),
                  t('projects.order.alreadyOrdered'),
                  [{ 
                    text: 'OK', 
                    onPress: () => setIsProjectOrdered(true) // Update state
                  }]
                );
              } else {
                Alert.alert(
                  t('projects.order.error'),
                  t('projects.order.errorMessage'),
                  [{ text: 'OK' }]
                );
              }
            } finally {
              setIsOrdering(false);
            }
          }
        }
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const calculateDiscount = (price: number, discountPercentage: number) => {
    return price * (discountPercentage / 100);
  };

  const calculateMarge = (salePrice: number, costPrice: number) => {
    if (costPrice === 0) return 0;
    return ((salePrice - costPrice) / salePrice) * 100;
  };

  const renderProductCard = (productItem: any) => {
    const { quantity, productData } = productItem;
    const userDiscountPercentage = userProfile?.discount_percentage || 30; // Standard 30%
    const customerDiscountPercentage = project?.customer_discount || 0;
    
    if (!productData) return null;

    const unitPrice = productData.grossPrice || 0; // VK/Endkundenpreis
    const totalVKPrice = unitPrice * quantity;
    
    // Benutzer-Einkaufspreis (VK - 30%)
    const userCostPrice = unitPrice * (1 - userDiscountPercentage / 100);
    const totalUserCost = userCostPrice * quantity;
    
    // Endkunden-Verkaufspreis (VK - projektspezifischer Rabatt)
    const customerPrice = unitPrice * (1 - customerDiscountPercentage / 100);
    const totalCustomerPrice = customerPrice * quantity;
    
    // Gewinn/Verlust
    const profit = totalCustomerPrice - totalUserCost;
    const profitPercentage = totalUserCost > 0 ? (profit / totalUserCost) * 100 : 0;

    return (
      <View key={productItem.itemNumber} style={styles.productCard}>
        <View style={styles.productImage}>
          {productData.product_picture_1 ? (
            <Image 
              source={{ uri: productData.product_picture_1 }} 
              style={{ width: '100%', height: '100%', borderRadius: 8 }}
              resizeMode="contain"
            />
          ) : (
            <View style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: '#f3f4f6', 
              borderRadius: 8,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Package size={32} color="#9ca3af" />
            </View>
          )}
        </View>
        
        <View style={styles.productContent}>
          <View style={styles.productHeader}>
            <View style={styles.productTitleContainer}>
              <Text style={styles.productName}>{productData.vysnName}</Text>
              <Text style={styles.productItemNumber}>#{productData.itemNumberVysn}</Text>
            </View>
            <TouchableOpacity
              style={styles.productDeleteButton}
              onPress={() => removeProductFromProject(productItem.itemNumber)}
            >
              <Trash2 size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
          
          {/* Quantity Controls */}
          <View style={styles.quantityControls}>
            <View style={styles.quantityControlsLeft}>
              {(() => {
                const isOrderedProduct = productItem.isOrdered === true;
                
                // Wenn Produkt bereits bestellt wurde: nur Menge und Badge anzeigen
                if (isOrderedProduct) {
                  return (
                    <View style={styles.orderedProductControls}>
                      <Text style={{ color: '#6b7280', fontWeight: '500', fontSize: 16 }}>{quantity}</Text>
                      <Text style={[styles.productQuantity, { marginLeft: 8 }]}>{t('projects.pieces')}</Text>
                      
                      <View style={styles.orderedBadge}>
                        <Text style={styles.orderedBadgeText}>{t('projects.ordered')}</Text>
                      </View>
                    </View>
                  );
                }
                
                // Normale Controls für neue/unbestellte Produkte
                return (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.quantityButton,
                        quantity <= 1 && { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' }
                      ]}
                      onPress={() => {
                        const newQuantity = Math.max(1, quantity - 1);
                        console.log(`➖ Decreasing ${productItem.itemNumber} from ${quantity} to ${newQuantity}`);
                        updateProductQuantity(productItem.itemNumber, newQuantity);
                      }}
                      disabled={quantity <= 1}
                      activeOpacity={0.7}
                    >
                      <Minus size={16} color={quantity <= 1 ? '#9ca3af' : '#000000'} />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={styles.quantityInput}
                      value={quantity.toString()}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 1;
                        if (value >= 1 && value <= 99) {
                          console.log(`✏️ Manual input ${productItem.itemNumber}: ${value}`);
                          updateProductQuantity(productItem.itemNumber, value);
                        }
                      }}
                      keyboardType="numeric"
                      selectTextOnFocus={true}
                    />
                    
                    <TouchableOpacity 
                      style={[
                        styles.quantityButton,
                        quantity >= 99 && { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' }
                      ]}
                      onPress={() => {
                        const newQuantity = Math.min(99, quantity + 1);
                        console.log(`➕ Increasing ${productItem.itemNumber} from ${quantity} to ${newQuantity}`);
                        updateProductQuantity(productItem.itemNumber, newQuantity);
                      }}
                      disabled={quantity >= 99}
                      activeOpacity={0.7}
                    >
                      <Plus size={16} color={quantity >= 99 ? '#9ca3af' : '#000000'} />
                    </TouchableOpacity>
                    
                    <Text style={styles.productQuantity}>{t('projects.pieces')}</Text>
                  </>
                );
              })()}
            </View>
          </View>
          
          {showMarge ? (
            // Geschäftsdaten-Ansicht mit Kalkulation
            <>
              <View style={[styles.priceRow, { backgroundColor: '#f9fafb', padding: 8, borderRadius: 6, marginBottom: 8 }]}>
                <Text style={[styles.priceLabel, { fontWeight: '600' }]}>{t('projects.calculation')}:</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('projects.listPrice')}:</Text>
                <Text style={styles.priceValue}>{formatPrice(unitPrice)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {t('projects.myPurchasePrice')} (-{userDiscountPercentage}%):
                </Text>
                <Text style={styles.costPriceValue}>{formatPrice(userCostPrice)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {customerDiscountPercentage > 0 
                    ? `${t('projects.customerSalesPrice')} (-${customerDiscountPercentage}%):` 
                    : `${t('projects.price')}:`
                  }
                </Text>
                <Text style={styles.salePriceValue}>{formatPrice(customerPrice)}</Text>
              </View>
              
              <View style={[styles.priceRow, { backgroundColor: '#f0f9ff', padding: 6, borderRadius: 4, marginTop: 8 }]}>
                <Text style={[styles.priceLabel, { fontWeight: '600' }]}>
                  {t('projects.total')} ({quantity.toString()} {t('projects.pieces')}):
                </Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('projects.iPay')}:</Text>
                <Text style={styles.costPriceValue}>{formatPrice(totalUserCost)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('projects.iReceive')}:</Text>
                <Text style={styles.salePriceValue}>{formatPrice(totalCustomerPrice)}</Text>
              </View>
              
              <View style={[styles.priceRow, { borderTopWidth: 2, borderTopColor: '#e5e7eb', paddingTop: 8, marginTop: 8 }]}>
                <Text style={[styles.priceLabel, { fontWeight: 'bold', fontSize: 16 }]}>{t('projects.profit')}:</Text>
                <Text style={[
                  profit >= 0 ? styles.salePriceValue : styles.costPriceValue,
                  { fontWeight: 'bold', fontSize: 16 }
                ]}>
                  {formatPrice(profit)}
                </Text>
              </View>
            </>
          ) : (
            // Standard-Ansicht
            <>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('projects.unitPrice')}:</Text>
                <Text style={styles.priceValue}>{formatPrice(customerPrice)}</Text>
              </View>
              
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>{t('projects.subtotal')}:</Text>
                <Text style={styles.priceValue}>{formatPrice(totalCustomerPrice)}</Text>
              </View>
              
              {customerDiscountPercentage > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>
                  {t('projects.discount')} ({customerDiscountPercentage}%):
                </Text>
                  <Text style={styles.discountValue}>-{formatPrice(totalVKPrice - totalCustomerPrice)}</Text>
                </View>
              )}
            </>
          )}
          
          {!showMarge && (
            <View style={[styles.priceRow, { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#e5e7eb' }]}>
              <Text style={[styles.priceLabel, { fontWeight: '600' }]}>{t('projects.total')}:</Text>
              <Text style={styles.totalPrice}>{formatPrice(totalCustomerPrice)}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('projects.selectDate');
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
        <View style={styles.centerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.loadingText}>{t('projects.loadingProject')}</Text>
        </View>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={styles.container}>
        <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
        <View style={styles.centerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.errorText}>{t('projects.projectNotFound')}</Text>
        </View>
      </View>
    );
  }

  const statusColors = getStatusColor(project.status);

  // Calculate project totals for budget comparison
  const projectTotal = projectProducts.reduce((total, item) => {
    const unitPrice = item.productData?.grossPrice || 0;
    const customerDiscountPercentage = project?.customer_discount || 0;
    const customerPrice = unitPrice * (1 - customerDiscountPercentage / 100);
    return total + (customerPrice * item.quantity);
  }, 0);

  const budgetDifference = project.estimated_budget ? project.estimated_budget - projectTotal : 0;
  const showBudgetWarning = project.estimated_budget && projectProducts.length > 0 && Math.abs(budgetDifference) > 0.01;

  return (
    <View style={styles.container}>
      <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header mit Back Button, Titel und Action Buttons */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft size={20} color="#ffffff" />
          </TouchableOpacity>
          
            <View style={styles.titleContainer}>
              {isEditingName ? (
                <View style={styles.nameEditContainer}>
                  <TextInput
                    style={styles.titleInput}
                    value={tempName}
                    onChangeText={setTempName}
                    placeholder="Projektname"
                    autoFocus
                  />
                  <View style={styles.nameEditActions}>
                    <TouchableOpacity style={styles.nameActionButton} onPress={handleSaveName}>
                      <Check size={18} color="#16a34a" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.nameActionButton} onPress={handleCancelName}>
                      <X size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity onPress={handleEditName} style={styles.nameContainer}>
                  <Text style={styles.projectTitle}>{project.project_name}</Text>
                  <Edit size={16} color="#6b7280" style={styles.nameEditIcon} />
                </TouchableOpacity>
              )}
            </View>
          
          {/* Delete Button - oben rechts */}
          <TouchableOpacity style={styles.headerDeleteButton} onPress={handleDelete}>
            <Trash2 size={18} color="#dc2626" />
          </TouchableOpacity>

        </View>
        
        <View>
            {/* Status Section - back above products */}
            <View style={styles.statusSection}>
              <Text style={styles.statusLabel}>Status:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusPickerScroll}>
                {['planning', 'active', 'completed', 'on_hold', 'cancelled'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusOption,
                      project.status === status && styles.statusOptionSelected
                    ]}
                    onPress={() => handleStatusChange(status as any)}
                  >
                    <Text style={[
                      styles.statusOptionText,
                      project.status === status && styles.statusOptionTextSelected
                    ]}>
                      {getStatusText(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Products Section */}
            <View style={styles.section}>
              <View style={styles.productsHeader}>
                <Text style={styles.sectionTitle}>{t('projects.products')}</Text>
                {projectProducts.length > 0 && (
                  <TouchableOpacity 
                    style={[
                      styles.margeToggle,
                      showMarge && styles.margeToggleActive
                    ]}
                    onPress={() => setShowMarge(!showMarge)}
                  >
                    {showMarge ? (
                      <EyeOff size={16} color="#ffffff" />
                    ) : (
                      <Eye size={16} color="#6b7280" />
                    )}
                    <Text style={[
                      styles.margeToggleText,
                      showMarge && styles.margeToggleTextActive
                    ]}>
                      {showMarge ? t('projects.hideDetails') : t('projects.showDetails')}
                    </Text>
                  </TouchableOpacity>
                )}
                  </View>
              
              {projectProducts.length > 0 ? (
                <>
                  {projectProducts.map((item, index) => (
                    <View key={item.uniqueKey || `${item.itemNumber}_${index}`}>
                      {renderProductCard(item)}
                    </View>
                  ))}
                
                {/* Project Total */}
                <View style={[styles.card, { marginTop: 16, backgroundColor: '#f9fafb' }]}>
                  {(() => {
                    return (
                      <>
                        <View style={styles.priceRow}>
                          <Text style={[styles.sectionTitle, { marginBottom: 0, fontSize: 18 }]}>
                            {t('projects.projectTotal')}:
                          </Text>
                          <Text style={[styles.totalPrice, { fontSize: 18 }]}>
                            {formatPrice(projectTotal)}
                          </Text>
                        </View>
                        {(project?.customer_discount || 0) > 0 && (
                          <Text style={{ fontSize: 14, color: '#059669', textAlign: 'right', marginTop: 4 }}>
                            {t('projects.withCustomerDiscount', { discount: project?.customer_discount || 0 })}
                          </Text>
                        )}
                      </>
                    );
                  })()}
                  
                  {showMarge && (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#d1d5db' }}>
                      <View style={styles.priceRow}>
                        <Text style={[styles.priceLabel, { fontWeight: '600', color: '#dc2626' }]}>
                          {t('projects.myTotalCosts')}:
                        </Text>
                        <Text style={[styles.costPriceValue, { fontSize: 16, fontWeight: 'bold' }]}>
                          {formatPrice(projectProducts.reduce((total, item) => {
                            const unitPrice = item.productData?.grossPrice || 0;
                            const userDiscountPercentage = userProfile?.discount_percentage || 30;
                            const userCostPrice = unitPrice * (1 - userDiscountPercentage / 100);
                            return total + (userCostPrice * item.quantity);
                          }, 0))}
                        </Text>
                      </View>
                      
                      <View style={[styles.priceRow, { borderTopWidth: 2, borderTopColor: '#059669', paddingTop: 8, marginTop: 8 }]}>
                        <Text style={[styles.priceLabel, { fontWeight: 'bold', fontSize: 16 }]}>
                          {t('projects.myTotalProfit')}:
                        </Text>
                        <Text style={[styles.salePriceValue, { fontSize: 16, fontWeight: 'bold' }]}>
                          {formatPrice(projectProducts.reduce((total, item) => {
                            const unitPrice = item.productData?.grossPrice || 0;
                            const userDiscountPercentage = userProfile?.discount_percentage || 30;
                            const userCostPrice = unitPrice * (1 - userDiscountPercentage / 100);
                            const customerDiscountPercentage = project?.customer_discount || 0;
                            const customerPrice = unitPrice * (1 - customerDiscountPercentage / 100);
                            const profit = customerPrice - userCostPrice;
                            return total + (profit * item.quantity);
                          }, 0))}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Large Order Button */}
                {(() => {
                  // Nur neue/unbestellte Produkte können bestellt werden
                  const newProducts = projectProducts.filter(item => {
                    return item.isOrdered !== true;
                  });
                  
                  const canOrder = newProducts.length > 0;
                  const isDisabled = isOrdering || !canOrder;
                  const orderNumber = orderStatus?.hasOrders ? (orderStatus.orderedItems?.length || 0) + 1 : 1;
                  
                  return (
                <TouchableOpacity 
                  style={[
                    styles.largeOrderButton, 
                    isDisabled && { opacity: 0.6, backgroundColor: '#9ca3af' }
                  ]} 
                  onPress={handleOrder}
                  disabled={isDisabled}
                >
                  <View style={styles.orderButtonContent}>
                    {orderStatus?.hasOrders ? (
                      newProducts.length > 0 ? (
                        <>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={{ color: '#ffffff', fontSize: 14, marginRight: 6 }}>{orderNumber}.</Text>
                            <ShoppingCart size={20} color="#ffffff" />
                          </View>
                          <Text style={styles.orderButtonText}>
                            {t('projects.order.newItems')} ({newProducts.length})
                          </Text>
                        </>
                      ) : (
                        <>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <Text style={{ color: '#ffffff', fontSize: 14, marginRight: 6 }}>✓</Text>
                            <ShoppingCart size={20} color="#ffffff" />
                          </View>
                          <Text style={styles.orderButtonText}>
                            {t('projects.order.allOrdered')}
                          </Text>
                        </>
                      )
                    ) : (
                      <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ color: '#ffffff', fontSize: 14, marginRight: 6 }}>1.</Text>
                          <ShoppingCart size={20} color="#ffffff" />
                        </View>
                        <Text style={styles.orderButtonText}>
                          {t('projects.order.title')} ({projectProducts.length})
                        </Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>
                  );
                })()}
                </>
              ) : (
                <View style={styles.card}>
                  <Text style={styles.noProductsText}>
                    {t('projects.noProductsInProject')}
                  </Text>
                </View>
              )}
            </View>

            {/* Project Details Section - moved below products */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('projects.projectDetails')}</Text>
                {isEditing ? (
                  <View style={styles.headerEditActions}>
                    <TouchableOpacity style={styles.headerSaveButton} onPress={handleSaveAll}>
                      <Save size={16} color="#ffffff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerCancelButton} onPress={handleCancel}>
                      <X size={16} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                    <Edit size={20} color="#000000" />
                    <Text style={styles.editButtonText}>{t('projects.edit')}</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Budget - Full Width */}
              <View style={[styles.card, styles.fullWidthCard]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <DollarSign size={20} color="#6b7280" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{t('projects.budget')}</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.detailInput}
                        value={tempBudget}
                        onChangeText={setTempBudget}
                        placeholder="0"
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text style={styles.detailValue}>
                        €{project.estimated_budget?.toLocaleString() || '0'}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Start Date - Full Width */}
              <View style={[styles.card, styles.fullWidthCard]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Calendar size={20} color="#6b7280" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{t('projects.startDate')}</Text>
                    {isEditing ? (
                      <TouchableOpacity 
                        style={styles.detailDateInput}
                        onPress={() => setShowStartDatePicker(true)}
                      >
                        <Text style={styles.detailDateText}>
                          {tempStartDate ? tempStartDate.toLocaleDateString('de-DE') : t('projects.selectDate')}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.detailValue}>
                        {project.start_date ? formatDate(project.start_date) : t('projects.noStartDate')}
                      </Text>
                    )}
                  </View>
                  </View>
                </View>

              {/* Target Date - Full Width */}
              <View style={[styles.card, styles.fullWidthCard]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Target size={20} color="#6b7280" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{t('projects.targetDate')}</Text>
                    {isEditing ? (
                      <TouchableOpacity 
                        style={styles.detailDateInput}
                        onPress={() => setShowTargetDatePicker(true)}
                      >
                        <Text style={styles.detailDateText}>
                          {tempTargetDate ? tempTargetDate.toLocaleDateString('de-DE') : t('projects.selectDate')}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.detailValue}>
                        {project.target_completion_date ? formatDate(project.target_completion_date) : t('projects.noTargetDate')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Location - Full Width */}
              <View style={[styles.card, styles.fullWidthCard]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <MapPin size={20} color="#6b7280" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{t('projects.location')}</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.detailInput}
                        value={tempLocation}
                        onChangeText={setTempLocation}
                        placeholder={t('projects.enterLocation')}
                      />
                    ) : (
                      <Text style={styles.detailValue}>
                        {project.project_location || t('projects.noLocation')}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Customer Discount - Full Width */}
              <View style={[styles.card, styles.fullWidthCard]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <DollarSign size={20} color="#059669" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{t('projects.customerDiscount')}</Text>
                    {isEditing ? (
                      <View style={styles.percentageInputContainer}>
                        <TextInput
                          style={styles.compactPercentageInput}
                          value={tempCustomerDiscount}
                          onChangeText={setTempCustomerDiscount}
                          placeholder="0"
                          keyboardType="numeric"
                        />
                        <Text style={styles.percentageSymbol}>%</Text>
                      </View>
                    ) : (
                      <Text style={styles.detailValue}>
                        {project.customer_discount ?? 0}%
                      </Text>
                    )}
                  </View>
                </View>
              </View>




            </View>



            {project.tags && project.tags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('projects.tags')}</Text>
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



            {project.project_notes && projectProducts.length === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('projects.notes')}</Text>
                <View style={styles.card}>
                  <Text style={{ fontSize: 16, color: '#374151', lineHeight: 24 }}>
                    {project.project_notes}
                  </Text>
                </View>
              </View>
            )}

            {/* Description Section - moved under tags and made wider */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('projects.description')}</Text>
              <View style={styles.card}>
                {isEditing ? (
                  <TextInput
                    style={styles.wideTextArea}
                    value={tempDescription}
                    onChangeText={setTempDescription}
                    placeholder={t('projects.enterDescription')}
                    multiline
                    numberOfLines={4}
                  />
                ) : (
                  <Text style={styles.wideTextValue}>
                    {project.project_description || t('projects.noDescription')}
                  </Text>
                )}
              </View>
            </View>

          </View>
      </ScrollView>

      {/* DatePicker Modals - nur iOS */}
      {Platform.OS === 'ios' && showStartDatePicker && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showStartDatePicker}
          onRequestClose={() => setShowStartDatePicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowStartDatePicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Startdatum auswählen</Text>
                <TouchableOpacity 
                  onPress={() => setShowStartDatePicker(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempStartDate || new Date()}
                mode="date"
                display="compact"
                onChange={handleStartDateChange}
                style={styles.datePicker}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {Platform.OS === 'ios' && showTargetDatePicker && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showTargetDatePicker}
          onRequestClose={() => setShowTargetDatePicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowTargetDatePicker(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Zieldatum auswählen</Text>
                <TouchableOpacity 
                  onPress={() => setShowTargetDatePicker(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempTargetDate || new Date()}
                mode="date"
                display="compact"
                onChange={handleTargetDateChange}
                style={styles.datePicker}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* Android DatePicker */}
      {Platform.OS === 'android' && showStartDatePicker && (
        <DateTimePicker
          value={tempStartDate || new Date()}
          mode="date"
          display="calendar"
          onChange={handleStartDateChange}
        />
      )}

      {Platform.OS === 'android' && showTargetDatePicker && (
        <DateTimePicker
          value={tempTargetDate || new Date()}
          mode="date"
          display="calendar"
          onChange={handleTargetDateChange}
        />
      )}
    </View>
  );
}