import React from 'react';
import { ArchivedWord } from '../types';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface RecentlyDefinedWordsProps {
  words: ArchivedWord[];
}

const RecentlyDefinedWords: React.FC<RecentlyDefinedWordsProps> = ({ words }) => {
  if (words.length === 0) return null;

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recently Defined Words</h2>
        <Link 
          to="/archive" 
          className="text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors whitespace-nowrap"
        >
          View all →
        </Link>
      </div>
      
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {words.slice(0, 6).map((word, index) => (
          <motion.div
            key={word.word}
            className="flex-shrink-0 w-56 sm:w-64 p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg sm:rounded-xl border border-purple-100 hover:shadow-lg transition-all duration-300 group cursor-pointer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            whileHover={{ y: -2 }}
          >
            <div className="space-y-2">
              <h3 className="font-bold text-gray-800 capitalize text-base sm:text-lg">{word.word}</h3>
              <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                {word.winningDefinitions[0] || 'No definition available'}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                  {word.winningDefinitions.length} definitions
                </span>
                <Link 
                  to={`/archive?word=${word.word}`}
                  className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors"
                >
                  View more
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentlyDefinedWords;