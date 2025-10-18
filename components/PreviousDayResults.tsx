import React from 'react';
import { ArchivedWord } from '../types';

interface PreviousDayResultsProps {
  results: ArchivedWord;
  onClose: () => void;
}

const PreviousDayResults: React.FC<PreviousDayResultsProps> = ({ results, onClose }) => {
  return (
    <div className="relative bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border border-gray-200 animate-fade-in-up">
      <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <p className="text-sm font-semibold text-purple-700 mb-2">Yesterday's Word & Winning Definitions</p>
      <div className="flex flex-col md:flex-row gap-6">
        {results.image && (
          <img
            src={`data:image/png;base64,${results.image}`}
            alt={`Abstract art for ${results.word}`}
            className="w-full md:w-32 h-32 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div>
          <h3 className="text-3xl font-bold capitalize text-gray-800">{results.word}</h3>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
            {results.winningDefinitions.map((def, index) => (
              <li key={index}>{def}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PreviousDayResults;
