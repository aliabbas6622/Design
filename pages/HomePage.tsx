import React, { useState, useCallback } from 'react';
import { useAppState } from '../context/AppStateContext';
import WordOfTheDay from '../components/WordOfTheDay';
import SubmissionForm from '../components/SubmissionForm';
import LiveSubmissionsFeed from '../components/LiveSubmissionsFeed';
import LoadingSpinner from '../components/LoadingSpinner';
import AdminPanel from '../components/AdminPanel';
import PreviousDayResults from '../components/PreviousDayResults';
import RecentlyDefinedWords from '../components/RecentlyDefinedWords';
import TopMeanings from '../components/TopMeanings';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage: React.FC = () => {
  const { currentWord, isLoading, previousDayResults, clearPreviousDayResults, archive, submissions, triggerSummarization, isSummarizing } = useAppState();
  const [isAdminPanelVisible, setIsAdminPanelVisible] = useState(false);
  
  const handleAdminClose = useCallback(() => setIsAdminPanelVisible(false), []);

  // Listen for admin toggle event from header
  React.useEffect(() => {
    const handleAdminToggle = () => setIsAdminPanelVisible(true);
    window.addEventListener('toggleAdmin', handleAdminToggle);
    return () => window.removeEventListener('toggleAdmin', handleAdminToggle);
  }, []);

  return (
    <motion.div 
      className="relative space-y-6 sm:space-y-8 lg:space-y-12 px-3 sm:px-4 lg:px-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <AdminPanel isVisible={isAdminPanelVisible} onClose={handleAdminClose} />
      
      <AnimatePresence>
        {previousDayResults && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <PreviousDayResults results={previousDayResults} onClose={clearPreviousDayResults} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            className="flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingSpinner />
            <p className="mt-4 text-gray-500 animate-pulse">Dreaming up a new word...</p>
          </motion.div>
        ) : currentWord ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <WordOfTheDay word={currentWord} />
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-pink-50/50 rounded-2xl sm:rounded-3xl -z-10"></div>
              <div className="hidden sm:block absolute top-4 right-4 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-2xl -z-10"></div>
              <div className="hidden sm:block absolute bottom-4 left-4 w-24 h-24 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-xl -z-10"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 pt-4 sm:pt-6 pb-4 sm:pb-6 px-4 sm:px-6">
                <motion.div 
                  className="space-y-4 sm:space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <div className="text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-100 to-blue-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-2 sm:mb-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs sm:text-sm font-medium text-gray-700">Share Your Vision</span>
                    </div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-700 bg-clip-text text-transparent leading-tight">
                      What does "{currentWord.word}" mean to you?
                    </h2>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm">Join the collective imagination and weave your interpretation into existence.</p>
                  </div>
                  
                  <SubmissionForm />
                  
                  {submissions.length >= 3 && (
                    <TopMeanings
                      word={currentWord.word}
                      submissions={submissions}
                      onSummarize={triggerSummarization}
                      isSummarizing={isSummarizing}
                    />
                  )}
                </motion.div>
                
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <LiveSubmissionsFeed />
                </motion.div>
              </div>
            </div>
            
            {archive.length > 0 && (
              <div className="pt-4 sm:pt-6">
                <RecentlyDefinedWords words={archive} />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center bg-gray-50 text-gray-500 p-6 sm:p-8 rounded-lg flex flex-col items-center justify-center min-h-[50vh] sm:min-h-[60vh] border border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LoadingSpinner />
            <p className="mt-4 text-gray-500">Initializing...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HomePage;