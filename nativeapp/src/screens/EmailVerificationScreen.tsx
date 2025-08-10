import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../../lib/contexts/AuthContext';
import { API_BASE_URL } from '../../lib/config/api';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react-native';

type Props = NativeStackScreenProps<AuthStackParamList, 'EmailVerification'>;

const EmailVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { email, password } = route.params;
  const { signIn } = useAuth();
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // Countdown für Resend
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown Timer für Resend-Button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Auto-focus erstes Input beim Mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500); // Kurze Verzögerung für bessere UX
    
    return () => clearTimeout(timer);
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    // Nur Zahlen erlauben
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus zum nächsten Input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify wenn alle 6 Stellen eingegeben
    if (newCode.every(digit => digit !== '') && value) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Backspace handling - focus previous input
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async (codeString?: string) => {
    const verificationCode = codeString || code.join('');
    
    if (verificationCode.length !== 6) {
      Alert.alert('Fehler', 'Bitte geben Sie alle 6 Ziffern ein.');
      return;
    }

    setLoading(true);
    try {
      // Direkt API-Call ohne AuthContext
      const response = await fetch(`${API_BASE_URL}/api/registration/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
          email: email,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Auto-Login nach Verifikation (falls Passwort verfügbar)
        if (password && signIn) {
          try {
            const loginResult = await signIn({ email, password });
            if (!loginResult.error) {
              Alert.alert(
                '🎉 Willkommen!',
                'Ihre E-Mail-Adresse wurde verifiziert und Sie sind jetzt angemeldet!',
                [
                  {
                    text: '🚀 Los geht\'s',
                    onPress: () => {
                      // Navigation wird automatisch durch AuthContext gehandhabt
                    },
                  },
                ]
              );
              return; // Früher exit
            }
          } catch (error) {
            // Auto-Login fehlgeschlagen, fallback to manual login
          }
        }
        
        // Fallback: Zum Login
        Alert.alert(
          '🎉 Erfolgreich!',
          'Ihre E-Mail-Adresse wurde erfolgreich verifiziert. Sie können sich jetzt anmelden.',
          [
            {
              text: '🔐 Zum Login',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      } else {
        Alert.alert('❌ Fehler', result.message || 'Ungültiger Code. Bitte versuchen Sie es erneut.');
        // Code zurücksetzen bei Fehler
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Fehler', 'Netzwerkfehler. Bitte versuchen Sie es erneut.');
      // Code zurücksetzen bei Fehler
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setResending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/registration/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Alert.alert('📧 Code gesendet', 'Ein neuer Verifikationscode wurde an Ihre E-Mail-Adresse gesendet.');
        
        // Reset countdown
        setTimeLeft(60);
        setCanResend(false);
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('❌ Fehler', result.message || 'E-Mail konnte nicht erneut gesendet werden.');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Netzwerkfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo}
              />
            </View>

            <View style={styles.header}>
              <Mail size={48} color="#000000" />
              <Text style={styles.title}>E-Mail bestätigen</Text>
              <Text style={styles.subtitle}>
                🎉 Account erfolgreich erstellt!{'\n\n'}
                📧 Wir haben soeben einen 6-stelligen Code an{'\n'}
                <Text style={styles.email}>{email}</Text>{'\n'}
                gesendet. Bitte prüfen Sie Ihr Postfach (auch Spam-Ordner).
              </Text>
            </View>

            <View style={styles.form}>
              {/* Code Input */}
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={ref => inputRefs.current[index] = ref}
                    style={[
                      styles.codeInput,
                      digit ? styles.codeInputFilled : null,
                    ]}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="numeric"
                    maxLength={1}
                    textAlign="center"

                    editable={!loading}
                    selectTextOnFocus={true}
                  />
                ))}
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={[styles.verifyButton, loading && { opacity: 0.7 }]}
                onPress={() => handleVerifyCode()}
                disabled={!code.every(digit => digit !== '') || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.verifyButtonText}>Code bestätigen</Text>
                )}
              </TouchableOpacity>

              {/* Resend Section */}
              <View style={styles.resendSection}>
                <Text style={styles.resendText}>
                  Keinen Code erhalten?
                </Text>
                
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendCode}
                  disabled={!canResend || resending}
                >
                  {resending ? (
                    <ActivityIndicator size="small" color="#6b7280" />
                  ) : (
                    <Text style={[
                      styles.resendButtonText,
                      canResend ? styles.resendButtonTextActive : styles.resendButtonTextDisabled
                    ]}>
                      {canResend ? 'Code erneut senden' : `Erneut senden in ${timeLeft}s`}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Help Text */}
              <Text style={styles.helpText}>
                Der Code ist 24 Stunden gültig.{'\n'}
                Überprüfen Sie auch Ihren Spam-Ordner.
              </Text>
            </View>

            {/* Back to Login */}
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>
                Anderes Konto verwenden?
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
    color: '#000000',
  },
  form: {
    gap: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: '600',
    backgroundColor: '#ffffff',
  },
  codeInputFilled: {
    borderColor: '#000000',
    backgroundColor: '#f9fafb',
  },
  verifyButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendSection: {
    alignItems: 'center',
    marginTop: 30,
    gap: 12,
  },
  resendText: {
    fontSize: 16,
    color: '#6b7280',
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resendButtonTextActive: {
    color: '#000000',
  },
  resendButtonTextDisabled: {
    color: '#9ca3af',
  },
  helpText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 20,
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
});

export default EmailVerificationScreen;
