
import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext';
import { ArchivedWord } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import AdPlaceholder from '../components/AdPlaceholder';
import AdminPanel from '../components/AdminPanel';

const ArchiveCard: React.FC<{ word: ArchivedWord; onClick: () => void }> = ({ word, onClick }) => (
  <motion.div
    className="group cursor-pointer bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-xl transition-all duration-300"
    whileHover={{ y: -4, scale: 1.02 }}
    onClick={onClick}
  >
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-800 capitalize group-hover:text-purple-700 transition-colors">
          {word.word}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            {word.winningDefinitions.length} meanings
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 line-clamp-2 leading-relaxed">
        {word.winningDefinitions[0] || 'No definition available'}
      </p>
      
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-gray-400">
          {new Date(word.date).toLocaleDateString()}
        </span>
        <span className="text-sm text-purple-600 group-hover:text-purple-700 font-medium">
          View more →
        </span>
      </div>
    </div>
  </motion.div>
);

const WordDetailModal: React.FC<{ word: ArchivedWord; onClose: () => void }> = ({ word, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-800 capitalize">{word.word}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">AI-Curated Meanings</h3>
          {word.winningDefinitions.map((definition, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
              <p className="text-gray-700 leading-relaxed">{definition}</p>
            </div>
          ))}
        </div>
        
        <div className="text-sm text-gray-500 pt-4 border-t">
          Archived on {new Date(word.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const ArchivePage: React.FC = () => {
  const { archive } = useAppState();
  const [selectedWord, setSelectedWord] = useState<ArchivedWord | null>(null);
  const [isAdminPanelVisible, setIsAdminPanelVisible] = useState(false);

  React.useEffect(() => {
    const handleAdminToggle = () => setIsAdminPanelVisible(true);
    window.addEventListener('toggleAdmin', handleAdminToggle);
    return () => window.removeEventListener('toggleAdmin', handleAdminToggle);
  }, []);

  return (
    <>
      <AdminPanel isVisible={isAdminPanelVisible} onClose={() => setIsAdminPanelVisible(false)} />
      <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-bold tracking-tight text-gray-800">
          Dream Archive
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          A collection of ethereal words and their collective meanings, woven from the imagination of our community.
        </p>
      </motion.div>
      
      {archive.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-gradient-to-br from-gray-50 to-purple-50 text-gray-500 p-12 rounded-2xl border border-gray-200"
        >
          <svg className="w-24 h-24 mb-6 text-gray-300 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">The First Page is Unwritten</h3>
          <p className="max-w-md mx-auto">Past words and their meanings will be archived here. Complete a day to begin the collection!</p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {archive.map((word, index) => (
              <motion.div
                key={word.word + word.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ArchiveCard
                  word={word}
                  onClick={() => setSelectedWord(word)}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {archive.length > 6 && (
            <div className="flex justify-center">
              <AdPlaceholder />
            </div>
          )}
        </div>
      )}
      
      <AnimatePresence>
        {selectedWord && (
          <WordDetailModal
            word={selectedWord}
            onClose={() => setSelectedWord(null)}
          />
        )}
      </AnimatePresence>
    </div>
    </>
  );
};

export default ArchivePage;