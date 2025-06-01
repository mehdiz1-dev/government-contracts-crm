// src/components/clients/DeleteClientButton.tsx
'use client'; // This is a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteClientButtonProps {
  clientId: string;
  clientName: string; // To display in the confirmation dialog
}

export default function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete client "${clientName}" (ID: ${clientId})? This action cannot be undone.`)) {
      return; // User cancelled
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/clients/${clientId}`, { // DELETE request to API
        method: 'DELETE',
      });

      if (!response.ok) {
        // Added safety check for JSON parsing (similar to DeleteContractButton)
        let errorMessage = 'Failed to delete client. Please try again.';
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
            console.error('Failed to parse error response for client delete:', parseError);
        }
        setError(errorMessage);
      } else {
        console.log(`Client "${clientName}" (ID: ${clientId}) deleted successfully.`);
        router.push('/clients'); // Redirect back to clients list after deletion
      }
    } catch (err: any) {
      console.error('Client-side error deleting client:', err);
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
        {loading ? 'Deleting...' : 'Delete Client'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  );
}