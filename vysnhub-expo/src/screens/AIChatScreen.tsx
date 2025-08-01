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
import { Bot, Send, User, Mic, MicOff, Keyboard, X } from 'lucide-react-native';
import Button from '../components/ui/Button';
import Header from '../components/Header';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

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
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    minHeight: 32,
  },
  messageBubbleUser: {
    backgroundColor: '#000000',
  },
  messageBubbleBot: {
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'left',
  },
  messageTextUser: {
    color: '#ffffff',
  },
  messageTextBot: {
    color: '#000000',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 16,
  },
  voiceModeContainer: {
    alignItems: 'center',
  },
  voiceButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#000000',
  },
  voiceButtonRecording: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  voiceStatus: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  voiceStatusRecording: {
    color: '#ef4444',
  },
  keyboardToggle: {
    fontSize: 12,
    color: '#6b7280',
  },
  keyboardModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keyboardModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#d1d5db',
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
});

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
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
  
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSettingsPress = () => {
    console.log('Settings button pressed - Auth coming soon!');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const startVoiceRecording = () => {
    Alert.alert('Voice Feature', 'Voice recording feature coming soon!');
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Thank you for your question! This is a demo response. In the full version, I would help you with LED lighting questions and product recommendations.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Header onSettingsPress={handleSettingsPress} />
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
            /* Voice-First Mode */
            <View style={styles.voiceModeContainer}>
              <TouchableOpacity
                style={[styles.voiceButton, isRecording ? styles.voiceButtonRecording : {}]}
                onPress={startVoiceRecording}
              >
                {isRecording ? (
                  <MicOff size={24} color="#ffffff" />
                ) : (
                  <Mic size={24} color="#000000" />
                )}
              </TouchableOpacity>
              
              <Text style={[styles.voiceStatus, isRecording ? styles.voiceStatusRecording : {}]}>
                {isRecording ? '🎤 Listening...' : '🎤 Tap to speak'}
              </Text>
              
              <TouchableOpacity onPress={() => setShowKeyboard(true)}>
                <Text style={styles.keyboardToggle}>Switch to keyboard</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Keyboard Mode */
            <View>
              <View style={styles.keyboardModeHeader}>
                <Text style={styles.keyboardToggle}>Keyboard mode</Text>
                <TouchableOpacity onPress={() => setShowKeyboard(false)}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <X size={16} color="#6b7280" />
                    <Text style={[styles.keyboardToggle, { marginLeft: 4 }]}>Close</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              <View style={styles.keyboardModeContainer}>
                                  <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type your question..."
                    multiline
                    onSubmitEditing={() => sendMessage()}
                  />
                
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!inputText.trim() || isLoading) ? styles.sendButtonDisabled : {}
                  ]}
                  onPress={() => sendMessage()}
                  disabled={!inputText.trim() || isLoading}
                >
                  <Send size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}