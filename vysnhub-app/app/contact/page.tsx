'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  Bot,
  User
} from 'lucide-react';
import Header from '@/components/header';
import PushNotifications from '@/components/push-notifications';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: string, content: string, timestamp: Date}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', company: '', message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSupportChat = async () => {
    if (!chatQuestion.trim()) return;
    
    setIsLoading(true);
    const userQuestion = chatQuestion;
    setChatQuestion('');
    
    // Neue Benutzer-Nachricht hinzufügen
    const newUserMessage = { 
      role: 'user', 
      content: userQuestion, 
      timestamp: new Date() 
    };
    
    setChatHistory(prev => [...prev, newUserMessage]);
    
    try {
      // Die letzten 10 Nachrichten (inklusive der neuen) für Kontext
      const contextMessages = [...chatHistory, newUserMessage].slice(-10);
      
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: userQuestion,
          chatHistory: contextMessages 
        }),
      });
      
      const data = await response.json();
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer || 'Entschuldigung, ich hatte ein technisches Problem. Bitte versuchen Sie es erneut oder rufen Sie unseren Support an.',
        timestamp: new Date()
      }]);
    } catch {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Entschuldigung, ich kann gerade keine Verbindung herstellen. Bitte rufen Sie unseren Support unter +49 (0) 123 456 7890 an.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSupportChat();
    }
  };

  const quickQuestions = [
    "I need IP65 downlights with DALI dimming",
    "What's the difference between 3000K and 4000K?",
    "Do you have emergency lighting options?",
    "I need track lighting for a retail space",
    "What warranty do your LED products have?"
  ];

  const handleQuickQuestion = (question: string) => {
    setChatQuestion(question);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-black mb-4">Contact & Support</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our lighting experts for technical support, 
            product questions, or project consultation.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <Phone className="mx-auto h-8 w-8 text-black mb-4" />
              <h3 className="font-semibold text-black mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">
                Speak directly with our lighting specialists
              </p>
              <a href="tel:+49-123-456-7890" className="text-black font-medium hover:underline">
                +49 (0) 123 456 7890
              </a>
              <div className="mt-4">
                <a href="tel:+49-123-456-7890">
                  <Button className="w-full">Call Now</Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <Mail className="mx-auto h-8 w-8 text-black mb-4" />
              <h3 className="font-semibold text-black mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">
                Send us your questions and we&apos;ll respond within 24 hours
              </p>
              <a href="mailto:support@vysn.com" className="text-black font-medium hover:underline">
                support@vysn.com
              </a>
              <div className="mt-4">
                <a href="mailto:support@vysn.com">
                  <Button variant="outline" className="w-full">Send Email</Button>
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardContent className="p-6 text-center">
              <Clock className="mx-auto h-8 w-8 text-black mb-4" />
              <h3 className="font-semibold text-black mb-2">Business Hours</h3>
              <div className="text-gray-600 space-y-1">
                <p>Monday - Friday: 8:00 - 18:00</p>
                <p>Saturday: 9:00 - 16:00</p>
                <p>Sunday: Closed</p>
              </div>
              <div className="mt-4">
                <div className="text-sm text-green-600 font-medium">Currently Open</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Form
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your.email@company.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Your company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Describe your project or ask your question..."
                  />
                </div>
                
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Bot className="h-5 w-5" />
                VYSN Support Assistant
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Get instant answers to your lighting questions
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-4 h-80 overflow-y-auto border rounded-md p-3 bg-gray-50">
                {chatHistory.length === 0 && (
                  <div className="text-center text-gray-600 text-sm h-full flex flex-col items-center justify-center">
                    <Bot className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                    <p className="font-medium mb-2">Hello! I&apos;m your VYSN lighting assistant.</p>
                    <p className="mb-4">I can help you with:</p>
                    <ul className="text-xs space-y-1 text-left">
                      <li>• Product recommendations</li>
                      <li>• Technical specifications</li>
                      <li>• Installation guidance</li>
                      <li>• Pricing information</li>
                    </ul>
                  </div>
                )}
                
                {chatHistory.map((message, index) => (
                  <div key={index} className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[85%] p-3 rounded-lg text-sm ${
                      message.role === 'user' 
                        ? 'bg-black text-white' 
                        : 'bg-white text-black border shadow-sm'
                    }`}>
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        {message.role === 'user' && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                        <div className="flex-1">
                          {message.content}
                        </div>
                      </div>
                      <div className={`text-xs mt-1 opacity-70 ${
                        message.role === 'user' ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="text-left">
                    <div className="inline-block bg-white text-black border shadow-sm p-3 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {chatHistory.length === 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
                  <div className="space-y-1">
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="w-full text-left text-xs p-2 border rounded-md hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Input
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  onKeyPress={handleChatKeyPress}
                  placeholder="Ask about products, specifications, pricing..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSupportChat} 
                  disabled={isLoading || !chatQuestion.trim()}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send • For complex projects, please use the contact form above
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Push Notifications Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">Benachrichtigungen</h2>
          <div className="max-w-2xl mx-auto">
            <PushNotifications />
          </div>
        </div>

        <div className="mt-12 text-center">
          <Card className="border-gray-200 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <MapPin className="mx-auto h-8 w-8 text-black mb-4" />
              <h3 className="font-semibold text-black mb-2">Visit Our Showroom</h3>
              <div className="text-gray-600 space-y-1">
                <p>VYSN Lighting Solutions</p>
                <p>Musterstraße 123</p>
                <p>12345 Berlin, Germany</p>
              </div>
              <div className="mt-4">
                <Button variant="outline">Get Directions</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}