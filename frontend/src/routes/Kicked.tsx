import { Sparkles } from 'lucide-react';
import React from 'react';

const KickedOut: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-white px-4">
    <div className="flex flex-col items-center">
      <div className="bg-gradient-to-r from-violet-500 to-[#4F0DCE] flex items-center text-white px-6 py-2 rounded-xl font-semibold mb-6 shadow-sm">
        <Sparkles className="h-4" />Intervue Poll
      </div>
      <h1 className="text-center text-3xl md:text-4xl font-semibold mb-4">
        You’ve been <span className="font-bold">Kicked out !</span>
      </h1>
      <p className="text-center text-gray-400 text-lg font-medium max-w-xl">
        Looks like the teacher had removed you from the poll system. Please Try again sometime.
      </p>
    </div>
  </div>
);

export default KickedOut;
