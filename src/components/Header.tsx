import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trello, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export function Header({
  showBackButton = false,
  onBack
}: HeaderProps): React.ReactElement {
  const { userId, logout } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  function handleBack() {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  }

  function handleCopyUserId() {
    if (userId) {
      navigator.clipboard.writeText(userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Back button */}
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="text-gray-400 hover:bg-slate-700 p-2 rounded-lg transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="flex items-center space-x-3">
            <Trello className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-100">Trecco</h1>
          </div>
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center space-x-4">
          <div
            className="relative flex items-center space-x-2 text-sm text-gray-400 cursor-pointer hover:text-gray-200 transition-colors"
            onClick={handleCopyUserId}
            title="Click to copy User ID"
          >
            <User className="h-4 w-4" />
            <span>User: {userId?.substring(0, 8)}...</span>

            {copied && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-700 text-green-100 text-xs px-2 py-1 rounded shadow">
                Copied!
              </span>
            )}
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-400 hover:text-gray-100 transition-colors hover:bg-slate-700 rounded-lg"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
