'use client';

import React from 'react';

interface Product {
  id: number;
  vysn_name: string;
  short_description: string;
  gross_price: number;
}

interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp: string | Date;
  products?: Product[];
  suggestedFollowUps?: string[];
  onSuggestedClick?: (prompt: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  isUser,
  timestamp,
  products = [],
  suggestedFollowUps = [],
  onSuggestedClick
}) => {
  const formatTimestamp = (ts: string | Date) => {
    const date = typeof ts === 'string' ? new Date(ts) : ts;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {/* Message Content */}
        <div className="whitespace-pre-wrap text-sm">
          {content}
        </div>

        {/* Products */}
        {products && products.length > 0 && (
          <div className="mt-3 space-y-2">
            {products.map((product) => (
              <div key={product.id} className="bg-white bg-opacity-20 rounded p-2 text-xs">
                <div className="font-semibold">{product.vysn_name}</div>
                <div className="text-opacity-80">{product.short_description}</div>
                <div className="font-medium">{product.gross_price}€</div>
              </div>
            ))}
          </div>
        )}

        {/* Suggested Follow-ups */}
        {suggestedFollowUps && suggestedFollowUps.length > 0 && (
          <div className="mt-3 space-y-1">
            {suggestedFollowUps.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestedClick?.(suggestion)}
                className="block w-full text-left text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded p-2 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs mt-2 ${
          isUser ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {formatTimestamp(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;