'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

const TaskStatus = {
  TODO: 0,
  IN_PROGRESS: 1,
  DONE: 2,
} as const;

type TaskStatusType = (typeof TaskStatus)[keyof typeof TaskStatus];

interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatusType;
  createdAt: string;
}

interface Board {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  tasks: Task[];
}

const BoardDetails = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO as TaskStatusType,
  });
  const [creatingTask, setCreatingTask] = useState(false);
  const params = useParams();
  const boardId = Array.isArray(params?.id) ? params.id[0] : params.id;
  const router = useRouter();

  useEffect(() => {
    if (!boardId) {
      setError('Board ID is missing');
      setLoading(false);
      return;
    }

    const fetchBoard = async () => {
      try {
        const res = await fetch(`/api/board/${boardId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch board');
        }
        const data = await res.json();
        setBoard(data.board);
      } catch {
        setError('Could not load board details');
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTask(true);

    try {
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTask,
          boardId: parseInt(boardId as string, 10),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create task');
      }

      const data = await res.json();
      setBoard((prevBoard) =>
        prevBoard
          ? { ...prevBoard, tasks: [...prevBoard.tasks, data.task] }
          : null
      );
      setNewTask({ title: '', description: '', status: TaskStatus.TODO });
    } catch {
      setError('Could not create task');
    } finally {
      setCreatingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      const res = await fetch(`/api/task/${taskId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete task');
      }

      setBoard((prevBoard) =>
        prevBoard
          ? {
              ...prevBoard,
              tasks: prevBoard.tasks.filter((task) => task.id !== taskId),
            }
          : null
      );
    } catch {
      setError('Could not delete task');
    }
  };

  const handleStatusChange = async (
    taskId: number,
    newStatus: TaskStatusType
  ) => {
    if (newStatus === board?.tasks.find((task) => task.id === taskId)?.status) {
      return;
    }

    try {
      const res = await fetch(`/api/task/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update task status');
      }

      setBoard((prevBoard) =>
        prevBoard
          ? {
              ...prevBoard,
              tasks: prevBoard.tasks.map((task) =>
                task.id === taskId ? { ...task, status: newStatus } : task
              ),
            }
          : null
      );
    } catch {
      setError('Could not update task status');
    }
  };

  const handleDeleteBoard = async () => {
    if (!boardId) return;

    try {
      const res = await fetch(`/api/board/${boardId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete board');
      }
      router.push('/');
    } catch {
      setError('Could not delete board');
    }
  };

  const renderTasks = (status: TaskStatusType) =>
    board?.tasks
      .filter((task) => task.status === status)
      .map((task) => (
        <div
          key={task.id}
          className="relative p-4 bg-white rounded-lg shadow mt-4"
        >
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            X
          </button>
          <h3 className="text-lg font-bold">{task.title}</h3>
          <p>{task.description}</p>
          <div className="mt-2">
            <select
              defaultValue=""
              onChange={(e) =>
                handleStatusChange(
                  task.id,
                  parseInt(e.target.value, 10) as TaskStatusType
                )
              }
              className="w-full border px-2 py-1 rounded bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Move to...
              </option>
              {Object.entries(TaskStatus)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([key, value]) => value !== task.status)
                .map(([key, value]) => (
                  <option key={value} value={value}>
                    {key.replace('_', ' ')}
                  </option>
                ))}
            </select>
          </div>
        </div>
      ));

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!board) {
    return <p>No board found.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-blue-500">
          Back
        </button>
        <h1 className="text-3xl font-semibold">{board.name}</h1>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleDeleteBoard}
        >
          Delete
        </button>
      </div>
      <p className="mb-4">{board.description}</p>
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 gap-4">
          <div>
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full border px-2 py-1 rounded"
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
              className="w-full border px-2 py-1 rounded"
              required
            />
          </div>
          <div>
            <select
              value={newTask.status}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  status: parseInt(e.target.value, 10) as TaskStatusType,
                })
              }
              className="w-full border px-2 py-1 rounded"
            >
              <option value={TaskStatus.TODO}>To Do</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.DONE}>Done</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded"
            disabled={creatingTask}
          >
            {creatingTask ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div>
          <h2 className="text-xl font-bold mb-2">To Do</h2>
          {renderTasks(TaskStatus.TODO)}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">In Progress</h2>
          {renderTasks(TaskStatus.IN_PROGRESS)}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Done</h2>
          {renderTasks(TaskStatus.DONE)}
        </div>
      </div>
    </div>
  );
};

export default BoardDetails;
