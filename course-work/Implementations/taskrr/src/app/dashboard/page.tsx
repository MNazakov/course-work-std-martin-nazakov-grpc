'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Board {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await fetch('/api/auth/logout');
    router.push('/login');
  };

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const res = await fetch('/api/board/list');
        if (!res.ok) {
          throw new Error('Failed to fetch boards');
        }
        const data = await res.json();
        setBoards(data.boards);
      } catch {
        setError('Could not load boards');
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="flex justify-between items-center bg-white shadow p-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex space-x-4">
          <Link href="/board/create">
            <button className="py-2 px-4 bg-green-600 text-white font-medium rounded-md shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500">
              Create New Board
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-600 text-white font-medium rounded-md shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-8">
        {loading ? (
          <p>Loading boards...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : boards.length === 0 ? (
          <p>No boards available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                href={`/board/${board.id}`}
                key={board.id}
                className="block"
              >
                <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold">{board.name}</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {board.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Created on: {new Date(board.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
