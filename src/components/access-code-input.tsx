"use client";

import { useState } from "react";

const STORAGE_KEY = "access_code";

export default function AccessCodeInput() {
  const [accessCode, setAccessCode] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(STORAGE_KEY) ?? "";
  });  
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, accessCode);
    setIsEditing(false);
  };

  const handleCancel = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setAccessCode(stored || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isEditing && !accessCode) {
    return (
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-50"
      >
        + Add Access Code
      </button>
    );
  }

  if (!isEditing && accessCode) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Code: {accessCode}</span>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter access code"
        className="w-32 text-slate-600 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
        autoFocus
      />
      <button
        type="button"
        onClick={handleCancel}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSave}
        className="text-sm text-blue-600 hover:text-blue-700"
      >
        Save
      </button>
    </div>
  );
}
