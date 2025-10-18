import React from 'react';
import { ArchivedWord } from '../types';

interface ArchiveCardProps {
  archivedWord: ArchivedWord;
}

const ArchiveCard: React.FC<ArchiveCardProps> = ({ archivedWord }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-row h-full group border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      {archivedWord.image && (
        <div className="w-1/3 flex-shrink-0">
          <img
            src={`data:image/png;base64,${archivedWord.image}`}
            alt={`Abstract art for ${archivedWord.word}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-6 flex-grow flex flex-col">
        <p className="text-xs text-gray-500">{archivedWord.date}</p>
        <h3 className="text-2xl font-bold capitalize text-gray-800 mb-3">{archivedWord.word}</h3>
        <ul className="space-y-2 list-disc list-inside text-gray-600 flex-grow">
          {archivedWord.winningDefinitions.map((def, index) => (
            <li key={index} className="text-sm">{def}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ArchiveCard;