import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-auto py-6 text-center text-gray-500">
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} EthereaLex. An AI-powered creative experiment.
        </p>
      </div>
    </footer>
  );
};

export default Footer;