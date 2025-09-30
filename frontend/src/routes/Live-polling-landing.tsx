import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../App';
import { socketContext } from '../App';
import { Sparkles } from 'lucide-react';
const roles = [
  {
    key: 'student',
    title: "I'm a Student",
    desc: 'I am ready to ans all the questions arriving in my life time & real-time.',
    path: '/student-register',
  },
  {
    key: 'teacher',
    title: "I'm a Teacher",
    desc: 'Submit answers and view live poll results in real-time.',
    path: '/create-poll',
  },
];


export const LivePollingLanding: React.FC = () => {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const navigate = useNavigate();
  const { setUserRole } = useContext(userContext)
    const socket = useContext(socketContext);

  const handleClick = (key: 'student' | 'teacher') => {
    const selectedRole = roles.find(r => r.key === key);
    if (selectedRole) {
      setUserRole(key);
      navigate(selectedRole.path);
    }
  };


    useEffect(() => {
    socket.connect();
    socket.emit('joinRoom', { role: role });
    // return () => {
    //     socket.disconnect();
    // };
    }, [role]);

  return (
    <div className="flex flex-col items-center justify-center   h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-violet-500 to-[#4F0DCE] flex items-center text-white font-semibold rounded-xl py-2 px-8 mb-6">
       <Sparkles className="h-4" />Intervue Poll
      </div>
      <h1 className="text-4xl md:text-5xl font-medium mb-2 text-center">
        Welcome to the <span className="font-bold">Live Polling System</span>
      </h1>
      <p className="text-gray-400 text-lg text-center mx-4 mt-4 mb-2">
        Please select the role that best describes you to begin using the live polling system
      </p>
      <div className="flex flex-row flex-wrap justify-center mt-8">
        {roles.map(({ key, title, desc }) => (
          <div
            key={key}
            onClick={() => setRole(key as 'student' | 'teacher')}
            className={`min-w-[280px] max-w-xs px-8 py-10 rounded-xl cursor-pointer m-3 bg-white transition-all 
              ${role === key
                ? 'border-2 border-violet-700 shadow-xs'
                : 'border-2 border-gray-200'
            }`}
          >
            <h2 className="font-bold text-lg mb-2">{title}</h2>
            <p className="text-gray-400 text-base">{desc}</p>
          </div>
        ))}
      </div>
      <button
        className="mt-12  px-18 py-4 rounded-full text-white font-semibold text-lg bg-gradient-to-r from-violet-500 to-violet-700 hover:from-violet-700 hover:to-violet-500 transition"
        onClick={() => handleClick(role)}
      >
        Continue
      </button>
    </div>
  );
};

export default LivePollingLanding;

