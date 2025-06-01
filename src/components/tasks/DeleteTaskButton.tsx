// src/components/tasks/DeleteTaskButton.tsx
'use client'; // This is a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteTaskButtonProps {
  taskId: string;
  taskTitle: string; // To display in the confirmation dialog
}

export default function DeleteTaskButton({ taskId, taskTitle }: DeleteTaskButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete task "${taskTitle}" (ID: ${taskId})? This action cannot be undone.`)) {
      return; // User cancelled
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, { // DELETE request to API
        method: 'DELETE',
      });

      if (!response.ok) {
        // Added safety check for JSON parsing (similar to other delete buttons)
        let errorMessage = 'Failed to delete task. Please try again.';
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json') && response.status !== 204) {
                const result = await response.json();
                errorMessage = result.message || errorMessage;
            } else {
                const text = await response.text();
                errorMessage = text || errorMessage;
            }
        } catch (parseError) {
            console.error('Failed to parse error response for task delete:', parseError);
        }
        setError(errorMessage);
      } else {
        console.log(`Task "${taskTitle}" (ID: ${taskId}) deleted successfully.`);
        router.push('/tasks'); // Redirect back to tasks list after deletion
      }
    } catch (err: any) {
      console.error('Client-side error deleting task:', err);
      setError(err.message || 'An unexpected error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
      >
        {loading ? 'Deleting...' : 'Delete Task'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  );
}