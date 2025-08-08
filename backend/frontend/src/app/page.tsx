'use client';

import { useState, useEffect, useRef } from 'react';
import MessageBubble from './components/MessageBubble';

interface Product {
  id: number;
  vysn_name: string;
  short_description: string;
  gross_price: number;
  housing_color: string;
  lumen: number;
  wattage: number;
  cct: number;
  cct_switch_value: string;
  ingress_protection: string;
  product_picture_1: string;
  category_2: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  products?: Product[];
  suggestedFollowUps?: string[];
}

interface LoadingState {
  isLoading: boolean;
  progress: number; // 0-100
  stage: 'classifying' | 'searching' | 'generating' | 'complete';
  message: string;
  estimatedTimeRemaining: number; // in seconds
}

const LOADING_STAGES = {
  classifying: { 
    message: 'Klassifiziere Ihre Anfrage...', 
    duration: 1000,
    progress: 25 
  },
  searching: { 
    message: 'Suche passende Produkte...', 
    duration: 800,
    progress: 65 
  },
  generating: { 
    message: 'Generiere personalisierte Antwort...', 
    duration: 1200,
    progress: 90 
  },
  complete: { 
    message: 'Fertig!', 
    duration: 0,
    progress: 100 
  }
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    stage: 'classifying',
    message: '',
    estimatedTimeRemaining: 0
  });

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  // Simuliert die Loading-Stages
  const simulateLoadingProgress = async () => {
    const stages: (keyof typeof LOADING_STAGES)[] = ['classifying', 'searching', 'generating'];
    
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const stageInfo = LOADING_STAGES[stage];
      
      setLoadingState(prev => ({
        ...prev,
        stage,
        message: stageInfo.message,
        progress: stageInfo.progress,
        estimatedTimeRemaining: Math.max(0, 
          stages.slice(i + 1).reduce((sum, s) => sum + LOADING_STAGES[s].duration, 0) / 1000
        )
      }));
      
      await new Promise(resolve => setTimeout(resolve, stageInfo.duration));
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || loadingState.isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    
    // Start loading animation
    setLoadingState({
      isLoading: true,
      progress: 0,
      stage: 'classifying',
      message: LOADING_STAGES.classifying.message,
      estimatedTimeRemaining: 3
    });

    // Start progress simulation
    const progressSimulation = simulateLoadingProgress();

    try {
      const response = await fetch('http://localhost:3001/api/chat-fast/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          context: messages.slice(-4).filter(m => m.isUser).map(m => m.content), // Letzte 4 User-Nachrichten als Kontext
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Wait for progress simulation to finish
      await progressSimulation;
      
      // Show completion
      setLoadingState(prev => ({
        ...prev,
        stage: 'complete',
        message: LOADING_STAGES.complete.message,
        progress: 100,
        estimatedTimeRemaining: 0
      }));
      
      // Short delay to show completion
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Typing animation
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsTyping(false);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Entschuldigung, ich konnte keine Antwort generieren.',
        isUser: false,
        timestamp: new Date(),
        products: data.products || [],
        suggestedFollowUps: data.suggestedFollowUps || [],
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorContent = 'Entschuldigung, es gab einen Fehler beim Senden der Nachricht.';
      
      // Spezifische Fehlerbehandlung
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorContent = 'Verbindung zum Server fehlgeschlagen. Bitte prüfen Sie, ob das Backend läuft.';
        } else if (error.message.includes('Failed to send message')) {
          errorContent = 'Server-Fehler: Möglicherweise ist das OpenAI API-Quota überschritten oder ein anderer Serverfehler ist aufgetreten.';
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorContent,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoadingState({
        isLoading: false,
        progress: 0,
        stage: 'classifying',
        message: '',
        estimatedTimeRemaining: 0
      });
    }
  };

  // Suggested prompts
  const suggestedPrompts = [
    "Ich suche eine dimmbare Leuchte mit dim to warm",
    "Zeig mir weiße Deckenleuchten mit 3000K",
    "Welche IP44 Außenleuchten gibt es?",
    "LED Strips für indirektes Licht",
  ];

  const handleSuggestedPrompt = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">VYSN Assistant</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-8 h-8 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
              >
                {darkMode ? (
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              
              {/* Status indicator in header */}
              {loadingState.isLoading && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">
                    {loadingState.stage === 'classifying' && 'Analysiere...'}
                    {loadingState.stage === 'searching' && 'Suche...'}
                    {loadingState.stage === 'generating' && 'Schreibe...'}
                    {loadingState.stage === 'complete' && 'Fertig!'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

            {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="text-center space-y-6 py-12">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">VYSN Assistant</h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                  Fragen Sie mich alles über VYSN Beleuchtungsprodukte
                </p>
              </div>
              
              {/* Suggested prompts */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Beispiele:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl mx-auto">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      className="p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="text-gray-700 dark:text-gray-200">
                        {prompt}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
        {messages.map((message) => (
            <MessageBubble
            key={message.id}
              content={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              products={message.products}
              suggestedFollowUps={message.suggestedFollowUps}
              onSuggestedClick={handleSuggestedPrompt}
            />
          ))}

          {/* Loading Indicator */}
          {loadingState.isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="max-w-md mr-12">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                  
                  <div className="glass border border-white/20 px-6 py-4 rounded-2xl rounded-bl-md">
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {loadingState.message}
                        </span>
                        <span className="text-xs text-gray-500 bg-white/20 px-2 py-1 rounded">
                          {Math.round(loadingState.progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${loadingState.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {loadingState.stage === 'classifying' && (
                          <div className="loading-dots text-blue-400">
                            <div></div>
                            <div></div>
                            <div></div>
                          </div>
                        )}
                        {loadingState.stage === 'searching' && (
                          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {loadingState.stage === 'generating' && (
                          <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce-subtle"></div>
                        )}
                        {loadingState.stage === 'complete' && (
                          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                          {loadingState.stage === 'classifying' && 'Analysiere Anfrage...'}
                          {loadingState.stage === 'searching' && 'Durchsuche Katalog...'}
                          {loadingState.stage === 'generating' && 'Formuliere Antwort...'}
                          {loadingState.stage === 'complete' && 'Fertig!'}
                        </span>
                      </div>
                      
                      {loadingState.estimatedTimeRemaining > 0 && (
                        <span className="text-xs text-gray-500 bg-white/10 px-2 py-1 rounded">
                          ~{Math.ceil(loadingState.estimatedTimeRemaining)}s
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Typing Indicator */}
          {isTyping && !loadingState.isLoading && (
            <div className="flex justify-start animate-fade-in-up">
              <div className="max-w-md mr-12">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
            </div>
          </div>

                  <div className="glass border border-white/20 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex items-center space-x-2">
                      <div className="loading-dots text-gray-600 dark:text-gray-300">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">schreibt...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
          </div>
      </main>

            {/* Input Area */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={sendMessage}>
            <div className="flex space-x-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nachricht an VYSN Assistant..."
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-colors"
                  disabled={loadingState.isLoading}
                />
              </div>
              
              <button
                type="submit"
                disabled={loadingState.isLoading || !inputValue.trim()}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loadingState.isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}
