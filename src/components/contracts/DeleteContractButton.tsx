// src/components/contracts/DeleteContractButton.tsx
'use client'; // This is a client component

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteContractButtonProps {
  contractId: string;
  contractNumber: string;
}

export default function DeleteContractButton({ contractId, contractNumber }: DeleteContractButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete contract ${contractNumber} (ID: ${contractId})? This action cannot be undone.`)) {
      return; // User cancelled
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contracts/${contractId}`, { // DELETE request to API
        method: 'DELETE',
      });

      if (!response.ok) {
        // --- ADDED SAFETY CHECK FOR JSON PARSING ---
        let errorMessage = 'Failed to delete contract. Please try again.';
        try {
            const contentType = response.headers.get('content-type');
            // Only attempt to parse as JSON if the content type is application/json
            // AND the status is not 204 (which implies no content)
            if (contentType && contentType.includes('application/json') && response.status !== 204) {
                const result = await response.json();
                errorMessage = result.message || errorMessage;
            } else {
                // If the response is not JSON, try to read it as plain text
                const text = await response.text();
                errorMessage = text || errorMessage;
            }
        } catch (parseError) {
            console.error('Failed to parse error response for delete:', parseError);
            // If parsing itself fails, stick with generic message
        }
        setError(errorMessage);
        // --- END ADDED SAFETY CHECK ---
      } else {
        console.log(`Contract ${contractId} deleted successfully.`);
        router.push('/contracts'); // Redirect back to contracts list after deletion
      }
    } catch (err: any) {
      console.error('Client-side error deleting contract:', err);
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
        {loading ? 'Deleting...' : 'Delete Contract'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </>
  );
}