import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '../context/AppStateContext';

type Props = {
  value?: string;
  onChange?: (v: string) => void;
};

const UsernameInput: React.FC<Props> = ({ value, onChange }) => {
  const { username: ctxUsername, updateUsername, submissions } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(value ?? ctxUsername);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof value !== 'undefined') setName(value);
  }, [value]);

  useEffect(() => {
    if (typeof value === 'undefined') setName(ctxUsername);
  }, [ctxUsername, value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const checkUsernameTaken = (username: string): boolean => {
    return submissions.some(s => s.username.toLowerCase() === username.toLowerCase());
  };

  const handleBlur = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Username cannot be empty');
      return;
    }
    if (trimmed.toLowerCase() !== ctxUsername.toLowerCase() && checkUsernameTaken(trimmed)) {
      setError('Username already taken');
      return;
    }
    setError('');
    if (onChange) onChange(trimmed);
    else updateUsername(trimmed);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setName(displayName);
      setError('');
      setIsEditing(false);
    }
  };
  
  const displayName = typeof value !== 'undefined' ? value : ctxUsername;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
        <span className="whitespace-nowrap">Submitting as</span>
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="font-semibold bg-white text-purple-700 px-2 py-1 border-2 border-purple-300 rounded focus:outline-none focus:border-purple-500 transition-colors min-w-[120px]"
            maxLength={30}
          />
        ) : (
          <div className="flex items-center gap-1.5 bg-purple-50 px-2 py-1 rounded-lg">
            <span className="font-semibold text-purple-700">{displayName}</span>
            <button onClick={() => setIsEditing(true)} aria-label="Edit username" className="text-purple-500 hover:text-purple-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default UsernameInput;