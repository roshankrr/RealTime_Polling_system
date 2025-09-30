import  { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketContext } from '../App';
import { userContext } from '../App';
import { Sparkles } from 'lucide-react';
const timeOptions = ['30 seconds', '60 seconds', '120 seconds'];

export default function PollCreator() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { value: '', isCorrect: false,votes:0 },
    { value: '', isCorrect: false,votes:0 },
  ]);
  const [duration, setDuration] = useState('60 seconds');
  const socket = useContext(socketContext);
  const { userRole } = useContext(userContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Join teacher room when component mounts
    if(userRole==='student'){
        navigate('/');
    }
    socket.emit('joinRoom', { role: userRole });
  }, [socket, userRole]);
  // Option update handlers
  const handleOptionChange = (idx: number, key: 'value' | 'isCorrect', newValue: any) => {
    setOptions(prev =>
      prev.map((opt, i) =>
        i === idx
          ? key === 'isCorrect'
            ? { ...opt, isCorrect: newValue }
            : { ...opt, value: newValue }
          : opt
      )
    );
  };

  const addOption = () => setOptions([...options, { value: '', isCorrect: false,votes:0 }]);


    const handleSubmit = () => {
      // Send the poll data to the backend
      socket.emit('createPoll', { question, options, duration });
      
      // Navigate immediately - the QuestionPoll will receive the question via socket
      navigate('/question');
    };


  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="max-w-4xl mx-auto pt-12 px-4">
        <div className="mb-2">
            
          <div className="bg-violet-100 items-center w-40 text-violet-700 px-5 py-2 rounded-xl font-semibold mb-4 flex">
            <Sparkles className="h-4" />
             Intervue Poll
          </div>
        </div>
        <h1 className="text-4xl font-medium mb-1">
          Let’s <span className="font-bold">Get Started</span>
        </h1>
        <p className="text-gray-400 font-normal mb-8 max-w-2xl">
          you’ll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
        </p>

        {/* QUESTION INPUT */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <label className="font-semibold text-lg mb-2 block">Enter your question</label>
          <select
            className="rounded-lg px-5 py-3 text-gray-700 focus:outline-none mb-4 bg-gray-100"
            value={duration}
            onChange={e => setDuration(e.target.value)}
          >
            {timeOptions.map(opt => (
              <option key={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="relative mb-8">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            className="w-full min-h-[92px] max-h-[140px] p-6 rounded-lg border-0 outline-none bg-gray-100 resize-none text-lg text-gray-800"
            maxLength={100}
            placeholder="Enter your question here..."
          />
          <span className="absolute bottom-3 right-4 text-gray-400 text-sm">{question.length}/100</span>
        </div>

        {/* HEADER ROW for Options & Is Correct */}
        <div className="flex justify-between items-center mb-2 w-full max-w-3xl">
          <label className="font-semibold text-base">Edit Options</label>
          <label className="font-semibold text-base">Is it Correct?</label>
        </div>
        {/* OPTIONS */}
        <div className="space-y-4 mb-4">
          {options.map((opt, idx) => (
            <div
              key={idx}
              className="flex items-center w-full max-w-3xl gap-6"
            >
              {/* Option Number and Input */}
              <div className="flex items-center flex-1">
                <span className="h-7 w-7 flex items-center justify-center bg-violet-200 text-violet-800 font-bold rounded-full mr-3">
                  {idx + 1}
                </span>
                <input
                  className="py-3 px-4 rounded-lg bg-gray-100 w-full outline-none border border-gray-200"
                  value={opt.value}
                  onChange={e => handleOptionChange(idx, 'value', e.target.value)}
                  placeholder="Option"
                />
              </div>
              {/* Radio Buttons */}
              <div className="flex space-x-6 shrink-0">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`isCorrect-${idx}`}
                    checked={opt.isCorrect === true}
                    onChange={() => handleOptionChange(idx, 'isCorrect', true)}
                    className="accent-violet-600 focus:ring-violet-500"
                  />
                  <span className="ml-1 text-gray-700 font-medium">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name={`isCorrect-${idx}`}
                    checked={opt.isCorrect === false}
                    onChange={() => handleOptionChange(idx, 'isCorrect', false)}
                    className="accent-violet-600 focus:ring-violet-500"
                  />
                  <span className="ml-1 text-gray-700 font-medium">No</span>
                </label>
              </div>
            </div>
          ))}
        </div>
        {/* Add More Option Button */}
        <button
          className="rounded-lg px-4 py-2 border border-violet-400 text-violet-700 mt-1 hover:bg-violet-50 transition"
          onClick={addOption}
          type="button"
        >
          + Add More option
        </button>
      </div>

      {/* Bottom fixed button */}
      <div className="w-full h-30 mt-10  left-0 bottom-0  flex justify-end items-center px-10 py-8 border-t border-gray-300 z-10">
        <button
          className="rounded-full px-10 py-2 md:px-14 md:py-4 text-white font-semibold text-md md:text-lg bg-gradient-to-r from-violet-500 to-violet-700 hover:from-violet-700 hover:to-violet-500 transition"
            onClick={handleSubmit}
        >
          Ask Question
        </button>
      </div>
    </div>
  );
}
