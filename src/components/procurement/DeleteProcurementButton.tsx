// src/components/procurement/DeleteProcurementButton.tsx
'use client'; // This is a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteProcurementButtonProps {
  stepId: string;
  stepName: string; // To display in the confirmation dialog
  contractNumber: string; // To display in the confirmation dialog
}

export default function DeleteProcurementButton({ stepId, stepName, contractNumber }: DeleteProcurementButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete step "<span class="math-inline">\{stepName\}" for Contract \#</span>{contractNumber} (ID: ${stepId})? This action cannot be undone.`)) {
      return; // User cancelled
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/procurement/${stepId}`, { // DELETE request to API
        method: 'DELETE',
      });

      if (!response.ok) {
        // Added safety check for JSON parsing (similar to other delete buttons)
        let errorMessage = 'Failed to delete procurement step. Please try again.';
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
            console.error('Failed to parse error response for procurement step delete:', parseError);
        }
        setError(errorMessage);
      } else {
        console.log(`Procurement step "${stepName}" (ID: ${stepId}) deleted successfully.`);
        router.push('/procurement'); // Redirect back to procurement list after deletion
      }
    } catch (err: any) {
      console.error('Client-side error deleting procurement step:', err);
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
        {loading ? 'Deleting...' : 'Delete Step'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  );
}