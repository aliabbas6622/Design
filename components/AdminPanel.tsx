import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppState } from '../context/AppStateContext';
import { AiProvider } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

interface APIKeyValidation {
  openai: boolean;
  gemini: boolean;
  clipdrop: boolean;
}

// Constants
const API_KEY_PATTERNS = {
  openai: /^sk-[a-zA-Z0-9]{48}$/,
  gemini: /^AIza[a-zA-Z0-9_-]{35}$/,
  clipdrop: /^[a-zA-Z0-9]{32,}$/
};

const DEFAULT_ERROR_MESSAGE = 'An error occurred. Please try again.';
const LOADING_STATES = {
  IDLE: 'idle',
  SAVING: 'saving',
  LOADING: 'loading',
  ERROR: 'error'
} as const;

type LoadingState = typeof LOADING_STATES[keyof typeof LOADING_STATES];

const AdminPanel: React.FC<AdminPanelProps> = ({ isVisible, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'analytics' | 'settings'>('settings');
  const { 
    submissions, 
    archive,
    generateNewDay, 
    manuallySetWord, 
    triggerSummarization, 
    isSummarizing, 
    regenerateImage, 
    isRegeneratingImage, 
    currentWord,
    aiProvider,
    apiKeys,
    enableImages,
    setEnableImages,
    saveSettings,
    previousDayResults
  } = useAppState();
  
  const [manualWord, setManualWord] = useState('');
  const [localKeys, setLocalKeys] = useState(apiKeys);
  const [localProvider, setLocalProvider] = useState<AiProvider>(aiProvider);
  const [activeDropdown, setActiveDropdown] = useState<string>('ai-provider');
  const [loadingState, setLoadingState] = useState<LoadingState>(LOADING_STATES.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [apiKeyValidation, setApiKeyValidation] = useState<APIKeyValidation>({
    openai: false,
    gemini: false,
    clipdrop: false
  });

  // Reset states when panel becomes visible
  useEffect(() => {
    if (isVisible) {
      setIsAuthenticated(false);
      setUsername('');
      setPassword('');
      setAuthError('');
      const defaultKeys = {
        gemini: apiKeys.gemini || 'AIzaSyDaccjnON5RhwckcY7dSy11u1idXtF4CsU',
        openai: apiKeys.openai || '',
        clipdrop: apiKeys.clipdrop || '543eb9917c1808e62dd68d72031a704a8de6787fcb2c30e4f3f3844e83ec728d98abebe114b266798cdf6b7a2876a90b'
      };
      setLocalKeys(defaultKeys);
      setLocalProvider(aiProvider);
      setLoadingState(LOADING_STATES.IDLE);
      setErrorMessage(null);
      validateApiKeys(defaultKeys);
    }
  }, [apiKeys, aiProvider, isVisible]);

  // Validate API keys whenever they change
  const validateApiKeys = useCallback((keys: typeof apiKeys) => {
    setApiKeyValidation({
      openai: API_KEY_PATTERNS.openai.test(keys.openai),
      gemini: API_KEY_PATTERNS.gemini.test(keys.gemini),
      clipdrop: API_KEY_PATTERNS.clipdrop.test(keys.clipdrop || '')
    });
  }, []);

  useEffect(() => {
    validateApiKeys(localKeys);
  }, [localKeys, validateApiKeys]);

  // Compute whether the form can be saved
  const canSave = useMemo(() => {
    const hasValidProvider = apiKeyValidation.gemini || apiKeyValidation.openai;
    return hasValidProvider && apiKeyValidation.clipdrop && loadingState !== LOADING_STATES.SAVING;
  }, [apiKeyValidation, loadingState]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(localKeys) !== JSON.stringify(apiKeys) ||
           localProvider !== aiProvider;
  }, [localKeys, apiKeys, localProvider, aiProvider]);

  const handleSetWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualWord.trim() || loadingState === LOADING_STATES.LOADING) return;

    try {
      setLoadingState(LOADING_STATES.LOADING);
      await manuallySetWord(manualWord.trim());
      setManualWord('');
      setLoadingState(LOADING_STATES.IDLE);
    } catch (error) {
      console.error('Error setting word:', error);
      setLoadingState(LOADING_STATES.ERROR);
      setErrorMessage(error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE);
    }
  };

  const handleSaveSettings = async () => {
    if (!canSave || loadingState === LOADING_STATES.SAVING) return;

    try {
      setLoadingState(LOADING_STATES.SAVING);
      setErrorMessage(null);

      const success = await saveSettings({ 
        provider: localProvider, 
        keys: localKeys 
      });

      if (success) {
        localStorage.setItem('defaultAiProvider', localProvider);
        setLoadingState(LOADING_STATES.IDLE);
        onClose();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setLoadingState(LOADING_STATES.ERROR);
      setErrorMessage(error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE);
    }
  };

  const handleGenerateNewDay = async () => {
    if (loadingState === LOADING_STATES.LOADING) return;
    if (!window.confirm('Generate a new word? This will archive the current word.')) return;

    try {
      setLoadingState(LOADING_STATES.LOADING);
      setErrorMessage(null);
      const today = new Date().toISOString().split('T')[0];
      localStorage.removeItem(`wordData_${today}`);
      localStorage.removeItem('currentWord');
      await generateNewDay();
      window.location.reload();
    } catch (error) {
      console.error('Error generating new day:', error);
      setLoadingState(LOADING_STATES.ERROR);
      setErrorMessage(error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE);
    }
  };

  const handleRegenerateImage = async () => {
    if (isRegeneratingImage || !currentWord || loadingState === LOADING_STATES.LOADING) return;

    try {
      setLoadingState(LOADING_STATES.LOADING);
      setErrorMessage(null);
      await regenerateImage();
      setLoadingState(LOADING_STATES.IDLE);
    } catch (error) {
      console.error('Error regenerating image:', error);
      setLoadingState(LOADING_STATES.ERROR);
      setErrorMessage(error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE);
    }
  };

  const handleSummarize = async () => {
    if (isSummarizing || submissions.length === 0 || loadingState === LOADING_STATES.LOADING) return;

    try {
      setLoadingState(LOADING_STATES.LOADING);
      setErrorMessage(null);
      await triggerSummarization();
      setLoadingState(LOADING_STATES.IDLE);
    } catch (error) {
      console.error('Error summarizing submissions:', error);
      setLoadingState(LOADING_STATES.ERROR);
      setErrorMessage(error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE);
    }
  };

  const toggleDropdown = useCallback((id: string) => {
    setActiveDropdown(prev => prev === id ? '' : id);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = username.trim();
    const pass = password.trim();
    if (user === 'admin6622' && pass === 'admin6633') {
      setIsAuthenticated(true);
      setAuthError('');
      setUsername('');
      setPassword('');
    } else {
      setAuthError('Invalid credentials');
    }
  };

  if (!isVisible) return null;

  if (!isAuthenticated && isVisible) {
    return (
      <AnimatePresence>
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
          
          <motion.div 
            className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
              <p className="text-sm text-gray-500 mt-2">Enter credentials to access dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter username"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter password"
                />
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {authError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Login
              </button>
            </form>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} style={{ pointerEvents: 'auto' }} />
        
        <motion.div 
          className={`relative w-full max-w-6xl max-h-[90vh] flex flex-col rounded-3xl shadow-2xl ${
            isDarkMode ? 'bg-gray-900/90' : 'bg-white/90'
          } backdrop-blur-xl border border-white/20`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? 'border-gray-700/50 bg-gray-800/50' : 'border-gray-200/50 bg-white/50'
          } backdrop-blur-sm`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <button 
                onClick={onClose}
                className={`p-2 rounded-xl transition-colors ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`flex border-b ${
            isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
          }`}>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-purple-500 text-purple-600'
                  : isDarkMode
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-600'
                  : isDarkMode
                  ? 'border-transparent text-gray-400 hover:text-gray-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div 
              className={`mx-6 mt-4 p-4 rounded-xl border ${
                isDarkMode ? 'bg-red-900/20 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
              }`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{errorMessage}</span>
              </div>
            </motion.div>
          )}

          {/* Content */}
          <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            {activeTab === 'settings' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Provider Settings */}
                <motion.div
                  className={`p-4 sm:p-6 rounded-xl border ${
                    isDarkMode ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white border-gray-200'
                  } shadow-sm`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-600'
                    }`}>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Providers</h4>
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>API Configuration</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4 sm:mb-6">
                    {['openai', 'gemini'].map((provider) => (
                      <button
                        key={provider}
                        onClick={() => setLocalProvider(provider as AiProvider)}
                        className={`flex-1 p-2 sm:p-3 text-sm rounded-lg sm:rounded-xl font-medium transition-all ${
                          localProvider === provider
                            ? isDarkMode ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-300'
                            : isDarkMode
                            ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-gray-600'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200'
                        }`}
                      >
                        {provider === 'openai' ? 'OpenAI' : 'Gemini'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Gemini API Key
                      </label>
                      <input
                        type="text"
                        value={localKeys.gemini}
                        onChange={(e) => setLocalKeys(prev => ({ ...prev, gemini: e.target.value }))}
                        placeholder="Enter Gemini API key"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg sm:rounded-xl border transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <div className={`absolute right-2 sm:right-3 top-8 sm:top-10 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        apiKeyValidation.gemini ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                    </div>

                    <div className="relative">
                      <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        OpenAI API Key (Optional)
                      </label>
                      <input
                        type="text"
                        value={localKeys.openai}
                        onChange={(e) => setLocalKeys(prev => ({ ...prev, openai: e.target.value }))}
                        placeholder="Enter OpenAI API key"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg sm:rounded-xl border transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      {localKeys.openai && (
                        <div className={`absolute right-2 sm:right-3 top-8 sm:top-10 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                          apiKeyValidation.openai ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                      )}
                    </div>

                    <div className="relative">
                      <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        ClipDrop API Key (Image Generation)
                      </label>
                      <input
                        type="text"
                        value={localKeys.clipdrop}
                        onChange={(e) => setLocalKeys(prev => ({ ...prev, clipdrop: e.target.value }))}
                        placeholder="Enter ClipDrop API key"
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg sm:rounded-xl border transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                      />
                      <div className={`absolute right-2 sm:right-3 top-8 sm:top-10 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                        apiKeyValidation.clipdrop ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <p className={`text-xs mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        Required for automatic image generation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 sm:mt-6 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-50 to-blue-50">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>Enable Images</span>
                    <button
                      onClick={() => setEnableImages(!enableImages)}
                      className={`relative w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${
                        enableImages ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full top-0.5 transition-transform ${
                        enableImages ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </motion.div>
                
                {/* Quick Actions */}
                <motion.div
                  className={`p-4 sm:p-6 rounded-xl border ${
                    isDarkMode ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white border-gray-200'
                  } shadow-sm`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-600'
                    }`}>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Actions</h4>
                      <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>System Operations</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <form onSubmit={handleSetWord} className="space-y-2 sm:space-y-3">
                      <input
                        type="text"
                        value={manualWord}
                        onChange={(e) => setManualWord(e.target.value)}
                        placeholder="Set custom word..."
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm rounded-lg sm:rounded-xl border transition-colors ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-green-500`}
                      />
                      <button
                        type="submit"
                        disabled={!manualWord.trim()}
                        className={`w-full py-2 sm:py-3 text-sm font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                          isDarkMode ? 'bg-green-600/80 hover:bg-green-600 text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Set Word
                      </button>
                    </form>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <button
                        onClick={handleRegenerateImage}
                        disabled={!currentWord || isRegeneratingImage}
                        className={`py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                          isDarkMode ? 'bg-blue-600/80 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        New Image
                      </button>
                      
                      <button
                        onClick={handleGenerateNewDay}
                        disabled={loadingState === LOADING_STATES.LOADING}
                        className={`py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                          isDarkMode ? 'bg-purple-600/80 hover:bg-purple-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        New Day
                      </button>
                    </div>

                    <button
                      onClick={handleSummarize}
                      disabled={submissions.length === 0 || isSummarizing}
                      className={`w-full py-2 sm:py-3 text-sm font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                        isDarkMode ? 'bg-orange-600/80 hover:bg-orange-600 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {isSummarizing ? 'Summarizing...' : `Summarize (${submissions.length})`}
                    </button>
                  </div>
                </motion.div>

                {currentWord && (
                  <motion.div
                    className={`p-4 sm:p-6 rounded-xl border lg:col-span-2 ${
                      isDarkMode ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white border-gray-200'
                    } shadow-sm`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                        isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className={`text-sm sm:text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Current Word: {currentWord.word}</h4>
                        <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI Generated Meaning</p>
                      </div>
                    </div>
                    <div className={`p-3 sm:p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <p className={`text-xs sm:text-sm italic ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {(archive && archive.find(a => a.word === currentWord.word)?.winningDefinitions?.[0]) || (previousDayResults?.winningDefinitions?.[0]) || 'No AI meaning generated yet. Click "Summarize" to generate meanings from submissions.'}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { label: 'Words', value: archive.length, icon: '📝', color: isDarkMode ? 'bg-slate-700 text-blue-300' : 'bg-blue-50 text-blue-700 border-blue-200' },
                    { label: 'Submissions', value: submissions.length, icon: '💭', color: isDarkMode ? 'bg-slate-700 text-purple-300' : 'bg-purple-50 text-purple-700 border-purple-200' },
                    { label: 'Images', value: currentWord?.image ? 1 : 0, icon: '🎨', color: isDarkMode ? 'bg-slate-700 text-green-300' : 'bg-green-50 text-green-700 border-green-200' },
                    { label: 'API Calls', value: '12', icon: '⚡', color: isDarkMode ? 'bg-slate-700 text-orange-300' : 'bg-orange-50 text-orange-700 border-orange-200' }
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      className={`p-3 sm:p-4 rounded-xl ${stat.color} ${isDarkMode ? '' : 'border'} shadow-sm`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className="text-lg sm:text-xl mb-1">{stat.icon}</div>
                      <div className="text-lg sm:text-xl font-bold">{stat.value}</div>
                      <div className="text-xs opacity-75 truncate">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
                {/* Analytics */}
                <motion.div
                  className={`p-6 rounded-xl border ${
                    isDarkMode ? 'bg-gray-800/30 border-gray-700/30' : 'bg-white border-gray-200'
                  } shadow-sm`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDarkMode ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-600'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>System Stats</h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Usage & Performance</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Daily Usage</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>75%</span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <div className={`w-3/4 h-2 rounded-full ${
                          isDarkMode ? 'bg-purple-400' : 'bg-purple-500'
                        }`}></div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Response Time</span>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1.2s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Optimal</span>
                      </div>
                    </div>

                    {currentWord && (
                      <div className={`p-4 rounded-xl border-2 border-dashed ${
                        isDarkMode ? 'border-gray-600 bg-gray-700/30' : 'border-gray-300 bg-gray-50/50'
                      }`}>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {currentWord.word}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Current Word
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </div>


          {/* Sticky Footer */}
          <div className={`flex-shrink-0 p-6 border-t backdrop-blur-sm ${
            isDarkMode ? 'border-gray-700/50 bg-gray-800/80' : 'border-gray-200/50 bg-white/80'
          }`}>
            <div className="flex items-center justify-between mb-3">
              {hasUnsavedChanges && (
                <motion.div 
                  className="flex items-center gap-2 text-amber-500"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Unsaved changes</span>
                </motion.div>
              )}
              <div className={`text-xs ml-auto ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Updated {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
            
            <button
              onClick={() => {
                handleSaveSettings();
                setLastUpdated(new Date());
              }}
              disabled={!canSave || loadingState === LOADING_STATES.SAVING || !hasUnsavedChanges}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none shadow-2xl flex items-center justify-center gap-3"
            >
              {loadingState === LOADING_STATES.SAVING ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-b-transparent" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminPanel;