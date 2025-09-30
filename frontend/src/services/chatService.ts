import { Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  user: string;
  userId: string;
  text: string;
  timestamp: Date;
  self: boolean;
}

export class ChatService {
  private socket: Socket;
  private messages: ChatMessage[] = [];
  private messageListeners: ((messages: ChatMessage[]) => void)[] = [];

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    // Listen for new chat messages
    this.socket.on('newChatMessage', (messageData: any) => {
      console.log('Received new chat message:', messageData);
      const message: ChatMessage = {
        id: messageData.id,
        user: messageData.user,
        userId: messageData.userId,
        text: messageData.text,
        timestamp: new Date(messageData.timestamp),
        self: messageData.userId === this.socket.id
      };
      
      this.messages.push(message);
      this.notifyListeners();
    });

    // Listen for chat history
    this.socket.on('chatHistory', (historyData: any[]) => {
      console.log('Received chat history:', historyData);
      this.messages = historyData.map((msg: any) => ({
        id: msg.id,
        user: msg.user,
        userId: msg.userId,
        text: msg.text,
        timestamp: new Date(msg.timestamp),
        self: msg.userId === this.socket.id
      }));
      
      this.notifyListeners();
    });

    // Listen for chat cleared event
    this.socket.on('chatCleared', (data: any) => {
      console.log('Chat cleared:', data);
      this.messages = [];
      this.notifyListeners();
    });

    // Handle case where server doesn't respond to getChatHistory
    this.socket.on('connect', () => {
      console.log('Socket connected, chat service ready');
    });
  }

  // Send a chat message
  sendMessage(text: string, userName: string): void {
    if (text.trim()) {
      this.socket.emit('sendChatMessage', {
        text: text.trim(),
        user: userName,
        userId: this.socket.id,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Request chat history
  requestChatHistory(): void {
    console.log('Requesting chat history from server...');
    this.socket.emit('getChatHistory');
    
    // Immediate fallback - if no history, notify with empty array after short delay
    setTimeout(() => {
      if (this.messages.length === 0) {
        console.log('No chat history received, initializing with empty array');
        this.notifyListeners();
      }
    }, 1000);
  }

  // Clear chat history (teachers only)
  clearChatHistory(teacherName: string): void {
    console.log('Requesting chat history clear...');
    this.socket.emit('clearChatHistory', {
      requestedBy: teacherName
    });
  }

  // Subscribe to message updates
  onMessagesUpdate(callback: (messages: ChatMessage[]) => void): () => void {
    this.messageListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.messageListeners.indexOf(callback);
      if (index > -1) {
        this.messageListeners.splice(index, 1);
      }
    };
  }

  // Get current messages
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  // Clear messages (useful when leaving a session)
  clearMessages(): void {
    this.messages = [];
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.messageListeners.forEach(listener => listener([...this.messages]));
  }

  // Cleanup when component unmounts
  cleanup(): void {
    this.socket.off('newChatMessage');
    this.socket.off('chatHistory');
    this.socket.off('chatCleared');
    this.messageListeners = [];
  }
}