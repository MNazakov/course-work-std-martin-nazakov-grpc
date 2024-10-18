'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateBoard() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateBoard = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);

    const res = await fetch('/api/board/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    });

    setIsLoading(false);

    if (res.ok) {
      const data = await res.json();
      setSuccess('Board created successfully');
      setTimeout(() => router.push(`/board/${data.board.id}`), 2000);
    } else {
      const data = await res.json();
      setError(data.error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-center">Create Board</h2>
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        <div className="mb-4">
          <label className="block mb-2">Board Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border w-full p-2 rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border w-full p-2 rounded"
            required
          />
        </div>
        <button
          onClick={handleCreateBoard}
          className="bg-blue-500 text-white py-2 px-4 rounded w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Board'}
        </button>
      </div>
    </div>
  );
}
