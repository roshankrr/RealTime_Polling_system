// LoadingComponent.jsx

import { Sparkles } from "lucide-react";

export default function LoadingComponent() {
  return (
    <div className="flex flex-col items-center justify-center  bg-white">
      {/* "Intervue Poll" pill */}
      <button className="px-4 py-1 mb-6 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-[#4F0DCE] text-white text-xs font-medium shadow">
        <Sparkles className="h-4" />Intervue Poll
      </button>
      
      {/* Spinner - animated 'C' */}
      <div className="mb-6">
        <svg width={56} height={56} viewBox="0 0 56 56">
          <path
            d="M44 28c0-8.837-7.163-16-16-16s-16 7.163-16 16"
            stroke="#7C3AED"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 28 28"
              to="360 28 28"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      </div>
      
      {/* Loading text */}
      <p className="text-lg font-semibold text-black">
        Wait for the teacher to ask questions..
      </p>
    </div>
  );
}
