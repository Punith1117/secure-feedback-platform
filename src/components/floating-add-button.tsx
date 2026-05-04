"use client";

interface FloatingAddButtonProps {
  onClick: () => void;
  label?: string;
}

export default function FloatingAddButton({ onClick, label = "Create New Instance" }: FloatingAddButtonProps) {
  return (
    <div className="fixed bottom-8 right-8 z-40">
      <button
        onClick={onClick}
        className="group relative flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
        title={label}
      >
        {/* Plus icon */}
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 4v16m8-8H4" />
        </svg>

        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1 text-sm text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          {label}
          <span className="absolute top-full right-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></span>
        </span>
      </button>
    </div>
  );
}
