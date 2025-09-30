import { useState, useEffect } from 'react';

const Question = ({
  mockPoll,
  onVote,
  userRole,
  questionId
}: {
  mockPoll: { question: string; options: { label: string; votes: number; isCorrect?: boolean }[] };
  onVote?: (optionIndex: number) => void;
  userRole: 'student' | 'teacher';
  questionId?: string;
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  // Reset voting state when question changes
  useEffect(() => {
    if (questionId) {
      setSelectedOption(null);
      setHasVoted(false);
      console.log('Vote state reset for new question:', questionId);
    }
  }, [questionId]);

  // Calculate total votes and percent per option
  const totalVotes = mockPoll.options.reduce((sum, opt) => sum + opt.votes, 0);
  const getPercent = (votes: number) => (totalVotes ? Math.round((votes / totalVotes) * 100) : 0);

  const handleOptionClick = (optionIndex: number) => {
    if (userRole === 'student' && !hasVoted && onVote) {
      setSelectedOption(optionIndex);
      setHasVoted(true);
      onVote(optionIndex);
    }
  };

  const isVotingEnabled = userRole === 'student' && !hasVoted && onVote;
  return (
    <div className="w-full max-w-xl my-4 rounded-xl border border-violet-300 shadow-lg bg-white mx-auto">
        <div className="bg-gradient-to-r from-gray-600 to-gray-500 rounded-t-xl px-6 py-4 text-white font-semibold text-base">
          {mockPoll.question}
        </div>
        <div className="p-6 space-y-4">
          {mockPoll.options.map((opt, idx) => (
            <div 
              key={opt.label} 
              className={`relative flex items-center mb-2 bg-transparent transition-all duration-200 ${
                isVotingEnabled 
                  ? 'cursor-pointer hover:bg-gray-50 rounded-lg' 
                  : ''
              } ${
                selectedOption === idx ? '' : ''
              }`}
              onClick={() => handleOptionClick(idx)}
            >
              {/* Option Number circle */}
              <div className={`z-10 flex items-center justify-center w-7 h-7 rounded-full font-bold mr-3 ${
                selectedOption === idx && opt.isCorrect
                  ? 'bg-green-500 text-white' 
                  : selectedOption === idx && !opt.isCorrect
                  ? 'bg-red-500 text-white'
                  : 'bg-[#6766D5] text-white'
              }`}>
                {selectedOption === idx ? '✓' : idx + 1}
              </div>
              {/* The Progress Bar Track */}
              <div className="w-full relative">
                <div className="absolute inset-0 flex items-center h-12 z-0">
                  <div
                    className={`rounded-lg transition-all duration-500 h-12`}
                    style={{
                      width: `${getPercent(opt.votes)}%`,
                      background: selectedOption === idx && opt.isCorrect 
                        ? '#10B981' 
                        : selectedOption === idx && !opt.isCorrect
                        ? '#EF4444'
                        : '#6766D5',
                      opacity: 0.85,
                    }}
                  />
                </div>
                {/* Option Text & Percent, above progress bar */}
                <div className="flex items-center z-10 relative h-12 px-4 text-lg font-medium"
                     style={{ color: getPercent(opt.votes) > 35 ? "black" : "#444" }}>
                  <span className="flex-1">{opt.label}</span>
                  <span className="ml-3 font-semibold">
                    {getPercent(opt.votes)}% ({opt.votes} votes)
                  </span>
                </div>
              </div>
            </div>
          ))}
          {userRole === 'student' && hasVoted && selectedOption !== null && (
            <div className={`text-center font-medium mt-4 ${
              mockPoll.options[selectedOption]?.isCorrect 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {mockPoll.options[selectedOption]?.isCorrect 
                ? '✓ Correct! Your vote has been submitted!' 
                : '✗ Incorrect answer. Your vote has been submitted!'}
            </div>
          )}
        </div>
      </div>

  )
}

export default Question



