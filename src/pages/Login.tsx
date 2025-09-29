import React, { useState } from 'react';
import { User, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login(): React.ReactElement {
  const [inputUserId, setInputUserId] = useState('');
  const { setUserId } = useAuth();

  function handleLogin() {
    if (inputUserId.trim()) {
      setUserId(inputUserId.trim());
    }
  }

  function generateUserId() {
    const newUserId = crypto.randomUUID();
    setInputUserId(newUserId);
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-900 rounded-full p-4 inline-block mb-4">
            <User className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Trecco</h1>
          <p className="text-gray-400">Enter your User ID to continue</p>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-2">
              User ID (GUID)
            </label>
            <input
              id="userId"
              type="text"
              value={inputUserId}
              onChange={(e) => setInputUserId(e.target.value)}
              placeholder="Enter your UUID or generate a new one"
              className="input-field"
            />
          </div>

          <button
            onClick={generateUserId}
            className="w-full btn-secondary"
          >
            Generate New User ID
          </button>

          <button
            onClick={handleLogin}
            disabled={!inputUserId.trim()}
            className="w-full btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};