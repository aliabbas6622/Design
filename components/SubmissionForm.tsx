import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../context/AppStateContext';
import UsernameInput from './UsernameInput';

const SubmissionForm: React.FC = () => {
  const { addSubmission, addSubmissionFromServer } = useAppState();
  const [text, setText] = useState('');
  const maxLength = 280;
  const [localUsername, setLocalUsername] = useState<string>('');
  const [imageProvider, setImageProvider] = useState<'gemini' | 'chatgpt' | 'clipdrop'>('gemini');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`;
    }
  }, [text]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      // Try to post to backend; fallback to client-side addSubmission
      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          username: localUsername || undefined,
          imageProvider
        })
      }).then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          // Use server-provided submission (includes server-generated username)
          addSubmissionFromServer(data);
          setText('');
          setLocalUsername('');
        } else {
          addSubmission(text);
          setText('');
        }
      }).catch(() => {
        addSubmission(text);
        setText('');
      });
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/50 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-xl -z-10"></div>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paint your vision with words... What essence does this word hold?"
            className="w-full min-h-[80px] max-h-[200px] p-3 sm:p-4 text-sm sm:text-base bg-white/90 backdrop-blur-sm border-2 border-purple-200/50 rounded-lg sm:rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-300 transition-all text-gray-800 placeholder-gray-500 shadow-inner overflow-y-auto"
            maxLength={maxLength}
            rows={1}
          />
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              text.length > maxLength * 0.8 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-500'
            }`}>
              {text.length} / {maxLength}
            </span>
          </div>
        </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <UsernameInput value={localUsername} onChange={setLocalUsername} />
        <button
          type="submit"
          disabled={!text.trim()}
          className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Weave Into Reality
        </button>
      </div>
      </form>
    </div>
  );
};

export default SubmissionForm;