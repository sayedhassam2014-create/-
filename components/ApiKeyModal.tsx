
import React, { useState } from 'react';

interface ApiKeyModalProps {
  onKeySubmit: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      onKeySubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex justify-center items-center animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 m-4 max-w-md w-full text-center transform transition-all animate-fade-in-up">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Enter Your API Key</h2>
        <p className="text-gray-600 mb-6">
          To use the AI features of this application, please provide your Google Gemini API key.
        </p>
        <div className="space-y-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full text-center p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            placeholder="Enter your Gemini API Key here"
            aria-label="Gemini API Key Input"
          />
          <button
            onClick={handleSaveKey}
            disabled={!apiKey.trim()}
            className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save and Continue
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Your key is saved securely in your browser's local storage and is never sent anywhere else.
        </p>
      </div>
    </div>
  );
};

export default ApiKeyModal;