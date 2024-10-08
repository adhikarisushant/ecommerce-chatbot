'use client';

import { useRef, useEffect, useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useChatbot } from '../hooks/useChatbot';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function ChatbotWidget() {
  const { messages, options, isLoading, error, sendMessage, isConversationEnded } = useChatbot();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleOptionClick = (optionText: string) => {
    sendMessage(optionText);
  };

  return (
    <Card className="w-full max-w-md h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Store Assistant
          {isLoading && (
            <span className="ml-2 text-sm text-muted-foreground">
              typing...
            </span>
          )}
          {isConversationEnded && (
            <span className="ml-2 text-sm text-muted-foreground">
              (Conversation ended)
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {options && options.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleOptionClick(option.text)}
                disabled={isLoading}
              >
                {option.text}
              </Button>
            ))}
          </div>
        )}
      </CardContent>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}