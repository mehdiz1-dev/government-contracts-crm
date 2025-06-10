// src/app/(dashboard)/contracts/[id]/edit/page.tsx
'use client'; // This is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Hook to get dynamic route parameters

// Define type for Contract (should match the one in contracts/page.tsx)
interface Contract {
  id: string;
  bc_date: string | null; // Keep as string for date input
  delivery_deadline_date: string | null; // Keep as string for date input
  contract_number: string;
  tuneps_number: string | null;
  client_id: string;
  contract_status: string;
  is_moins_disant: boolean;
  payment_type: string;
  contract_value: string | null; // Keep as string for number input
  description: string | null;
  assigned_user_id: string | null;
}

// Define the contract status and payment type options (should match create page)
const contractStatusOptions = ['procurement', 'clearing_customs', 'delivered'];
const paymentTypeOptions = ['wire', 'traite', 'check'];

export default function EditContractPage() {
  const router = useRouter();
  const params = useParams(); // Get the ID from the URL
  const contractId = params.id as string;

  const [formData, setFormData] = useState<Omit<Contract, 'created_at' | 'updated_at'> | null>(null); // Omit date objects initially
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null); // For fetching error
  const [submitError, setSubmitError] = useState<string | null>(null); // For form submission error
  const [success, setSuccess] = useState<string | null>(null);

  // Effect to fetch contract data when the page loads
  useEffect(() => {
    if (!contractId) {
      setPageError("Contract ID is missing.");
      return;
    }

    const fetchContract = async () => {
      setLoading(true);
      setPageError(null);
      try {
        const response = await fetch(`/api/contracts/${contractId}`); // GET request to API
        const data = await response.json();

        if (!response.ok) {
          setPageError(data.message || 'Failed to fetch contract details.');
          return;
        }

        // Convert Date objects to YYYY-MM-DD strings for date inputs
        setFormData({
          id: data.id,
          name: data.name, // Ensure this exists if not directly from DB for some reason
          contract_number: data.contract_number,
          tuneps_number: data.tuneps_number || '', // Corrected for null
          client_id: data.client_id,
          contract_status: data.contract_status,
          is_moins_disant: data.is_moins_disant,
          payment_type: data.payment_type,
          contract_value: data.contract_value !== null ? String(data.contract_value) : '', // Corrected for null/number
          description: data.description || '', // Corrected for null
          assigned_user_id: data.assigned_user_id || '', // Corrected for null
          bc_date: data.bc_date ? new Date(data.bc_date).toISOString().split('T')[0] : '', // Corrected for null
          delivery_deadline_date: data.delivery_deadline_date ? new Date(data.delivery_deadline_date).toISOString().split('T')[0] : '', // Corrected for null
        });

      } catch (err: any) {
        console.error('Client-side error fetching contract:', err);
        setPageError(err.message || 'An unexpected error occurred while loading contract data.');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]); // Re-run if contractId changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...(prev as Contract), // Cast prev to Contract
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormFormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    setSubmitError(null);
    setSuccess(null);

    // Basic client-side validation
    if (!formData.contract_number || !formData.client_id || !formData.contract_status || !formData.payment_type) {
      setSubmitError('Please fill in all required fields: Contract Number, Client ID, Status, Payment Type.');
      setLoading(false);
      return;
    }

    try {
      const contractDataToSend = {
        ...formData,
        // Convert date strings to ISO format if they exist
        bc_date: formData.bc_date ? new Date(formData.bc_date).toISOString() : null,
        delivery_deadline_date: formData.delivery_deadline_date ? new Date(formData.delivery_deadline_date).toISOString() : null,
        // Convert contract_value to a number safely:
        contract_value: (formData.contract_value !== null && formData.contract_value !== '')
                        ? parseFloat(formData.contract_value)
                        : null, // <--- CORRECTED FIX
      };

      const response = await fetch(`/api/contracts/${contractId}`, { // PUT request to API route
        method: 'PUT', // or PATCH depending on your API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractDataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.message || 'Failed to update contract. Please try again.');
      } else {
        setSuccess('Contract updated successfully!');
        router.push('/contracts'); // Redirect back to contracts list
      }
    } catch (err: any) {
      console.error('Client-side error updating contract:', err);
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData) {
    return <div className="p-8 text-center text-gray-600">Loading contract details...</div>;
  }

  if (pageError) {
    return (
      <div className="p-8 text-center text-red-700">
        <h1 className="text-3xl font-bold mb-4">Error Loading Contract</h1>
        <p>{pageError}</p>
        <Link href="/contracts" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Back to Contracts
        </Link>
      </div>
    );
  }

  if (!formData) {
    return <div className="p-8 text-center text-gray-600">No contract data found.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Contract: {formData.contract_number}</h1>
      <div className="bg-white p-6 rounded shadow-md">
        {submitError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{submitError}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form fields (similar to CreateContractPage, pre-populated with formData) */}
          {/* Row 1: BC Date, Delivery Deadline Date */}
          <div>
            <label htmlFor="bc_date" className="block text-gray-700 text-sm font-bold mb-2">BC Date</label>
            <input type="date" id="bc_date" name="bc_date" value={formData.bc_date || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" /> {/* Corrected for null */}
          </div>
          <div>
            <label htmlFor="delivery_deadline_date" className="block text-gray-700 text-sm font-bold mb-2">Delivery Deadline Date</label>
            <input type="date" id="delivery_deadline_date" name="delivery_deadline_date" value={formData.delivery_deadline_date || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" /> {/* Corrected for null */}
          </div>

          {/* Row 2: Contract Number (read-only), TUNEPS Number */}
          <div>
            <label htmlFor="contract_number" className="block text-gray-700 text-sm font-bold mb-2">Contract Number <span className="text-red-500">*</span></label>
            <input type="text" id="contract_number" name="contract_number" value={formData.contract_number} readOnly className="shadow border rounded w-full py-2 px-3 text-gray-700 bg-gray-50 cursor-not-allowed" /> {/* Read-only */}
          </div>
          <div>
            <label htmlFor="tuneps_number" className="block text-gray-700 text-sm font-bold mb-2">TUNEPS Number</label>
            <input type="text" id="tuneps_number" name="tuneps_number" value={formData.tuneps_number || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" /> {/* Corrected for null */}
          </div>

          {/* Row 3: Client ID, Assigned User ID (placeholders for now) */}
          <div>
            <label htmlFor="client_id" className="block text-gray-700 text-sm font-bold mb-2">Client ID <span className="text-red-500">*</span></label>
            <input type="text" id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., a client UUID" />
          </div>
          <div>
            <label htmlFor="assigned_user_id" className="block text-gray-700 text-sm font-bold mb-2">Assigned User ID</label>
            <input type="text" id="assigned_user_id" name="assigned_user_id" value={formData.assigned_user_id || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., a user UUID" /> {/* Corrected for null */}
          </div>

          {/* Row 4: Contract Status, Payment Type */}
          <div>
            <label htmlFor="contract_status" className="block text-gray-700 text-sm font-bold mb-2">Contract Status <span className="text-red-500">*</span></label>
            <select id="contract_status" name="contract_status" value={formData.contract_status} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700">
              {contractStatusOptions.map(option => (
                <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="payment_type" className="block text-gray-700 text-sm font-bold mb-2">Payment Type <span className="text-red-500">*</span></label>
            <select id="payment_type" name="payment_type" value={formData.payment_type} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700">
              {paymentTypeOptions.map(option => (
                <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Row 5: Contract Value, Is Moins Disant */}
          <div>
            <label htmlFor="contract_value" className="block text-gray-700 text-sm font-bold mb-2">Contract Value</label>
            <input type="number" id="contract_value" name="contract_value" value={formData.contract_value || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" step="0.01" /> {/* Corrected for null */}
          </div>
          <div className="flex items-center mt-6">
            <input type="checkbox" id="is_moins_disant" name="is_moins_disant" checked={formData.is_moins_disant} onChange={handleChange} className="mr-2 leading-tight" />
            <label htmlFor="is_moins_disant" className="text-gray-700 text-sm">Is Moins Disant?</label>
          </div>

          {/* Row 6: Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="shadow border rounded w-full py-2 px-3 text-gray-700"></textarea> {/* Corrected for null */}
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4">
            <Link href="/contracts" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center">
              {loading ? 'Updating...' : 'Update Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}