// src/app/(dashboard)/procurement/create/page.tsx
'use client'; // This is a client component for form handling

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define the procurement step status options as enums for dropdowns
const procurementStatusOptions = ['pending', 'in_progress', 'completed', 'blocked'];

export default function CreateProcurementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    step_name: '',
    contract_id: '', // UUID from an existing contract
    step_description: '',
    status: procurementStatusOptions[0], // Default to first option
    due_date: '', // Date string
    assigned_to_user_id: '', // UUID from an existing user
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic client-side validation
    if (!formData.step_name || !formData.contract_id || !formData.status) {
      setError('Step Name, Contract ID, and Status are required.');
      setLoading(false);
      return;
    }

    try {
      const stepDataToSend = {
        ...formData,
        // Convert due_date string to ISO format if it exists
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        // Set optional UUIDs to null if they are empty strings
        step_description: formData.step_description || null, // Corrected for null
        assigned_to_user_id: formData.assigned_to_user_id || null, // Corrected for null
      };

      const response = await fetch('/api/procurement', { // POST request to your API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stepDataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to create procurement step. Please try again.');
      } else {
        setSuccess('Procurement step added successfully!');
        setFormData({ // Reset form to initial state
          step_name: '',
          contract_id: '',
          step_description: '',
          status: procurementStatusOptions[0],
          due_date: '',
          assigned_to_user_id: '',
        });
        router.push('/procurement'); // Redirect back to procurement list
      }
    } catch (err: any) {
      console.error('Client-side error creating procurement step:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Add New Procurement Step</h1>
      <div className="bg-white p-6 rounded shadow-md">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Step Name, Contract ID */}
          <div>
            <label htmlFor="step_name" className="block text-gray-700 text-sm font-bold mb-2">Step Name <span className="text-red-500">*</span></label>
            <input type="text" id="step_name" name="step_name" value={formData.step_name} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-7