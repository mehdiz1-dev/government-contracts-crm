// src/app/(dashboard)/procurement/[id]/edit/page.tsx
'use client'; // This is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Hook to get dynamic route parameters

// Define a type for a ProcurementStep (from your schema.prisma)
interface ProcurementStep {
  id: string;
  contract_id: string; // UUID
  step_name: string;
  step_description: string | null;
  status: string; // ENUM type string
  due_date: string | null; // Date string for input
  completed_at: Date | null;
  assigned_to_user_id: string | null; // UUID
  created_at: Date | null;
  updated_at: Date | null;
}

// Define the procurement step status options
const procurementStatusOptions = ['pending', 'in_progress', 'completed', 'blocked'];

export default function EditProcurementPage() {
  const router = useRouter();
  const params = useParams();
  const stepId = params.id as string;

  const [formData, setFormData] = useState<Omit<ProcurementStep, 'created_at' | 'updated_at' | 'completed_at'> | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null); // For fetching error
  const [submitError, setSubmitError] = useState<string | null>(null); // For form submission error
  const [success, setSuccess] = useState<string | null>(null);

  // Effect to fetch procurement step data when the page loads
  useEffect(() => {
    if (!stepId) {
      setPageError("Procurement Step ID is missing.");
      return;
    }

    const fetchProcurementStep = async () => {
      setLoading(true);
      setPageError(null);
      try {
        const response = await fetch(`/api/procurement/${stepId}`); // GET request to API
        const data = await response.json();

        if (!response.ok) {
          setPageError(data.message || 'Failed to fetch procurement step details.');
          return;
        }

        // Convert Date objects to YYYY-MM-DD strings for date inputs
        setFormData({
          id: data.id,
          step_name: data.step_name,
          contract_id: data.contract_id,
          step_description: data.step_description || '',
          status: data.status,
          due_date: data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : '',
          assigned_to_user_id: data.assigned_to_user_id || '',
        });

      } catch (err: any) {
        console.error('Client-side error fetching procurement step:', err);
        setPageError(err.message || 'An unexpected error occurred while loading step data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProcurementStep();
  }, [stepId]); // Re-run if stepId changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...(prev as Omit<ProcurementStep, 'created_at' | 'updated_at' | 'completed_at'>),
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    setSubmitError(null);
    setSuccess(null);

    // Basic client-side validation
    if (!formData.step_name || !formData.contract_id || !formData.status) {
      setSubmitError('Step Name, Contract ID, and Status are required.');
      setLoading(false);
      return;
    }

    try {
      const stepDataToSend = {
        ...formData,
        // Convert due_date string to ISO format if it exists
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
      };

      const response = await fetch(`/api/procurement/${stepId}`, { // PUT request to API route
        method: 'PUT', // or PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepDataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.message || 'Failed to update procurement step. Please try again.');
      } else {
        setSuccess('Procurement step updated successfully!');
        router.push('/procurement'); // Redirect back to procurement list
      }
    } catch (err: any) {
      console.error('Client-side error updating procurement step:', err);
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData) {
    return <div className="p-8 text-center text-gray-600">Loading procurement step details...</div>;
  }

  if (pageError) {
    return (
      <div className="p-8 text-center text-red-700">
        <h1 className="text-3xl font-bold mb-4">Error Loading Procurement Step</h1>
        <p>{pageError}</p>
        <Link href="/procurement" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Back to Procurement List
        </Link>
      </div>
    );
  }

  if (!formData) {
    return <div className="p-8 text-center text-gray-600">No procurement step data found.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Procurement Step: {formData.step_name}</h1>
      <div className="bg-white p-6 rounded shadow-md">
        {submitError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{submitError}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Step Name */}
          <div>
            <label htmlFor="step_name" className="block text-gray-700 text-sm font-bold mb-2">Step Name <span className="text-red-500">*</span></label>
            <input type="text" id="step_name" name="step_name" value={formData.step_name} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Row 2: Contract ID (read-only if it's the primary identifier, editable otherwise) */}
          <div>
            <label htmlFor="contract_id" className="block text-gray-700 text-sm font-bold mb-2">Contract ID <span className="text-red-500">*</span></label>
            <input type="text" id="contract_id" name="contract_id" value={formData.contract_id} readOnly className="shadow border rounded w-full py-2 px-3 text-gray-700 bg-gray-50 cursor-not-allowed" /> {/* Read-only */}
          </div>

          {/* Row 3: Status */}
          <div>
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status <span className="text-red-500">*</span></label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700">
              {procurementStatusOptions.map(option => (
                <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Row 4: Due Date */}
          <div>
            <label htmlFor="due_date" className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
            <input type="date" id="due_date" name="due_date" value={formData.due_date || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Row 5: Assigned User ID */}
          <div className="md:col-span-2">
            <label htmlFor="assigned_to_user_id" className="block text-gray-700 text-sm font-bold mb-2">Assigned User ID</label>
            <input type="text" id="assigned_to_user_id" name="assigned_to_user_id" value={formData.assigned_to_user_id || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., UUID of an existing user" />
          </div>

          {/* Row 6: Step Description (full width) */}
          <div className="md:col-span-2">
            <label htmlFor="step_description" className="block text-gray-700 text-sm font-bold mb-2">Step Description</label>
            <textarea id="step_description" name="step_description" value={formData.step_description} onChange={handleChange} rows={3} className="shadow border rounded w-full py-2 px-3 text-gray-700"></textarea>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4">
            <Link href="/procurement" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center">
              {loading ? 'Updating...' : 'Update Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}