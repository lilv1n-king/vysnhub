'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Bot, User, Volume2, Keyboard, X } from 'lucide-react';
import Header from '@/components/header';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isVoice?: boolean;
}

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! 👋 I\'m your VYSN AI Assistant. Feel free to ask me anything about LED lighting, product details, installation or technical questions!',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check speech support
    if (typeof window !== 'undefined') {
      setIsSpeechSupported(
        'webkitSpeechRecognition' in window || 
        'SpeechRecognition' in window ||
        'mediaDevices' in navigator
      );
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startVoiceRecording = async () => {
    if (!isSpeechSupported) {
      alert('Spracherkennung wird von diesem Browser nicht unterstützt');
      return;
    }

    try {
      // Try Web Speech API first
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'de-DE';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsRecording(false);
          
          // Auto-send voice message
          sendMessage(transcript, true);
        };

        recognition.onerror = () => {
          setIsRecording(false);
          alert('Spracherkennungsfehler. Bitte versuche es erneut.');
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      }
    } catch (error) {
      console.error('Error starting voice recording:', error);
      alert('Mikrofon-Zugriff verweigert oder nicht verfügbar');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const sendMessage = async (text?: string, isVoice = false) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Call the existing chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: messageText,
          product: {} // Empty product for general questions
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.answer || 'Entschuldigung, ich konnte deine Frage nicht verarbeiten.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Optional: Speak the AI response
      if (isVoice && speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(aiMessage.content);
        utterance.lang = 'de-DE';
        speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Entschuldigung, es gab einen Fehler. Bitte versuche es erneut.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (content: string) => {
    if (speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.lang = 'de-DE';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col pt-24 md:pt-28">
        {/* Chat Messages - Full Height */}
        <div className="flex-1 px-4 py-2 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-black'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-3 h-3" />
                    ) : (
                      <Bot className="w-3 h-3" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`group ${
                    message.sender === 'user'
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-black'
                  } rounded-xl px-3 py-2`}>
                    
                    <div className="flex items-start gap-2">
                      <p className="text-sm leading-relaxed flex-1">{message.content}</p>
                      
                      {/* Voice Play Button */}
                      {message.sender === 'ai' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakMessage(message.content)}
                          className="p-1 h-5 w-5 text-gray-500 hover:text-black hover:bg-gray-200 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Voice Message Indicator */}
                    {message.isVoice && (
                      <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                        <Mic className="w-2 h-2" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading Animation */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-7 h-7 rounded-full bg-gray-100 text-black flex items-center justify-center">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="bg-gray-100 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">Denke nach...</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Fixed Bottom */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto p-3">
            
            {!showKeyboard ? (
              /* Voice-First Mode */
              <div className="text-center space-y-3">
                {/* Main Voice Button */}
                <div>
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    disabled={!isSpeechSupported || isLoading}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full transition-all duration-200 ${
                      isRecording 
                        ? 'bg-red-500 text-white border-red-500 scale-110 shadow-lg' 
                        : 'border-2 border-black hover:bg-black hover:text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-5 h-5 md:w-6 md:h-6" />
                    ) : (
                      <Mic className="w-5 h-5 md:w-6 md:h-6" />
                    )}
                  </Button>
                </div>
                
                {/* Status */}
                <div>
                  {isRecording ? (
                    <div className="inline-flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-1 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>🎤 Höre zu...</span>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      🎤 Antippen zum Sprechen
                    </p>
                  )}
                </div>

                {/* Switch to Keyboard */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeyboard(true)}
                    className="text-gray-500 text-xs h-8"
                  >
                    <Keyboard className="w-3 h-3 mr-1" />
                    Zur Tastatur
                  </Button>
                </div>

                {!isSpeechSupported && (
                  <div className="text-center text-xs text-red-500 bg-red-50 py-1 px-3 rounded-lg">
                    ⚠️ Spracherkennung nicht unterstützt
                  </div>
                )}
              </div>
            ) : (
              /* Keyboard Mode */
              <div className="space-y-2">
                {/* Close Keyboard Button */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Tastatur-Modus</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowKeyboard(false)}
                    className="text-gray-500 h-6"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Schließen
                  </Button>
                </div>
                
                {/* Text Input */}
                <div className="flex gap-2">
                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Deine Frage eingeben..."
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                    className="h-10 text-sm border-gray-300 focus:border-black focus:ring-1 focus:ring-black"
                  />
                  
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!inputText.trim() || isLoading}
                    size="lg"
                    className="flex-shrink-0 w-10 h-10 bg-black hover:bg-gray-800 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 