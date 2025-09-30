import React, { useState } from 'react';
import ChatBox from '../components/chat';
import { useNavigate } from 'react-router-dom';
import { socketContext } from '../App';
import { Sparkles } from 'lucide-react';
const StudentStarter: React.FC = () => {
  const [name, setName] = useState('');
    const navigate = useNavigate();
    const socket = React.useContext(socketContext);

    const handleRegister = () => {
        if (name.trim()) {
            socket.emit('registerStudent', { name: name.trim(),id: socket.id });
            navigate('/question');
        }
    }
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4">
        <ChatBox role="student"/>
      {/* Badge */}
      <div className="bg-gradient-to-r from-violet-500 to-[#4F0DCE] text-white flex items-center px-6 py-2 rounded-full mb-8 font-medium shadow-sm">
        <Sparkles className="h-4" />Intervue Poll
      </div>
      {/* Heading */}
      <h1 className="text-center text-4xl md:text-5xl font-semibold mb-3">
        Let’s <span className="font-bold">Get Started</span>
      </h1>
      {/* Description */}
      <p className="text-center text-gray-500 text-lg max-w-xl mb-10">
        If you’re a student, you’ll be able to <span className="font-semibold text-black">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
      </p>
      {/* Name Form */}
      <div className="w-full  max-w-md flex flex-col items-center  mx-auto">
        <div className='w-80 md:w-100'>
            <label htmlFor="student-name" className="block font-semibold text-base mb-2 text-gray-900">
          Enter your Name
        </label>
        <input
          id="student-name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full rounded-md bg-gray-100 py-3 px-4 text-lg text-gray-800 outline-none border-none mb-10"
          placeholder="Enter your name"
        />

        </div>
        
        <button
          className="w-60  rounded-full py-4 text-white font-semibold text-lg bg-gradient-to-r from-violet-500 to-violet-700 hover:from-violet-700 hover:to-violet-500 transition"
            onClick={() => handleRegister()}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default StudentStarter;
