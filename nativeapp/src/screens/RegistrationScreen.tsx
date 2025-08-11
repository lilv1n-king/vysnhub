import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, User, Mail, Lock, ArrowLeft, Building, Phone, MapPin, CreditCard, Check } from 'lucide-react-native';
import { API_BASE_URL } from '../../lib/config/api';

type RegistrationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Registration'>;

const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<RegistrationScreenNavigationProp>();
  const { t } = useTranslation();
  
  // Form state
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

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
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vorname ist erforderlich';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nachname ist erforderlich';
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }

    if (!privacyConsent) {
      newErrors.privacyConsent = 'Sie müssen die Datenschutzerklärung akzeptieren';
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
    // Clear general messages when user interacts
    if (successMessage) setSuccessMessage(null);
    if (generalError) setGeneralError(null);
  };

  // Handle registration
  const handleRegistration = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError(null);
    setSuccessMessage(null);
    
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
          setSuccessMessage(`Registrierung erfolgreich! Wir haben eine E-Mail mit einem Verifikationscode an ${formData.email} gesendet.`);
          
          // Automatische Weiterleitung zur Verifikation nach 2 Sekunden
          setTimeout(() => {
            navigation.navigate('EmailVerification', {
              email: formData.email,
              password: formData.password,
            });
          }, 2000);
        } else {
          setGeneralError(data.error || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
        }
      } else {
        const errorData = await response.json();
        setGeneralError(errorData.error || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setGeneralError('Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Privacy Policy öffnen
  const openPrivacyPolicy = () => {
    Linking.openURL('https://app.vysnlighting.com/datenschutz');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo}
              />
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Registrierung</Text>
              <Text style={styles.subtitle}>
                Erstellen Sie Ihr VYSN Hub Konto für professionelle Beleuchtungslösungen
              </Text>
            </View>

            {/* Success Message */}
            {successMessage && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{successMessage}</Text>
              </View>
            )}

            {/* Error Message */}
            {generalError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessageText}>{generalError}</Text>
              </View>
            )}

            <View style={styles.form}>
              {/* Personal Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Persönliche Daten</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>E-Mail-Adresse *</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      focusedField === 'email' && styles.textInputFocused,
                      errors.email && styles.textInputError
                    ]}
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    placeholder="ihre.email@example.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Passwort *</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      ref={passwordRef}
                      style={[
                        styles.textInput,
                        { paddingRight: 56 },
                        focusedField === 'password' && styles.textInputFocused,
                        errors.password && styles.textInputError
                      ]}
                      value={formData.password}
                      onChangeText={(text) => handleInputChange('password', text)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                      placeholder="Mindestens 6 Zeichen"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color="#6b7280" />
                      ) : (
                        <Eye size={20} color="#6b7280" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Passwort bestätigen *</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      ref={confirmPasswordRef}
                      style={[
                        styles.textInput,
                        { paddingRight: 56 },
                        focusedField === 'confirmPassword' && styles.textInputFocused,
                        errors.confirmPassword && styles.textInputError
                      ]}
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleInputChange('confirmPassword', text)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => firstNameRef.current?.focus()}
                      placeholder="Passwort wiederholen"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry={!showConfirmPassword}
                      autoComplete="new-password"
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="next"
                      blurOnSubmit={false}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} color="#6b7280" />
                      ) : (
                        <Eye size={20} color="#6b7280" />
                      )}
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Vorname *</Text>
                  <TextInput
                    ref={firstNameRef}
                    style={[
                      styles.textInput,
                      focusedField === 'firstName' && styles.textInputFocused,
                      errors.firstName && styles.textInputError
                    ]}
                    value={formData.firstName}
                    onChangeText={(text) => handleInputChange('firstName', text)}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    placeholder="Ihr Vorname"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                    autoComplete="given-name"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                  {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nachname *</Text>
                  <TextInput
                    ref={lastNameRef}
                    style={[
                      styles.textInput,
                      focusedField === 'lastName' && styles.textInputFocused,
                      errors.lastName && styles.textInputError
                    ]}
                    value={formData.lastName}
                    onChangeText={(text) => handleInputChange('lastName', text)}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => companyNameRef.current?.focus()}
                    placeholder="Ihr Nachname"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                    autoComplete="family-name"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                  {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
                </View>
              </View>

              {/* Company Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Firma (optional)</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Firmenname</Text>
                  <TextInput
                    ref={companyNameRef}
                    style={[
                      styles.textInput,
                      focusedField === 'companyName' && styles.textInputFocused
                    ]}
                    value={formData.companyName}
                    onChangeText={(text) => handleInputChange('companyName', text)}
                    onFocus={() => setFocusedField('companyName')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => phoneRef.current?.focus()}
                    placeholder="Ihre Firma"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Telefon</Text>
                  <TextInput
                    ref={phoneRef}
                    style={[
                      styles.textInput,
                      focusedField === 'phone' && styles.textInputFocused
                    ]}
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => vatNumberRef.current?.focus()}
                    placeholder="+49 123 456 789"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>USt-IdNr.</Text>
                  <TextInput
                    ref={vatNumberRef}
                    style={[
                      styles.textInput,
                      focusedField === 'vatNumber' && styles.textInputFocused
                    ]}
                    value={formData.vatNumber}
                    onChangeText={(text) => handleInputChange('vatNumber', text)}
                    onFocus={() => setFocusedField('vatNumber')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => addressLine1Ref.current?.focus()}
                    placeholder="DE123456789"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>
              </View>

              {/* Address */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Adresse (optional)</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Straße & Hausnummer</Text>
                  <TextInput
                    ref={addressLine1Ref}
                    style={[
                      styles.textInput,
                      focusedField === 'addressLine1' && styles.textInputFocused
                    ]}
                    value={formData.addressLine1}
                    onChangeText={(text) => handleInputChange('addressLine1', text)}
                    onFocus={() => setFocusedField('addressLine1')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => addressLine2Ref.current?.focus()}
                    placeholder="Musterstraße 123"
                    placeholderTextColor="#9ca3af"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Adresszusatz</Text>
                  <TextInput
                    ref={addressLine2Ref}
                    style={[
                      styles.textInput,
                      focusedField === 'addressLine2' && styles.textInputFocused
                    ]}
                    value={formData.addressLine2}
                    onChangeText={(text) => handleInputChange('addressLine2', text)}
                    onFocus={() => setFocusedField('addressLine2')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={() => postalCodeRef.current?.focus()}
                    placeholder="Etage, Appartment etc."
                    placeholderTextColor="#9ca3af"
                    autoCorrect={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.inputHalf}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>PLZ</Text>
                      <TextInput
                        ref={postalCodeRef}
                        style={[
                          styles.textInput,
                          focusedField === 'postalCode' && styles.textInputFocused
                        ]}
                        value={formData.postalCode}
                        onChangeText={(text) => handleInputChange('postalCode', text)}
                        onFocus={() => setFocusedField('postalCode')}
                        onBlur={() => setFocusedField(null)}
                        onSubmitEditing={() => cityRef.current?.focus()}
                        placeholder="12345"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                        autoCorrect={false}
                        returnKeyType="next"
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>
                  <View style={styles.inputHalf}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Stadt</Text>
                      <TextInput
                        ref={cityRef}
                        style={[
                          styles.textInput,
                          focusedField === 'city' && styles.textInputFocused
                        ]}
                        value={formData.city}
                        onChangeText={(text) => handleInputChange('city', text)}
                        onFocus={() => setFocusedField('city')}
                        onBlur={() => setFocusedField(null)}
                        onSubmitEditing={() => countryRef.current?.focus()}
                        placeholder="Musterstadt"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="words"
                        autoCorrect={false}
                        returnKeyType="next"
                        blurOnSubmit={false}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Land</Text>
                  <TextInput
                    ref={countryRef}
                    style={[
                      styles.textInput,
                      focusedField === 'country' && styles.textInputFocused
                    ]}
                    value={formData.country}
                    onChangeText={(text) => handleInputChange('country', text)}
                    onFocus={() => setFocusedField('country')}
                    onBlur={() => setFocusedField(null)}
                    onSubmitEditing={handleRegistration}
                    placeholder="Deutschland"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>
              </View>

              {/* Privacy Consent */}
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => {
                  setPrivacyConsent(!privacyConsent);
                  if (errors.privacyConsent && !privacyConsent) {
                    setErrors(prev => ({ ...prev, privacyConsent: '' }));
                  }
                }}
              >
                <View style={[styles.checkbox, privacyConsent && styles.checkboxChecked]}>
                  {privacyConsent && <Check size={16} color="#ffffff" />}
                </View>
                <Text style={styles.checkboxText}>
                  Ich akzeptiere die{' '}
                  <Text style={styles.privacyLink} onPress={openPrivacyPolicy}>
                    Datenschutzerklärung
                  </Text>
                  {' *'}
                </Text>
              </TouchableOpacity>
              {errors.privacyConsent && <Text style={styles.errorText}>{errors.privacyConsent}</Text>}

              {/* Marketing Consent */}
              <TouchableOpacity 
                style={styles.checkboxContainer}
                onPress={() => setMarketingConsent(!marketingConsent)}
              >
                <View style={[styles.checkbox, marketingConsent && styles.checkboxChecked]}>
                  {marketingConsent && <Check size={16} color="#ffffff" />}
                </View>
                <Text style={styles.checkboxText}>
                  Ich möchte Updates und Angebote per E-Mail erhalten
                </Text>
              </TouchableOpacity>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.registerButton, loading && { opacity: 0.7 }]}
                onPress={handleRegistration}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.registerButtonText}>Registrieren</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to Login */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>
                Bereits ein Konto?
              </Text>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => navigation.navigate('Login')}
              >
                <ArrowLeft size={20} color="#374151" />
                <Text style={styles.loginButtonText}>Zurück zum Login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  header: {
    marginBottom: 32,
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
    lineHeight: 24,
  },
  form: {
    gap: 24,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#000000',
  },
  textInputFocused: {
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
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
  privacyLink: {
    color: '#000000',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginSection: {
    marginTop: 40,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  successContainer: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  successText: {
    color: '#15803d',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  errorMessageText: {
    color: '#dc2626',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default RegistrationScreen;