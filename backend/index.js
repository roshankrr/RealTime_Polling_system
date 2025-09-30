import express from 'express';
import http from 'http';
import connectDB from './db/config/dbconnect.js';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { savePollToHistory } from './db/actions/dbactions.js';
import Poll from './db/models/pollModel.js';
dotenv.config();
import cors from 'cors';    
const app = express();
const server = http.createServer(app);

connectDB();

// Middleware
app.use(express.json());

const allowedOrigins = [
  'https://real-time-polling-system-kappa.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// FOR SOCKET.IO:
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// API endpoint to get poll history
app.get('/api/polls/history', async (req, res) => {
    try {
        const polls = await Poll.find().sort({ createdAt: -1 }).limit(10);
        res.json({
            success: true,
            data: polls,
            message: 'Poll history retrieved successfully'
        });
    } catch (error) {
        console.error('Error fetching poll history:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching poll history',
            error: error.message
        });
    }
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.PORT || 3000));
});

const studentData=[]
let newQuestion=[]
let pollTimer = null;
let remainingTime = 0;
let isPollActive = false;

// Chat messages storage (in-memory for now)
const chatMessages = [];

function startPollTimer(duration) {
    // Clear any existing timer
    if (pollTimer) {
        clearInterval(pollTimer);
    }
    
    remainingTime = duration;
    isPollActive = true;
    console.log(`Starting global poll timer: ${duration} seconds`);
    
    // Broadcast initial time and status
    io.emit('timerUpdate', { remainingTime, isPollActive });
    
    pollTimer = setInterval(() => {
        remainingTime -= 1;
        
        // Broadcast time update to all clients
        io.emit('timerUpdate', { remainingTime, isPollActive });
        
        if (remainingTime <= 0) {
            clearInterval(pollTimer);
            pollTimer = null;
            isPollActive = false;
            console.log('Poll timer finished');
            
            // Save poll to database before broadcasting poll ended
            if (newQuestion && newQuestion.question) {
                savePollToHistory(newQuestion)
                    .then(() => {
                        console.log('Poll successfully saved to history');
                    })
                    .catch((error) => {
                        console.error('Failed to save poll to history:', error);
                    });
            }
            
            io.emit('pollEnded');
            io.emit('timerUpdate', { remainingTime: 0, isPollActive: false });
        }
    }, 1000);
}

function stopPollTimer() {
    if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
        remainingTime = 0;
        isPollActive = false;
    }
}

// Function to save completed poll to database


io.on('connection', (socket) => {
  console.log('A client has connected');
    socket.on('joinRoom', ({ role }) => {
        socket.join(role);
        console.log(`${role} joined the room`);
        
        // Send current question to newly joined clients if one exists
        if (newQuestion && newQuestion.question && remainingTime > 0) {
            socket.emit('newQuestion', newQuestion);
            console.log('Sent current question to newly joined client:', newQuestion);
        }
        
        // Send current timer state and poll status to newly joined clients
        socket.emit('timerUpdate', { remainingTime, isPollActive });
        console.log(`Sent current timer state to newly joined client: ${remainingTime}s, active: ${isPollActive}`);
        
        // If poll has ended, make sure new client knows
        if (remainingTime <= 0 && !isPollActive) {
            socket.emit('pollEnded');
            console.log('Sent poll ended status to newly joined client');
        }
    });

    socket.on('getParticipants',(data)=>{
        console.log('Client requesting participants list:', data);
        socket.emit('participantsList', studentData);
    });

    // Chat functionality
    socket.on('sendChatMessage', (messageData) => {
        const message = {
            id: `msg_${Date.now()}_${socket.id}`,
            user: messageData.user,
            userId: messageData.userId,
            text: messageData.text,
            timestamp: messageData.timestamp || new Date().toISOString()
        };
        
        // Store message
        chatMessages.push(message);
        console.log('New chat message:', message);
        
        // Broadcast to all connected clients
        io.emit('newChatMessage', message);
    });

    socket.on('getChatHistory', () => {
        console.log('Client requesting chat history, sending:', chatMessages.length, 'messages');
        socket.emit('chatHistory', chatMessages);
    });

    // Clear chat history (teachers only)
    socket.on('clearChatHistory', (data) => {
        console.log('Chat history clear requested by:', data.requestedBy);
        
        // Clear the messages array
        chatMessages.length = 0;
        
        // Broadcast to all clients that chat has been cleared
        io.emit('chatCleared', {
            message: 'Chat history has been cleared by the teacher',
            clearedBy: data.requestedBy,
            timestamp: new Date().toISOString()
        });
        
        console.log('Chat history cleared and broadcasted to all clients');
    });

    // Handle kick participant (teacher only)
    socket.on('kickParticipant', (data) => {
        const { participantId, kickedBy } = data;
        console.log(`Kick request: ${participantId} kicked by ${kickedBy}`);
        
        // Find the participant to kick
        const participantIndex = studentData.findIndex(student => student.id === participantId);
        
        if(participantIndex !== -1) {
            const kickedStudent = studentData.splice(participantIndex, 1)[0];
            console.log('Participant kicked:', kickedStudent);
            
            // Notify the kicked participant
            io.to(participantId).emit('kicked', { 
                message: 'You have been removed from the session by the teacher',
                kickedBy: kickedBy
            });
            
            // Broadcast updated participants list to all remaining clients
            io.emit('participantsList', studentData);
            
            // Log for debugging
            console.log('Remaining participants:', studentData);
        } else {
            console.log('Participant not found for kicking:', participantId);
        }
    });



    socket.on('registerStudent',(data)=>{
        // Add socket ID to the student data
        const studentWithId = { ...data, id: socket.id };
        studentData.push(studentWithId);
        console.log('Student registered:', studentWithId);
        console.log('All participants:', studentData);
        
        // Broadcast updated participants list to all clients
        io.emit('participantsList', studentData);
    })

    socket.on('createPoll', (data) => {
        let duration = parseInt(data.duration.split(" ")[0]);
        newQuestion = {question: data.question, options: data.options, duration: duration};
        console.log('Broadcasting new question:', newQuestion);
        
        // Start the global timer
        startPollTimer(duration);
        
        // Broadcast to all connected clients instead of just the emitter
        io.emit('newQuestion', newQuestion);
    });

    socket.on('submitVote', (voteData) => {
        const { questionId, optionIndex } = voteData;
        
        // Only allow votes if poll is active
        if (!isPollActive || remainingTime <= 0) {
            console.log('Vote rejected - poll is not active');
            socket.emit('voteRejected', { reason: 'Poll has ended' });
            return;
        }
        
        // Update vote count for the selected option
        if (newQuestion && newQuestion.question === questionId && newQuestion.options[optionIndex]) {
            newQuestion.options[optionIndex].votes += 1;
            console.log(`Vote recorded for option ${optionIndex}:`, newQuestion.options[optionIndex]);
            
            // Broadcast updated poll data to all clients
            io.emit('voteUpdate', newQuestion);
            console.log('Broadcasted vote update:', newQuestion);
        }
    });

    socket.on('recievevote', (poll) => {
        socket.emit('vote', poll);
    });

  socket.on('disconnect', () => {
    console.log('A client has disconnected', socket.id);
    const index = studentData.findIndex(student => student.id === socket.id);
    if(index !== -1){
        const removedStudent = studentData.splice(index, 1)[0];
        console.log('Removed participant:', removedStudent);
        console.log('Remaining participants:', studentData);
        
        // Broadcast updated participants list to all remaining clients
        io.emit('participantsList', studentData);
    }
  });
});
