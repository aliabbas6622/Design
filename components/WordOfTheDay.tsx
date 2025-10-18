import React from 'react';
import { DailyWord } from '../types';

interface WordOfTheDayProps {
  word: DailyWord;
}

const WordOfTheDay: React.FC<WordOfTheDayProps> = ({ word }) => {
  console.log('WordOfTheDay - Full word object:', word);
  console.log('WordOfTheDay - word.image:', word.image ? `exists (${word.image.length} chars)` : 'missing');
  
  return (
    <div 
      className="relative p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl" 
      style={{ background: 'linear-gradient(135deg, #F3E8FF, #E0E7FF)' }}
    >
      <div 
        className="relative w-full h-48 sm:h-64 md:h-80 rounded-xl sm:rounded-2xl bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundImage: word.image ? `url(data:image/png;base64,${word.image})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          backgroundColor: word.image ? 'transparent' : '#667eea'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent rounded-xl sm:rounded-2xl"></div>
        <h1 className="relative text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white capitalize tracking-tighter px-4" style={{ textShadow: '0 6px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)' }}>
          {word.word}
        </h1>
        {!word.image && (
          <div className="absolute bottom-2 right-2 text-xs text-white/60">
            No image generated
          </div>
        )}
      </div>
    </div>
  );
};

export default WordOfTheDay;