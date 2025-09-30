import { useEffect, useState } from "react";
import Question from "../components/question";
import ChatBox from "../components/chat";
import { useNavigate } from "react-router-dom";
import { TimerIcon } from "lucide-react";
import { useContext } from "react";
import { userContext } from "../App";
import { socketContext } from "../App";
import LoadingComponent from "../components/loading";
// Example poll data
// const mockPoll = {
//   question: 'Which',
//   options: [
//     { label: 'Mars', votes: 75 },
//     { label: 'Venus', votes: 5 },
//     { label: 'Jupiter', votes: 5 },
//     { label: 'Saturn', votes: 15 },
//   ],
// };
const pollHistory = [
  [
    {
      question: "What is the capital of France?",
      options: [
        { label: "Paris", votes: 80 },
        { label: "London", votes: 10 },
        { label: "Berlin", votes: 10 },
      ],
    },
  ],
  [
    {
      question: "What is 2 + 2?",
      options: [
        { label: "4", votes: 90 },
        { label: "3", votes: 5 },
        { label: "5", votes: 5 },
      ],
    },
  ],
  [
    {
      question: "What is the largest ocean on Earth?",
      options: [
        { label: "Pacific Ocean", votes: 70 },
        { label: "Atlantic Ocean", votes: 20 },
        { label: "Indian Ocean", votes: 10 },
      ],
    },
  ],
];

export default function QuestionPollPage() {
  const [showHistory, setShowHistory] = useState(false);
  const [timer, setTimer] = useState(0); // Will be synced with backend
  const [isPollActive, setIsPollActive] = useState(false);
  const [questionId, setQuestionId] = useState(""); // Track current question for vote reset
  const navigate = useNavigate();
  const { userRole } = useContext(userContext);
  const socket = useContext(socketContext);
  const [mockPoll, setMockPoll] = useState(
    {} as {
      question: string;
      options: { label: string; votes: number }[];
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
        setMockPoll({} as { question: string; options: { label: string; votes: number }[], duration: number });
        setQuestionId('');
      }, 60000); // 1 minute = 60000ms
    }

    return () => {
      if (inactivityTimer) {
        window.clearTimeout(inactivityTimer);
      }
    };
  }, [isPollActive, mockPoll.question]);

  useEffect(() => {
    // Join room based on user role
    socket.emit("joinRoom", { role: userRole });

    socket.on(
      "newQuestion",
      (data: {
        question: string;
        options: { value: string; votes: number }[];
        duration: number;
      }) => {
        // Transform options format from backend to frontend
        const transformedData = {
          question: data.question,
          options: data.options.map((opt) => ({
            label: opt.value,
            votes: opt.votes,
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
        options: { value: string; votes: number }[];
        duration: number;
      }) => {
        const transformedData = {
          question: updatedPoll.question,
          options: updatedPoll.options.map((opt) => ({
            label: opt.value,
            votes: opt.votes,
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
      {mockPoll.question ? (
        <div>
          <div className="w-full max-w-xl flex flex-col items-start">
            <div className="flex items-center w-full justify-between mb-6">
              <h2 className="text-2xl font-semibold">Question</h2>
              {userRole === "teacher" && (
                <button
                  className="text-violet-700 underline font-medium text-sm hover:text-violet-900"
                  onClick={() => setShowHistory((h) => !h)}
                >
                  {showHistory ? "Hide Poll History" : "View Poll History"}
                </button>
              )}
              {userRole === "student" && (
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
              )}
            </div>
            {/* History Modal/Section */}
            {showHistory && userRole === "teacher" && (
              <div className="w-full mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                {pollHistory.map((pollArr, idx) => (
                  <Question
                    mockPoll={pollArr[0]}
                    key={idx}
                    userRole={userRole}
                    questionId={`history-${idx}`}
                  />
                ))}
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
