import { ChatResponse, StartChatResponse } from "../types/chatbot";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ChatbotAPI {
  static async startChat(customerId: string): Promise<StartChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to start chat');
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting chat:', error);
      throw error;
    }
  }

  static async sendMessage(customerId: string, message: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          response: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async restartChat(customerId: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to restart chat');
      }

      return await response.json();
    } catch (error) {
      console.error('Error restarting chat:', error);
      throw error;
    }
  }
}