import { useState, useEffect, useCallback } from 'react';
import { ChatbotAPI } from '../services/api';
import { ConversationNode } from '../types/chatbot';

export interface Message {
  type: 'user' | 'bot';
  content: string;
}

export function useChatbot() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [options, setOptions] = useState<ConversationNode['options']>([]);
    const [customerId, setCustomerId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConversationEnded, setIsConversationEnded] = useState(false);
  
    const generateCustomerId = useCallback(() => {
      return 'customer_' + Math.random().toString(36).substr(2, 9);
    }, []);
    const initializeChat = useCallback(async () => {
        try {
          setIsLoading(true);
          let storedCustomerId = localStorage.getItem('chatbot_customer_id');
          
          if (!storedCustomerId) {
            storedCustomerId = generateCustomerId();            
            localStorage.setItem('chatbot_customer_id', storedCustomerId);
          }
          
          setCustomerId(storedCustomerId);
          
          const response = await ChatbotAPI.startChat(storedCustomerId);
          console.log("response", response, storedCustomerId)
          setMessages([{
            type: 'bot',
            content: response.currentNode.message,
          }]);
          
          if (response.currentNode.type === 'multiple_choice') {
            setOptions(response.currentNode.options);
          }
        } catch (err) {
            console.log("err=>", err)
          setError('Failed to initialize chat');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }, [generateCustomerId]);

      const restartChat = useCallback(async () => {
        try {
          setIsLoading(true);
          setError(null);
          setIsConversationEnded(false);
    
          const response = await ChatbotAPI.restartChat(customerId);
    
          setMessages([{
            type: 'bot',
            content: response.node.message,
          }]);
    
          if (response.node.type === 'multiple_choice') {
            setOptions(response.node.options);
          } else {
            setOptions([]);
          }
        } catch (err) {
          setError('Failed to restart chat');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }, [customerId]);
    
      const sendMessage = useCallback(async (message: string) => {
        if (!message.trim() || !customerId) return;
    
        try {
          setIsLoading(true);
          setError(null);
    
          setMessages(prev => [...prev, {
            type: 'user',
            content: message,
          }]);
    
          if (message.toLowerCase() === 'start over' && isConversationEnded) {
            await restartChat();
            return;
          }
    
          const response = await ChatbotAPI.sendMessage(customerId, message);
    
          if (response.node) {
            setMessages(prev => [...prev, {
              type: 'bot',
              content: response.node.message,
            }]);
    
            setIsConversationEnded(!!response.node.isEndNode);
            setOptions(response.node.type === 'multiple_choice' ? response.node.options : []);
          }
        } catch (err) {
          setError('Failed to send message');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }, [customerId, isConversationEnded, restartChat]);
    
      useEffect(() => {
        initializeChat();
      }, [initializeChat]);
    
      return {
        messages,
        options,
        isLoading,
        error,
        isConversationEnded,
        sendMessage,
      };
}