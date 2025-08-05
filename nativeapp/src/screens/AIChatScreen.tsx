import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Bot, Send, User, Mic, MicOff, Keyboard, X, WifiOff, Headphones } from 'lucide-react-native';
import Button from '../components/ui/Button';
import Header from '../components/Header';
import { chatService, ChatMessage } from '../../lib/services/chatService';
import { useAuth } from '../../lib/contexts/AuthContext';

// Using ChatMessage from chatService instead of local interface

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
    minHeight: 40,
  },
  messageContainerUser: {
    alignSelf: 'flex-end',
  },
  messageContainerBot: {
    alignSelf: 'flex-start',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  messageContentUser: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarUser: {
    backgroundColor: '#000000',
  },
  avatarBot: {
    backgroundColor: '#f3f4f6',
  },
  messageBubble: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
    maxWidth: '100%',
  },
  messageBubbleUser: {
    backgroundColor: '#000000',
  },
  messageBubbleBot: {
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'left',
    color: '#000000', // Default black color
    flexWrap: 'wrap',
  },
  messageTextUser: {
    color: '#ffffff',
    fontWeight: '400',
  },
  messageTextBot: {
    color: '#000000',
    fontWeight: '400',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  voiceModeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  voiceButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  voiceButtonRecording: {
    backgroundColor: '#ef4444',
    transform: [{ scale: 1.1 }],
  },
  voiceStatus: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    fontWeight: '500',
  },
  voiceStatusRecording: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  keyboardToggle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f8f9fa',
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 48,
    maxHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  switchModeButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginBottom: 12,
  },
  supportButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 100,
    minHeight: 40,
    textAlignVertical: 'center',
    color: '#000000',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  loadingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6b7280',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  offlineText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default function AIChatScreen() {
  const auth = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hey! 👋 I\'m your VYSN Lighting Assistant. Feel free to ask me anything about LED lighting, product details, installation or technical questions!',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);



  // Initialize chat session and check backend connectivity
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Ensure we have auth token set for API service
        if (auth?.accessToken) {
          // This should already be set by AuthContext, but ensure it's there
          // apiService.setAuthToken(auth.accessToken); // Already handled in AuthContext
        }

        // Check if backend is available
        const backendAvailable = await chatService.checkBackendHealth();
        setIsOnline(backendAvailable);

        if (backendAvailable) {
          // Try to create or restore session
          try {
            const newSessionId = await chatService.createSession();
            setSessionId(newSessionId);
            setError(null);
            console.log('Chat session created:', newSessionId);
          } catch (sessionError) {
            console.warn('Failed to create session, using offline mode:', sessionError);
            setError('Could not connect to chat service. Some features may be limited.');
          }
        } else {
          setError('Backend service is currently unavailable. Working in offline mode.');
        }
      } catch (initError) {
        console.error('Failed to initialize chat:', initError);
        setIsOnline(false);
        setError('Failed to initialize chat service.');
      }
    };

    if (auth?.isAuthenticated) {
      initializeChat();
    }
  }, [auth?.isAuthenticated, auth?.accessToken]);

  // Add retry connection function
  const retryConnection = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const backendAvailable = await chatService.checkBackendHealth();
      setIsOnline(backendAvailable);
      
      if (backendAvailable && !sessionId) {
        const newSessionId = await chatService.createSession();
        setSessionId(newSessionId);
        console.log('Reconnected with session:', newSessionId);
      }
    } catch (error) {
      console.error('Retry connection failed:', error);
      setError('Still unable to connect to chat service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Request permissions for audio recording
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow microphone access to use voice features.');
      }
    };
    requestPermissions();
  }, []);

  const startVoiceRecording = async () => {
    try {
      if (isRecording) {
        await stopVoiceRecording();
        return;
      }

      setIsRecording(true);
      setError(null);

      // Configure audio recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      Alert.alert('Recording Error', 'Could not start voice recording. Please try again.');
    }
  };

  const stopVoiceRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      setIsProcessingVoice(true);
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        // For now, just show a placeholder message since we'd need a speech-to-text service
        // In a real implementation, you'd send the audio to a speech-to-text API
        Alert.alert(
          'Voice Processing', 
          'Voice message recorded! In a real implementation, this would be converted to text and sent to the chat.',
          [
            {
              text: 'Send Test Message',
              onPress: () => sendMessage('This is a test voice message converted to text.')
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Could not process voice recording.');
    } finally {
      setIsProcessingVoice(false);
    }
  };


  // Support contact function
  const contactSupport = () => {
    Alert.alert(
      'Support kontaktieren',
      'Wie möchten Sie uns kontaktieren?',
      [
        {
          text: 'E-Mail',
          onPress: () => {
            // In einer echten App würde hier ein E-Mail-Client geöffnet
            Alert.alert('E-Mail Support', 'support@vysn.de\n\nBitte beschreiben Sie Ihr Problem detailliert.');
          }
        },
        {
          text: 'Telefon',
          onPress: () => {
            // In einer echten App würde hier die Telefon-App geöffnet
            Alert.alert('Telefon Support', '+49 123 456 789\n\nMontag bis Freitag, 9:00 - 17:00 Uhr');
          }
        },
        {
          text: 'Abbrechen',
          style: 'cancel'
        }
      ]
    );
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    // Clear any previous errors
    setError(null);
    setInputText('');
    setIsLoading(true);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      if (isOnline && sessionId) {
        // Send to backend
        const { response, messages: newMessages } = await chatService.sendMessage(messageText, sessionId);
        
        // Add only the AI response (user message was already added)
        const aiMessage = newMessages.find(msg => msg.sender === 'ai');
        if (aiMessage) {
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        // Fallback offline response
        throw new Error('Backend not available');
      }
    } catch (chatError) {
      console.error('Chat error:', chatError);
      
      // Add fallback AI response
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m currently having trouble connecting to the backend service. This might be a temporary issue. Please check your internet connection and try again. In the meantime, I can still help with basic questions about VYSN lighting products.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError('Connection to chat service failed. Please try again.');
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
              <Header onSettingsPress={() => navigation.navigate('Settings' as any)} />
      
      {/* Offline Indicator */}
      {!isOnline && (
        <View style={styles.offlineIndicator}>
          <WifiOff size={16} color="#d97706" />
          <Text style={styles.offlineText}>
            Offline Mode - Limited functionality
          </Text>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorMessage}>
          <Text style={styles.errorText}>{error}</Text>
          {!isOnline && (
            <TouchableOpacity 
              onPress={retryConnection} 
              disabled={isLoading}
              style={{ marginTop: 8, alignSelf: 'center' }}
            >
              <Text style={{ color: '#dc2626', fontWeight: '600', fontSize: 12 }}>
                {isLoading ? 'Retrying...' : 'Retry Connection'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Debug: Show message count */}
          <Text style={{ fontSize: 12, color: '#999', textAlign: 'center', marginBottom: 10 }}>
            Messages: {messages.length}
          </Text>
          
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.sender === 'user' ? styles.messageContainerUser : styles.messageContainerBot
              ]}
            >
              <View style={[
                styles.messageContent,
                message.sender === 'user' ? styles.messageContentUser : {}
              ]}>
                <View style={[
                  styles.avatar,
                  message.sender === 'user' ? styles.avatarUser : styles.avatarBot
                ]}>
                  {message.sender === 'user' ? (
                    <User size={16} color={message.sender === 'user' ? '#ffffff' : '#000000'} />
                  ) : (
                    <Bot size={16} color="#000000" />
                  )}
                </View>

                <View style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot
                ]}>
                  <Text style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.messageTextUser : styles.messageTextBot
                  ]}>
                    {message.content}
                  </Text>
                  
                  {/* Add support button for error messages */}
                  {message.sender === 'ai' && message.supportContact && (
                    <TouchableOpacity 
                      style={styles.supportButton}
                      onPress={contactSupport}
                    >
                      <Headphones size={16} color="#ffffff" />
                      <Text style={styles.supportButtonText}>Support kontaktieren</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
          
          {/* Loading Animation */}
          {isLoading && (
            <View style={[styles.messageContainer, styles.messageContainerBot]}>
              <View style={styles.messageContent}>
                <View style={[styles.avatar, styles.avatarBot]}>
                  <Bot size={16} color="#000000" />
                </View>
                <View style={[styles.messageBubble, styles.messageBubbleBot]}>
                  <View style={styles.loadingDots}>
                    <Text style={[styles.messageText, styles.messageTextBot]}>Thinking</Text>
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {!showKeyboard ? (
            /* Voice Mode */
            <View style={styles.voiceModeContainer}>
              <TouchableOpacity
                style={[styles.voiceButton, isRecording ? styles.voiceButtonRecording : {}]}
                onPress={startVoiceRecording}
              >
                {isRecording ? (
                  <MicOff size={28} color="#ffffff" />
                ) : (
                  <Mic size={28} color="#ffffff" />
                )}
              </TouchableOpacity>
              
              <Text style={[styles.voiceStatus, isRecording ? styles.voiceStatusRecording : {}]}>
                {isProcessingVoice ? 'Processing...' : isRecording ? 'Tap to stop recording' : 'Tap to speak'}
              </Text>
              
              <TouchableOpacity 
                style={styles.switchModeButton}
                onPress={() => setShowKeyboard(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Keyboard size={16} color="#6b7280" />
                  <Text style={[styles.keyboardToggle, { marginLeft: 8 }]}>Use keyboard</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            /* Keyboard Mode */
            <View>
              <TouchableOpacity 
                style={styles.switchModeButton}
                onPress={() => setShowKeyboard(false)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Mic size={16} color="#6b7280" />
                  <Text style={[styles.keyboardToggle, { marginLeft: 8 }]}>Use voice</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Message VYSN Assistant..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  textAlignVertical="center"
                />
                
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!inputText.trim() || isLoading) ? styles.sendButtonDisabled : {}
                  ]}
                  onPress={() => sendMessage()}
                  disabled={!inputText.trim() || isLoading}
                >
                  <Send size={18} color={(!inputText.trim() || isLoading) ? "#9ca3af" : "#ffffff"} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}