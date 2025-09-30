import { useContext, useEffect, useState } from 'react';
import { socketContext } from '../App';
import { ChatService, type ChatMessage } from '../services/chatService';

export const useChat = (userName?: string) => {
  const socket = useContext(socketContext);
  const [chatService] = useState(() => new ChatService(socket));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to message updates
    const unsubscribe = chatService.onMessagesUpdate((newMessages) => {
      console.log('Chat messages updated:', newMessages);
      setMessages(newMessages);
      setIsLoading(false);
    });

    // Request chat history when component mounts
    console.log('Requesting chat history...');
    chatService.requestChatHistory();

    // Quick fallback to stop loading after 1.5 seconds
    const loadingTimeout = setTimeout(() => {
      console.log('Chat loading timeout - showing chat interface');
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, [chatService]);

  // Reset loading when userName changes
  useEffect(() => {
    if (userName !== undefined) {
      setIsLoading(false);
    }
  }, [userName]);

  const sendMessage = (text: string) => {
    if (userName) {
      chatService.sendMessage(text, userName);
    }
  };

  const clearChatHistory = () => {
    if (userName) {
      chatService.clearChatHistory(userName);
    }
  };

  return {
    messages,
    sendMessage,
    clearChatHistory,
    isLoading
  };
};