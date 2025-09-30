import { useEffect, useState } from "react";
import Question from "../components/question";
import ChatBox from "../components/chat";
import { useNavigate } from "react-router-dom";
import { TimerIcon } from "lucide-react";
import { useContext } from "react";
import { userContext } from "../App";
import { socketContext } from "../App";
import LoadingComponent from "../components/loading";

export default function QuestionPollPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [pollHistory, setPollHistory] = useState([]);
  const [timer, setTimer] = useState(0); // Will be synced with backend
  const [isPollActive, setIsPollActive] = useState(false);
  const [questionId, setQuestionId] = useState(""); // Track current question for vote reset
  const navigate = useNavigate();
  const { userRole } = useContext(userContext);
  const socket = useContext(socketContext);
  const [mockPoll, setMockPoll] = useState(
    {} as {
      question: string;
      options: { label: string; votes: number; isCorrect: boolean }[];
      duration: number;
    }
  );

  // Clear poll after 1 minute of inactivity
  useEffect(() => {
    let inactivityTimer: number;
    
    if (!isPollActive && mockPoll.question) {
      console.log('Poll inactive - starting 1 minute cleanup timer');
      inactivityTimer = window.setTimeout(() => {
        console.log('Clearing poll after 1 minute of inactivity');
        setMockPoll({} as { question: string; options: { label: string; votes: number; isCorrect: boolean }[], duration: number });
        setQuestionId('');
      }, 60000); // 1 minute = 60000ms
    }

    return () => {
      if (inactivityTimer) {
        window.clearTimeout(inactivityTimer);
      }
    };
  }, [isPollActive, mockPoll.question]);

  // Function to fetch poll history from backend
  const fetchPollHistory = async () => {
    try {
      const API_URL = import.meta.env.VITE_REACT_APP_SOCKET_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/polls/history`,{cache: 'no-store'});
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched poll history:', result);
        
        
        // Handle the backend response structure: { success: true, data: [...], message: "..." }
        if (result.success && result.data) {
          const historyData = result.data;
          
          // Transform the data to match expected format
          const transformedHistory = historyData.map((poll: any) => ({
            question: poll.question,
            options: poll.options.map((opt: any) => ({ 
              label: opt.optionText, // Backend uses 'optionText', frontend expects 'label'
              votes: opt.votes 
            })),
            totalVotes: poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0),
            createdAt: poll.createdAt
          }));
          setPollHistory(transformedHistory.splice(0, 5)); // Keep only last 5 polls
          console.log('Poll history fetched:', transformedHistory);
        } else {
          console.error('Backend returned error:', result.message);
        }
      } else {
        console.error('Failed to fetch poll history - HTTP status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching poll history:', error);
    }
  };

  useEffect(() => {
    // Join room based on user role
    socket.emit("joinRoom", { role: userRole });

    socket.on(
      "newQuestion",
      (data: {
        question: string;
        options: { value: string; votes: number; isCorrect: boolean }[];
        duration: number;
      }) => {
        // Transform options format from backend to frontend, preserving isCorrect
        const transformedData = {
          question: data.question,
          options: data.options.map((opt) => ({
            label: opt.value,
            votes: opt.votes,
            isCorrect: opt.isCorrect, // Preserve the correct answer information
          })),
          duration: data.duration,
        };
        setMockPoll(transformedData);
        setQuestionId(data.question); // Set question ID to trigger vote reset
        console.log("new qn received", transformedData);

        setIsPollActive(true);
        setShowHistory(false); // Hide history when a new question arrives
      }
    ); // Listen for global timer updates
    socket.on(
      "timerUpdate",
      (data: { remainingTime: number; isPollActive?: boolean }) => {
        setTimer(data.remainingTime);
        if (data.isPollActive !== undefined) {
          setIsPollActive(data.isPollActive);
        }
        console.log(
          "Timer update received:",
          data.remainingTime,
          "Active:",
          data.isPollActive
        );
      }
    );

    // Listen for poll end
    socket.on("pollEnded", () => {
      setIsPollActive(false);
      console.log("Poll has ended");
    });

    // Listen for vote updates
    socket.on(
      "voteUpdate",
      (updatedPoll: {
        question: string;
        options: { value: string; votes: number; isCorrect: boolean }[];
        duration: number;
      }) => {
        const transformedData = {
          question: updatedPoll.question,
          options: updatedPoll.options.map((opt) => ({
            label: opt.value,
            votes: opt.votes,
            isCorrect: opt.isCorrect, // Preserve the correct answer information
          })),
          duration: updatedPoll.duration,
        };
        setMockPoll(transformedData);
        console.log("vote update received", transformedData);
      }
    );

    return () => {
      socket.off("newQuestion");
      socket.off("timerUpdate");
      socket.off("pollEnded");
      socket.off("voteUpdate");
    };
  }, [socket, userRole]);

  const handleVote = (optionIndex: number) => {
    if (userRole === "student" && isPollActive && timer > 0) {
      socket.emit("submitVote", {
        questionId: mockPoll.question, // Using question as ID for simplicity
        optionIndex: optionIndex,
      });
      console.log("Vote submitted for option:", optionIndex);
    } else if (userRole === "student") {
      console.log("Vote rejected - Poll inactive or timer expired");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-2 py-10">
      <ChatBox role={userRole} />
      {/* Poll Header and History (for teachers) */}

      {/* Poll box */}
      {(mockPoll.question) ?  (
        <div >
          <div className="w-full max-w-xl flex flex-col items-start">
            {userRole === "teacher" && (
                <button
                  className="text-white absolute top-4 right-4 bg-violet-600 px-4 py-2 rounded-full font-medium text-sm hover:bg-violet-400"
                  onClick={() => {
                    if (!showHistory) {
                      fetchPollHistory();
                    }
                    setShowHistory(h => !h);
                  }}
                >
                  {showHistory ? "Hide Poll History" : "View Poll History"}
                </button>
              )}
            <div className="flex items-center w-full justify-between mb-6">
                
              <h2 className="text-2xl font-semibold">Question</h2>
              
              {/* {userRole === "student" && ( */}
                <div
                  className={`text-gray-500 flex items-center font-medium text-sm ${
                    timer <= 15
                      ? "text-red-500"
                      : timer <= 0
                      ? "text-gray-400"
                      : ""
                  }`}
                >
                  <TimerIcon className="text-md" />
                  {timer > 0 ? `Time left: ${timer}s` : "Poll Ended"}
                </div>
              {/* )} */}
            </div>
        {/* History Modal/Section */}
        {showHistory && userRole === "teacher" && (
          <div className="md:w-[30vw]  mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            {pollHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No poll history available yet.
              </div>
            ) : (
              pollHistory.map((poll: any, idx: number) => (
                <div key={idx} className="mb-4  last:mb-0">
                  <Question
                    mockPoll={poll}
                    userRole={userRole}
                    questionId={`history-${idx}`}
                  />
                  <div className="text-xs text-gray-400 mt-2 ml-2">
                    Total votes: {poll.totalVotes} | Created:{" "}
                    {new Date(poll.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
          </div>

          <Question
            mockPoll={mockPoll}
            onVote={isPollActive ? handleVote : undefined}
            userRole={userRole}
            questionId={questionId}
          />
        </div>
      ) : (
        <LoadingComponent />
      )}

      {/* Ask New Question */}
      {userRole === "teacher" && (
        <button
          className="mt-8 rounded-full px-12 py-4 bg-gradient-to-r from-violet-500 to-violet-600 text-white text-lg font-semibold shadow-md hover:to-violet-700 transition"
          onClick={() => navigate("/create-poll")}
        >
          + Ask a new question
        </button>
      )}
    </div>
  );
}
