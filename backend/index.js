import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';    
const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: "*"
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running on port ' + (process.env.PORT || 3000));
});

const studentData=[]
let newQuestion=[]
let pollTimer = null;
let remainingTime = 0;
let isPollActive = false;

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
    socket.on('registerStudent',(data)=>{
        studentData.push(data);
        console.log(studentData);
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
    console.log('A client has disconnected',socket.id);
        const index=studentData.findIndex(student=>student.id===socket.id);
        if(index!==-1){
            studentData.splice(index,1);
            console.log(studentData);
        }
  });
});
