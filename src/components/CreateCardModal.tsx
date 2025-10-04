import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateCardModalProps {
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
}

export const CreateCardModal: React.FC<CreateCardModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), description.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Add Card</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="cardTitle" className="block text-sm font-medium text-gray-200 mb-2">
              Title *
            </label>
            <input
              id="cardTitle"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title"
              minLength={3}
              maxLength={100}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
              autoFocus
              autoComplete='off'
            />
          </div>

          <div className="mb-6">
            <label htmlFor="cardDescription" className="block text-sm font-medium text-gray-200 mb-2">
              Description
            </label>
            <textarea
              id="cardDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter card description"
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-200 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors border border-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-md hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};