import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ArchivePage from './pages/ArchivePage';
import Footer from './components/Footer';

function App() {
  return (
    <NotificationProvider>
      <AppStateProvider>
        <HashRouter>
        <div className="min-h-screen font-sans flex flex-col">
          <Header />
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/archive" element={<ArchivePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        </HashRouter>
      </AppStateProvider>
    </NotificationProvider>
  );
}

export default App;