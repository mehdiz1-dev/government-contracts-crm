// src/app/(dashboard)/contracts/create/page.tsx
'use client'; // This is a client component for form handling

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define the contract status and payment type options as enums for dropdowns
const contractStatusOptions = ['procurement', 'clearing_customs', 'delivered'];
const paymentTypeOptions = ['wire', 'traite', 'check'];
// For the 'Moins Disant' boolean, we'll use a checkbox.

export default function CreateContractPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    bc_date: '',
    delivery_deadline_date: '',
    contract_number: '',
    tuneps_number: '',
    client_id: '', // Placeholder, will be linked to actual client IDs later
    contract_status: contractStatusOptions[0], // Default to first option
    is_moins_disant: false,
    payment_type: paymentTypeOptions[0], // Default to first option
    contract_value: '', // Stored as string for input, convert to number on submit
    description: '',
    assigned_user_id: '', // Placeholder, will be linked to actual user IDs later
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic client-side validation
    if (!formData.contract_number || !formData.client_id || !formData.contract_status || !formData.payment_type) {
      setError('Please fill in all required fields: Contract Number, Client ID, Status, Payment Type.');
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

      const response = await fetch('/api/contracts', { // POST request to your API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractDataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to create contract. Please try again.');
      } else {
        setSuccess('Contract added successfully!');
        // Optionally, reset form or redirect
        setFormData({ // Reset form to initial state
          bc_date: '',
          delivery_deadline_date: '',
          contract_number: '',
          tuneps_number: '',
          client_id: '',
          contract_status: contractStatusOptions[0],
          is_moins_disant: false,
          payment_type: paymentTypeOptions[0],
          contract_value: '',
          description: '',
          assigned_user_id: '',
        });
        router.push('/contracts'); // Redirect back to contracts list
      }
    } catch (err: any) {
      console.error('Client-side error creating contract:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Add New Contract</h1>
      <div className="bg-white p-6 rounded shadow-md">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: BC Date, Delivery Deadline Date */}
          <div>
            <label htmlFor="bc_date" className="block text-gray-700 text-sm font-bold mb-2">BC Date</label>
            <input type="date" id="bc_date" name="bc_date" value={formData.bc_date || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>
          <div>
            <label htmlFor="delivery_deadline_date" className="block text-gray-700 text-sm font-bold mb-2">Delivery Deadline Date</label>
            <input type="date" id="delivery_deadline_date" name="delivery_deadline_date" value={formData.delivery_deadline_date || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Row 2: Contract Number, TUNEPS Number */}
          <div>
            <label htmlFor="contract_number" className="block text-gray-700 text-sm font-bold mb-2">Contract Number <span className="text-red-500">*</span></label>
            <input type="text" id="contract_number" name="contract_number" value={formData.contract_number} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>
          <div>
            <label htmlFor="tuneps_number" className="block text-gray-700 text-sm font-bold mb-2">TUNEPS Number</label>
            <input type="text" id="tuneps_number" name="tuneps_number" value={formData.tuneps_number || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Row 3: Client ID, Assigned User ID (placeholders for now) */}
          <div>
            <label htmlFor="client_id" className="block text-gray-700 text-sm font-bold mb-2">Client ID <span className="text-red-500">*</span></label>
            <input type="text" id="client_id" name="client_id" value={formData.client_id} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., a client UUID" />
          </div>
          <div>
            <label htmlFor="assigned_user_id" className="block text-gray-700 text-sm font-bold mb-2">Assigned User ID</label>
            <input type="text" id="assigned_user_id" name="assigned_user_id" value={formData.assigned_user_id || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., a user UUID" />
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
            <input type="number" id="contract_value" name="contract_value" value={formData.contract_value || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" step="0.01" />
          </div>
          <div className="flex items-center mt-6">
            <input type="checkbox" id="is_moins_disant" name="is_moins_disant" checked={formData.is_moins_disant} onChange={handleChange} className="mr-2 leading-tight" />
            <label htmlFor="is_moins_disant" className="text-gray-700 text-sm">Is Moins Disant?</label>
          </div>

          {/* Row 6: Description */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="shadow border rounded w-full py-2 px-3 text-gray-700"></textarea>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4">
            <Link href="/contracts" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center">
              {loading ? 'Adding...' : 'Add Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}