import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, UserPlus, LogIn, Building, Phone, MapPin, CreditCard, Check } from 'lucide-react-native';
import { useAuth } from '../../lib/contexts/AuthContext';
import Button from '../components/ui/Button';
import { API_BASE_URL } from '../../lib/config/api';

type RegistrationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Registration'>;

const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<RegistrationScreenNavigationProp>();
  const { t } = useTranslation();
  
  // Form state - alle wichtigen Felder aus der DB
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: 'Germany',
    vatNumber: '',
  });
  
  // Consent states
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Refs for form navigation
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const companyNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressLine1Ref = useRef<TextInput>(null);
  const addressLine2Ref = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const postalCodeRef = useRef<TextInput>(null);
  const countryRef = useRef<TextInput>(null);
  const vatNumberRef = useRef<TextInput>(null);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email || !formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!privacyConsent) {
      newErrors.privacyConsent = 'You must accept the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle registration
  const handleRegistration = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        company_name: formData.companyName || undefined,
        phone: formData.phone || undefined,
        address_line_1: formData.addressLine1 || undefined,
        address_line_2: formData.addressLine2 || undefined,
        city: formData.city || undefined,
        postal_code: formData.postalCode || undefined,
        country: formData.country || undefined,
        vat_number: formData.vatNumber || undefined,
        marketing_consent: marketingConsent,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Navigiere zur E-Mail-Verifikation
          navigation.navigate('EmailVerification', {
            email: formData.email,
            password: formData.password,
          });
        } else {
          Alert.alert('Registration failed', data.error || 'Unknown error');
        }
      } else {
        const errorData = await response.json();
        Alert.alert('Registration failed', errorData.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to login
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  // Privacy Policy öffnen
  const openPrivacyPolicy = () => {
    Linking.openURL('https://vysn.de/datenschutz');
  };

  const renderInput = (
    field: string,
    placeholder: string,
    icon: React.ReactNode,
    options: {
      secureTextEntry?: boolean;
      keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
      returnKeyType?: 'next' | 'done';
      ref?: React.RefObject<TextInput>;
      onSubmitEditing?: () => void;
      multiline?: boolean;
    } = {}
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{placeholder}</Text>
      <View style={[styles.inputWrapper, focusedField === field && styles.inputWrapperFocused]}>
        <View style={styles.inputIcon}>
          {icon}
        </View>
        <TextInput
          ref={options.ref}
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={formData[field as keyof typeof formData]}
          onChangeText={(value) => handleInputChange(field, value)}
          onFocus={() => setFocusedField(field)}
          onBlur={() => setFocusedField(null)}
          secureTextEntry={options.secureTextEntry}
          keyboardType={options.keyboardType || 'default'}
          autoCapitalize={options.autoCapitalize || 'sentences'}
          autoCorrect={false}
          returnKeyType={options.returnKeyType || 'next'}
          onSubmitEditing={options.onSubmitEditing}
          multiline={options.multiline}
        />
        {field === 'password' && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
          </TouchableOpacity>
        )}
        {field === 'confirmPassword' && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
          </TouchableOpacity>
        )}
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo & Title */}
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo} 
              />
              <Text style={styles.title}>Registration</Text>
              <Text style={styles.subtitle}>
                Create your VYSN account and get access to professional lighting solutions
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Personal Data */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personal Information</Text>
                
                {renderInput('email', 'Email Address *', <UserPlus size={20} color="#6b7280" />, {
                  keyboardType: 'email-address',
                  autoCapitalize: 'none',
                  ref: undefined,
                  onSubmitEditing: () => passwordRef.current?.focus(),
                })}

                {renderInput('password', 'Password *', <Eye size={20} color="#6b7280" />, {
                  secureTextEntry: !showPassword,
                  ref: passwordRef,
                  onSubmitEditing: () => confirmPasswordRef.current?.focus(),
                })}

                {renderInput('confirmPassword', 'Confirm Password *', <Eye size={20} color="#6b7280" />, {
                  secureTextEntry: !showConfirmPassword,
                  ref: confirmPasswordRef,
                  onSubmitEditing: () => firstNameRef.current?.focus(),
                })}

                {renderInput('firstName', 'First Name *', <UserPlus size={20} color="#6b7280" />, {
                  autoCapitalize: 'words',
                  ref: firstNameRef,
                  onSubmitEditing: () => lastNameRef.current?.focus(),
                })}

                {renderInput('lastName', 'Last Name *', <UserPlus size={20} color="#6b7280" />, {
                  autoCapitalize: 'words',
                  ref: lastNameRef,
                  onSubmitEditing: () => companyNameRef.current?.focus(),
                })}
              </View>

              {/* Company Data */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Company Information</Text>
                
                {renderInput('companyName', 'Company Name', <Building size={20} color="#6b7280" />, {
                  autoCapitalize: 'words',
                  ref: companyNameRef,
                  onSubmitEditing: () => phoneRef.current?.focus(),
                })}

                {renderInput('phone', 'Phone Number', <Phone size={20} color="#6b7280" />, {
                  keyboardType: 'phone-pad',
                  ref: phoneRef,
                  onSubmitEditing: () => vatNumberRef.current?.focus(),
                })}

                {renderInput('vatNumber', 'VAT Number', <CreditCard size={20} color="#6b7280" />, {
                  autoCapitalize: 'characters',
                  ref: vatNumberRef,
                  onSubmitEditing: () => addressLine1Ref.current?.focus(),
                })}
              </View>

              {/* Address Data */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Address</Text>
                
                {renderInput('addressLine1', 'Street & House Number', <MapPin size={20} color="#6b7280" />, {
                  ref: addressLine1Ref,
                  onSubmitEditing: () => addressLine2Ref.current?.focus(),
                })}

                {renderInput('addressLine2', 'Address Line 2', <MapPin size={20} color="#6b7280" />, {
                  ref: addressLine2Ref,
                  onSubmitEditing: () => postalCodeRef.current?.focus(),
                })}

                <View style={styles.row}>
                  <View style={styles.inputHalf}>
                    {renderInput('postalCode', 'Postal Code', <MapPin size={20} color="#6b7280" />, {
                      keyboardType: 'numeric',
                      ref: postalCodeRef,
                      onSubmitEditing: () => cityRef.current?.focus(),
                    })}
                  </View>
                  <View style={styles.inputHalf}>
                    {renderInput('city', 'City', <MapPin size={20} color="#6b7280" />, {
                      autoCapitalize: 'words',
                      ref: cityRef,
                      onSubmitEditing: () => countryRef.current?.focus(),
                    })}
                  </View>
                </View>

                {renderInput('country', 'Country', <MapPin size={20} color="#6b7280" />, {
                  autoCapitalize: 'words',
                  ref: countryRef,
                  returnKeyType: 'done',
                  onSubmitEditing: handleRegistration,
                })}
              </View>

              {/* Privacy Consent - Required */}
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => {
                  setPrivacyConsent(!privacyConsent);
                  // Clear error when user checks the box
                  if (errors.privacyConsent && !privacyConsent) {
                    setErrors(prev => ({ ...prev, privacyConsent: '' }));
                  }
                }}
              >
                <View style={[styles.checkbox, privacyConsent && styles.checkboxChecked]}>
                  {privacyConsent && <Check size={16} color="#ffffff" />}
                </View>
                <Text style={styles.checkboxText}>
                  I accept the{' '}
                  <Text style={styles.privacyLink} onPress={openPrivacyPolicy}>
                    privacy policy
                  </Text>
                  {' *'}
                </Text>
              </TouchableOpacity>
              {errors.privacyConsent && <Text style={styles.errorText}>{errors.privacyConsent}</Text>}

              {/* Marketing Consent - Optional */}
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setMarketingConsent(!marketingConsent)}
              >
                <View style={[styles.checkbox, marketingConsent && styles.checkboxChecked]}>
                  {marketingConsent && <Check size={16} color="#ffffff" />}
                </View>
                <Text style={styles.checkboxText}>
                  I would like to receive product updates and offers via email
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <Button
                onPress={handleRegistration}
                disabled={loading}
                style={styles.registerButton}
                textStyle={styles.registerButtonText}
              >
                <View style={styles.buttonContent}>
                  {loading ? (
                    <>
                      <Text style={styles.registerButtonText}>Registration in progress...</Text>
                    </>
                  ) : (
                    <>
                      <UserPlus size={20} color="#ffffff" style={styles.buttonIcon} />
                      <Text style={styles.registerButtonText}>Register</Text>
                    </>
                  )}
                </View>
              </Button>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={navigateToLogin}>
                  <Text style={styles.loginLink}>Sign in here</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 0,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  inputWrapperFocused: {
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 16,
    fontSize: 16,
    color: '#000000',
  },
  passwordToggle: {
    padding: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  privacyNotice: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
  },
  privacyLink: {
    color: '#000000',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 16,
    marginTop: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
});

export default RegistrationScreen;