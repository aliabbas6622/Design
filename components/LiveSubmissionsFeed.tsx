import React, { useMemo } from 'react';
import { useAppState } from '../context/AppStateContext';
import { Submission } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const SubmissionCard: React.FC<{ submission: Submission; onLike: (id: string) => void; index: number; }> = ({ submission, onLike, index }) => (
    <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -2 }}
    >
        <div className="flex items-start gap-2 sm:gap-4">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-xs sm:text-sm text-purple-700">{index}</span>
            </div>
            <div className="flex-grow min-w-0">
                <p className="text-sm sm:text-base text-gray-800 break-words leading-relaxed italic">"{submission.text}"</p>
                <p className="text-xs text-purple-600 mt-1.5 sm:mt-2 font-medium">— {submission.username}</p>
            </div>
            <button 
                onClick={() => onLike(submission.id)}
                className="flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-red-500 transition-all duration-300 flex-shrink-0 group-hover:scale-110"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-xs sm:text-sm">{submission.likes}</span>
            </button>
        </div>
    </motion.div>
);


const LiveSubmissionsFeed: React.FC = () => {
  const { submissions, likeSubmission } = useAppState();

  const sortedSubmissions = useMemo(() => {
    return [...submissions].sort((a, b) => b.likes - a.likes);
  }, [submissions]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Community Voices</h2>
        <div className="flex items-center gap-1 text-xs sm:text-sm text-purple-600">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>{sortedSubmissions.length} interpretations</span>
        </div>
      </div>
      
      <AnimatePresence>
        {sortedSubmissions.length === 0 ? (
          <motion.div 
            className="text-center bg-gradient-to-br from-purple-50 to-blue-50 text-gray-600 p-6 sm:p-8 rounded-lg sm:rounded-xl border border-dashed border-purple-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-medium">The canvas awaits...</p>
              <p className="text-xs sm:text-sm">Be the first to weave meaning into this word.</p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {sortedSubmissions.map((sub, index) => (
              <SubmissionCard key={sub.id} submission={sub} onLike={likeSubmission} index={index + 1} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveSubmissionsFeed;