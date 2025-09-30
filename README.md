# 🎯 Real-Time Polling System

A modern, interactive polling system built for educational environments, enabling teachers to conduct live polls and quizzes with real-time student participation and feedback.

## ✨ Features

### 📊 **Real-Time Polling**
- **Live Question Broadcasting**: Teachers can create and broadcast questions instantly
- **Real-Time Voting**: Students see results update live as votes come in
- **Visual Progress Bars**: Dynamic vote visualization with percentages
- **Timer System**: Configurable time limits for each poll (30s, 60s, 120s)

### ✅ **Smart Answer Validation**
- **Correct/Incorrect Feedback**: Green for correct answers, red for incorrect
- **Immediate Results**: Students know instantly if they got it right
- **Visual Indicators**: Color-coded circles and progress bars

### 💬 **Integrated Chat System**
- **Real-Time Messaging**: Live chat between all participants
- **Auto-Scroll**: Automatic scroll to latest messages
- **Name Authentication**: Users set display names before chatting
- **Chat Moderation**: Teachers can clear chat history

### 👥 **Participant Management**
- **Live Participant List**: See all connected users in real-time
- **Kick Functionality**: Teachers can remove disruptive participants
- **Role-Based Access**: Different interfaces for teachers and students
- **Auto-Cleanup**: Participants removed when they disconnect

### 📈 **Poll History & Analytics**
- **Persistent Storage**: All completed polls saved to MongoDB
- **History View**: Browse previous polls and results
- **Vote Analytics**: Detailed breakdown of responses
- **Export Ready**: Poll data stored in structured format

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time communication
- **React Router** for navigation
- **Vite** for fast development

### **Backend**
- **Node.js** with Express
- **Socket.IO** for WebSocket connections
- **MongoDB** with Mongoose for data persistence
- **CORS** enabled for cross-origin requests

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/roshankrr/RealTime_Polling_system.git
cd RealTime_Polling_system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=3000
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory (optional):
```env
VITE_API_URL=http://localhost:3000
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API Endpoints**: http://localhost:3000/api/*

## 📋 Usage Guide

### For Teachers

#### 1. **Creating a Poll**
1. Navigate to the Poll Creator page
2. Enter your question
3. Add 2-4 answer options
4. Mark the correct answer(s)
5. Set time duration (30s, 60s, or 120s)
6. Click "Start Poll" to broadcast

#### 2. **Managing Participants**
1. Open the chat panel
2. Switch to "Participants" tab
3. View all connected students
4. Use "Kick out" to remove disruptive users

#### 3. **Chat Moderation**
1. Open chat panel
2. Monitor student messages
3. Use "Clear Chat" button to reset chat history
4. Maintain classroom environment

#### 4. **Viewing Results**
1. Watch real-time vote updates during polls
2. Click "Show History" to view past polls
3. Analyze response patterns and engagement

### For Students

#### 1. **Joining a Session**
1. Enter your name on the registration page
2. Click "Get Started" to join
3. Wait for teacher to start a poll

#### 2. **Participating in Polls**
1. Read the question carefully
2. Click your chosen answer
3. See immediate feedback (correct/incorrect)
4. Watch live results from all participants

#### 3. **Using Chat**
1. Open chat panel (bottom-right button)
2. Set your display name
3. Send messages to communicate with class
4. Messages auto-scroll to latest

## 🏗️ Architecture Overview

### **Real-Time Communication Flow**
```
Teacher Creates Poll → Backend Processes → Broadcast to All Students
Student Votes → Backend Updates → Real-time Results to Everyone
Chat Messages → Instant Broadcast → All Participants See Updates
```

### **Data Flow**
1. **Frontend** sends user actions via Socket.IO
2. **Backend** processes and validates requests
3. **MongoDB** stores persistent data (polls, history)
4. **Socket.IO** broadcasts updates to all connected clients
5. **Frontend** updates UI in real-time

### **Security Features**
- **Role-based permissions** (teacher vs student capabilities)
- **Input validation** on both frontend and backend
- **CORS protection** for API endpoints
- **Socket connection management** with automatic cleanup

## 📁 Project Structure

```
├── backend/
│   ├── index.js                 # Main server file
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Environment variables
│   └── db/
│       ├── config/
│       │   └── dbconnect.js    # MongoDB connection
│       ├── models/
│       │   └── pollModel.js    # Poll data schema
│       └── actions/
│           └── dbactions.js    # Database operations
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── chat.tsx       # Chat system
│   │   │   ├── question.tsx   # Poll question display
│   │   │   └── loading.tsx    # Loading states
│   │   ├── routes/            # Page components
│   │   │   ├── Poll-creator.tsx        # Teacher poll creation
│   │   │   ├── QuestionPoll.tsx        # Main polling interface
│   │   │   ├── Student-register.tsx    # Student registration
│   │   │   └── Kicked.tsx              # Kicked user page
│   │   ├── services/          # Business logic
│   │   │   └── chatService.ts # Chat functionality
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── useChat.ts     # Chat state management
│   │   └── socket/
│   │       └── socket.ts      # Socket.IO configuration
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
└── README.md                  # This file
```

## 🔌 API Endpoints

### **Socket.IO Events**

#### **Connection Management**
- `joinRoom` - Join teacher/student room
- `registerStudent` - Register student participant
- `disconnect` - Handle user disconnection

#### **Polling System**
- `createPoll` - Teacher creates new poll
- `newQuestion` - Broadcast new question to all
- `submitVote` - Student submits vote
- `voteUpdate` - Real-time vote count updates
- `timerUpdate` - Poll timer synchronization
- `pollEnded` - Poll completion notification

#### **Chat System**
- `sendChatMessage` - Send chat message
- `newChatMessage` - Broadcast message to all
- `getChatHistory` - Request chat history
- `chatHistory` - Send chat history to client
- `clearChatHistory` - Clear all chat messages
- `chatCleared` - Notify all of chat clear

#### **Participant Management**
- `getParticipants` - Request participant list
- `participantsList` - Broadcast updated participants
- `kickParticipant` - Remove participant (teacher only)
- `kicked` - Notify kicked participant

### **HTTP Endpoints**
- `GET /api/polls/history` - Retrieve poll history from database

## 🎨 UI/UX Features

### **Responsive Design**
- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-optimized controls

### **Visual Feedback**
- **Loading states** for all async operations
- **Success/error indicators** for user actions
- **Real-time progress bars** for poll results
- **Color-coded feedback** (green=correct, red=incorrect)

### **User Experience**
- **Intuitive navigation** between different sections
- **Auto-scroll chat** for seamless conversation
- **Confirmation dialogs** for destructive actions
- **Keyboard shortcuts** (Enter to send messages)

## 🔧 Configuration

### **Environment Variables**

#### Backend (.env)
```env
PORT=3000                                    # Server port
CLIENT_URL=http://localhost:5173            # Frontend URL for CORS
MONGODB_URI=mongodb://localhost:27017/polling # Database connection
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000          # Backend API URL
```

### **MongoDB Setup**
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named "polling"
3. Update MONGODB_URI in backend .env file
4. Collections will be created automatically

## 🚨 Troubleshooting

### **Common Issues**

#### **Connection Problems**
```bash
# Check if MongoDB is running
mongosh
# or
mongodb-compass

# Verify backend server is running
curl http://localhost:3000/api/polls/history
```

#### **Socket.IO Issues**
- Ensure both frontend and backend are running
- Check browser console for connection errors
- Verify CORS settings in backend

#### **Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache (frontend)
npm run dev -- --force
```

### **Performance Tips**
- Use MongoDB indexing for better query performance
- Implement pagination for large poll histories
- Consider Redis for session management in production
- Use environment-specific configurations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use meaningful commit messages
- Add JSDoc comments for complex functions
- Test new features thoroughly
- Maintain consistent code formatting


## 👨‍💻 Author

**Roshan Kumar**
- GitHub: [@roshankrr](https://github.com/roshankrr)
- Repository: [RealTime_Polling_system](https://github.com/roshankrr/RealTime_Polling_system)

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- MongoDB for data persistence
- React and TypeScript communities
- Tailwind CSS for styling framework

---

⭐ **Star this repository if you found it helpful!** ⭐