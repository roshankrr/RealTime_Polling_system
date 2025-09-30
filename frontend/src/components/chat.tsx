import { useState } from "react";

const messages = [
  { user: "User 1", text: "Hey There , how can I help?", self: false },
  { user: "User 2", text: "Nothing bro..just chill!!!", self: true },
];

const participants = ["User 1", "User 2", "User 3"];

export default function ChatBox({ role }: { role: "student" | "teacher" }) {
  const [tab, setTab] = useState<"chat" | "participants">("chat");
  const [showchat, setShowChat] = useState(false);

  return (
    <div className="max-w-sm w-full absolute left-250 top-60 rounded-md   bg-white overflow-hidden">
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
            Participants
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 min-h-[320px] max-h-[340px] overflow-y-auto bg-white relative">
          {tab === "chat" ? (
            <div className="space-y-6">
              {/* Static messages, map for real chat */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${
                    msg.self ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-xs font-medium mb-1 text-violet-700">
                    {msg.user}
                  </span>
                  <div
                    className={`rounded-lg px-4 py-2 text-sm font-medium 
                  ${
                    msg.self
                      ? "bg-violet-400 text-white"
                      : "bg-gray-800 text-white"
                  }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
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
                {participants.map((user, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-gray-800 font-medium"
                  >
                    <span className="inline-block bg-violet-200 w-2.5 h-2.5 rounded-full"></span>
                    {user}
                    {role==="teacher" &&<button className="ml-auto text-sm text-violet-600 font-semibold">
                      Kick out
                    </button>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Chat Input & Floating Button Placeholder */}
        <div className="flex items-center p-4 border-t">
          <input
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-gray-700 outline-none border border-gray-200"
            placeholder="Type a message..."
            disabled
          />
          <button className="ml-2 bg-violet-600 rounded-full p-3 text-white">
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
