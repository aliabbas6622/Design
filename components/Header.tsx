import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentWord } = useAppState();
  const linkClasses = 'text-gray-500 hover:text-[var(--accent-color)] transition-colors font-medium';
  const activeLinkClasses = 'text-[var(--accent-color)]';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <NavLink to="/" className="flex items-center gap-3 relative z-50">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4Z" fill="url(#paint0_linear_1_2)"/>
            <path d="M24 14L34 24L24 34L14 24L24 14Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
            <linearGradient id="paint0_linear_1_2" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A78BFA"/>
            <stop offset="1" stopColor="#3B82F6"/>
            </linearGradient>
            </defs>
          </svg>
          <div>
            <h1 className="text-lg font-bold text-gray-800 tracking-wide">ETHEREALEX</h1>
            <p className="text-xs text-gray-500 mt-1">
              {currentWord ? `Today: ${currentWord.word}` : 'Weaving Worlds from Words'}
            </p>
          </div>
        </NavLink>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6 ml-8">
          <NavLink 
            to="/" 
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            Home
          </NavLink>
          <NavLink 
            to="/archive" 
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            Archive
          </NavLink>
        </div>

        {/* Search (center) */}
        <div className="hidden lg:flex flex-1 justify-center px-8">
          <div className="w-full max-w-lg">
            <label htmlFor="site-search" className="sr-only">Search</label>
            <div className="relative">
              <input id="site-search" type="search" placeholder="Search archive, words, submissions..." className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu}
          className="md:hidden relative z-50 p-2 -mr-2 text-gray-500 hover:text-gray-600 focus:outline-none"
          aria-label="Toggle menu"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <div className={`w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-0.5' : ''} relative`}>
              <div className={`absolute w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : '-translate-y-1.5'}`} />
              <div className={`absolute w-5 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-90 translate-y-0' : 'translate-y-1.5'}`} />
            </div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('toggleAdmin'))}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg hover:opacity-90 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Admin
          </button>
        </div>

        {/* Mobile Sidebar */}
        {isMenuOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMenuOpen(false)} />
            <div className="fixed top-0 right-0 h-full w-72 bg-gradient-to-br from-white to-purple-50 shadow-2xl z-50 md:hidden transform transition-transform duration-300 rounded-l-3xl">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-purple-100">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Menu</h2>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-500 hover:text-purple-600 transition-colors rounded-full hover:bg-purple-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="flex-1 p-6 space-y-3">
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' : 'text-gray-700 hover:bg-white/50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </NavLink>
                  <NavLink 
                    to="/archive" 
                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' : 'text-gray-700 hover:bg-white/50'}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Archive
                  </NavLink>
                  <button 
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.dispatchEvent(new CustomEvent('toggleAdmin'));
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-white/50 transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Admin
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;