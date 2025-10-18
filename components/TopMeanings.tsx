import React from 'react';
import { motion } from 'framer-motion';
import { Submission } from '../types';

interface TopMeaningsProps {
  word: string;
  submissions: Submission[];
  onSummarize: () => void;
  isSummarizing: boolean;
}

const TopMeanings: React.FC<TopMeaningsProps> = ({ word, submissions, onSummarize, isSummarizing }) => {
  if (submissions.length < 3) return null;

  return (
    <motion.div
      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <h3 className="text-base sm:text-lg font-bold text-gray-800">Community Insights</h3>
        <span className="text-xs sm:text-sm text-purple-600 bg-purple-100 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
          {submissions.length} definitions
        </span>
      </div>
      
      <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">
        Ready to discover the collective meaning of "{word}"? Let AI curate the top interpretations.
      </p>
      
      <button
        onClick={onSummarize}
        disabled={isSummarizing}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSummarizing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-b-transparent" />
            <span className="hidden sm:inline">Weaving meanings...</span>
            <span className="sm:hidden">Weaving...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="hidden sm:inline">Generate AI Summary</span>
            <span className="sm:hidden">AI Summary</span>
          </>
        )}
      </button>
    </motion.div>
  );
};

export default TopMeanings;