import { useContext, useEffect, useState } from "react";
import { socketContext } from "../App";
import { useNavigate } from "react-router-dom";
import { useChat } from "../hooks/useChat";

interface Participant {
  name: string;
  id: string;
}

export default function ChatBox({ role }: { role: "student" | "teacher" }) {
  const [tab, setTab] = useState<"chat" | "participants">("chat");
  const [showchat, setShowChat] = useState(false);
  const socket = useContext(socketContext);
  const navigate = useNavigate();
  const [participantsList, setParticipantsList] = useState<Participant[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [userName, setUserName] = useState(role === "teacher" ? "Teacher" : "");
  const [hasSetName, setHasSetName] = useState(role === "teacher");

  // Use the chat hook
  const { messages: chatMessages, sendMessage, isLoading } = useChat(hasSetName ? userName : "");

  useEffect(() => {
    // Request participants list when component mounts
    socket.emit("getParticipants", { role, id: socket.id });
    
    // Listen for participants list updates
    socket.on("participantsList", (data: Participant[]) => {
      console.log('Received participants list:', data);
      setParticipantsList(data);
      
      // Auto-set username from participants if student hasn't set one
      if (role === "student" && !hasSetName && data.length > 0) {
        const currentUser = data.find(p => p.id === socket.id);
        if (currentUser) {
          setUserName(currentUser.name);
          setHasSetName(true);
        }
      }
    });

    // Listen for being kicked (students only)
    socket.on("kicked", (data: { message: string; kickedBy: string }) => {
      console.log('You have been kicked:', data);
      alert(data.message);
      navigate('/kicked'); // Redirect to kicked page
    });

    return () => {
      socket.off("participantsList");
      socket.off("kicked");
    };
  }, [role, socket, navigate, hasSetName]);

  const handleKickParticipant = (participantId: string, participantName: string) => {
    if (window.confirm(`Are you sure you want to kick ${participantName}?`)) {
      socket.emit("kickParticipant", {
        participantId: participantId,
        kickedBy: socket.id
      });
    }
  };

  const handleSendMessage = () => {
    if (currentMessage.trim() && hasSetName) {
      sendMessage(currentMessage);
      setCurrentMessage("");
    }
  };

  const handleSetName = () => {
    if (userName.trim()) {
      setHasSetName(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!hasSetName) {
        handleSetName();
      } else {
        handleSendMessage();
      }
    }
  };


  return (
    <div className="max-w-sm w-80 md:w-full absolute z-10 right-[5%] bottom-[10%] md:bottom-[5%] rounded-md   bg-white overflow-hidden">
      <div
        className={`${
          showchat ? "block" : "hidden"
        } border border-gray-200 shadow-md`}
      >
        {/* Tabs */}
        <div className="flex border-b text-sm font-semibold">
          <button
            className={`flex-1 p-3 ${
              tab === "chat"
                ? "border-b-2 border-violet-600 text-violet-700"
                : "text-gray-500"
            }`}
            onClick={() => setTab("chat")}
          >
            Chat
          </button>
          <button
            className={`flex-1 p-3 ${
              tab === "participants"
                ? "border-b-2 border-violet-600 text-violet-700"
                : "text-gray-500"
            }`}
            onClick={() => setTab("participants")}
          >
            Participants ({participantsList.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 min-h-[320px] max-h-[340px] overflow-y-auto bg-white relative">
          {tab === "chat" ? (
            <div className="space-y-3 h-full flex flex-col">
              {/* Messages container */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {!hasSetName && role === "student" ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="mb-4">Please set your name to join the chat</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter your name"
                        className="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-sm outline-none border border-gray-200"
                      />
                      <button
                        onClick={handleSetName}
                        disabled={!userName.trim()}
                        className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                      >
                        Set
                      </button>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="text-center text-gray-500 py-8">Loading chat...</div>
                ) : chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={msg.id || i}
                      className={`flex flex-col ${
                        msg.self ? "items-end" : "items-start"
                      }`}
                    >
                      <span className="text-xs font-medium mb-1 text-violet-700">
                        {msg.user}
                      </span>
                      <div
                        className={`rounded-lg px-4 py-2 text-sm font-medium max-w-[80%]
                      ${
                        msg.self
                          ? "bg-violet-400 text-white"
                          : "bg-gray-800 text-white"
                      }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-400 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between">
                <h3 className="mb-3 font-medium text-gray-700 text-base">
                  Name
                </h3>
                {role === "teacher" && (
                  <h3 className="mb-3 font-medium text-gray-700 text-base">
                    Actions
                  </h3>
                )}
              </div>

              <ul className="space-y-2">
                {participantsList.map((participant, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-gray-800 font-medium"
                  >
                    <span className="inline-block bg-violet-200 w-2.5 h-2.5 rounded-full"></span>
                    <span className="flex-1">{participant.name}</span>
                    {role === "teacher" && participant.id !== socket.id && (
                      <button 
                        className="ml-auto text-sm text-red-600 font-semibold hover:text-red-800"
                        onClick={() => handleKickParticipant(participant.id, participant.name)}
                      >
                        Kick out
                      </button>
                    )}
                  </li>
                ))}
                {participantsList.length === 0 && (
                  <li className="text-gray-500 text-center py-4">
                    No participants yet
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="flex items-center p-4 border-t">
          <input
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-700 outline-none border border-gray-200"
            placeholder={hasSetName ? "Type a message..." : "Set your name first..."}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!hasSetName}
          />
          <button 
            className="ml-2 bg-violet-600 rounded-full p-3 text-white disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={!hasSetName || !currentMessage.trim()}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22l-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating chat button for UI (not functional here) */}
      <button
        onClick={() => setShowChat(!showchat)}
        className="fixed bottom-4 right-4 rounded-full bg-violet-600 text-white p-5 shadow-xl"
      >
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}
