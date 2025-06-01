// src/app/(dashboard)/tasks/create/page.tsx
'use client'; // This is a client component for form handling

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define the task priority and status options as enums for dropdowns
const taskPriorityOptions = ['low', 'medium', 'high'];
const taskStatusOptions = ['to_do', 'in_progress', 'completed'];

export default function CreateTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '', // Date string
    priority: taskPriorityOptions[0], // Default to first option
    status: taskStatusOptions[0], // Default to first option
    linked_contract_id: '', // Optional UUID from an existing contract
    linked_client_id: '', // Optional UUID from an existing client
    assigned_to_user_id: '', // Optional UUID from an existing user
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
    if (!formData.title || !formData.priority || !formData.status) {
      setError('Task Title, Priority, and Status are required.');
      setLoading(false);
      return;
    }

    // Ensure at least one linked record (contract or client) OR assigned user, though optional for now
    if (!formData.linked_contract_id && !formData.linked_client_id && !formData.assigned_to_user_id && formData.description === '') {
        // This is a minimal check, adjust based on how strict you want tasks to be linked
        // For now, allow tasks without explicit links if they have a description
    }

    try {
      const taskDataToSend = {
        ...formData,
        // Convert due_date string to ISO format if it exists
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        // Set linked_id to null if empty string to avoid Prisma errors with optional relations
        linked_contract_id: formData.linked_contract_id || null,
        linked_client_id: formData.linked_client_id || null,
        assigned_to_user_id: formData.assigned_to_user_id || null,
      };

      const response = await fetch('/api/tasks', { // POST request to your API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskDataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to create task. Please try again.');
      } else {
        setSuccess('Task added successfully!');
        // Optionally, reset form or redirect
        setFormData({ // Reset form to initial state
          title: '',
          description: '',
          due_date: '',
          priority: taskPriorityOptions[0],
          status: taskStatusOptions[0],
          linked_contract_id: '',
          linked_client_id: '',
          assigned_to_user_id: '',
        });
        router.push('/tasks'); // Redirect back to tasks list
      }
    } catch (err: any) {
      console.error('Client-side error creating task:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Add New Task</h1>
      <div className="bg-white p-6 rounded shadow-md">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Task Title, Due Date */}
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Task Title <span className="text-red-500">*</span></label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>
          <div>
            <label htmlFor="due_date" className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
            <input type="date" id="due_date" name="due_date" value={formData.due_date} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Row 2: Priority, Status */}
          <div>
            <label htmlFor="priority" className="block text-gray-700 text-sm font-bold mb-2">Priority <span className="text-red-500">*</span></label>
            <select id="priority" name="priority" value={formData.priority} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700">
              {taskPriorityOptions.map(option => (
                <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status <span className="text-red-500">*</span></label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700">
              {taskStatusOptions.map(option => (
                <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Row 3: Linked Contract ID, Linked Client ID (optional, but only one can be filled if strict) */}
          <div>
            <label htmlFor="linked_contract_id" className="block text-gray-700 text-sm font-bold mb-2">Linked Contract ID (Optional)</label>
            <input type="text" id="linked_contract_id" name="linked_contract_id" value={formData.linked_contract_id} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., UUID of an existing contract" />
          </div>
          <div>
            <label htmlFor="linked_client_id" className="block text-gray-700 text-sm font-bold mb-2">Linked Client ID (Optional)</label>
            <input type="text" id="linked_client_id" name="linked_client_id" value={formData.linked_client_id} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., UUID of an existing client" />
          </div>

          {/* Row 4: Assigned User ID */}
          <div className="md:col-span-2">
            <label htmlFor="assigned_to_user_id" className="block text-gray-700 text-sm font-bold mb-2">Assigned User ID (Optional)</label>
            <input type="text" id="assigned_to_user_id" name="assigned_to_user_id" value={formData.assigned_to_user_id} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., UUID of an existing user" />
          </div>

          {/* Row 5: Description (full width) */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="shadow border rounded w-full py-2 px-3 text-gray-700"></textarea>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4">
            <Link href="/tasks" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center">
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}