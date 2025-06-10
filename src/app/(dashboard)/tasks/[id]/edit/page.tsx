// src/app/(dashboard)/tasks/[id]/edit/page.tsx
'use client'; // This is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Hook to get dynamic route parameters

// Define a type for a Task (from your schema.prisma)
interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null; // Date string for input
  assigned_to_user_id: string | null; // UUID
  priority: string; // ENUM type string
  status: string; // ENUM type string
  linked_contract_id: string | null; // UUID
  linked_client_id: string | null; // UUID
  created_at: Date | null;
  updated_at: Date | null;
}

// Define the task priority and status options
const taskPriorityOptions = ['low', 'medium', 'high'];
const taskStatusOptions = ['to_do', 'in_progress', 'completed'];

export default function EditTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [formData, setFormData] = useState<Omit<Task, 'created_at' | 'updated_at'> | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null); // For fetching error
  const [submitError, setSubmitError] = useState<string | null>(null); // For form submission error
  const [success, setSuccess] = useState<string | null>(null);

  // Effect to fetch task data when the page loads
  useEffect(() => {
    if (!taskId) {
      setPageError("Task ID is missing.");
      return;
    }

    const fetchTask = async () => {
      setLoading(true);
      setPageError(null);
      try {
        const response = await fetch(`/api/tasks/${taskId}`); // GET request to API
        const data = await response.json();

        if (!response.ok) {
          setPageError(data.message || 'Failed to fetch task details.');
          return;
        }

        // Convert Date objects to YYYY-MM-DD strings for date inputs
        setFormData({
          id: data.id,
          title: data.title,
          description: data.description || '', // Corrected for null
          due_date: data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : '', // Corrected for null
          assigned_to_user_id: data.assigned_to_user_id || '', // Corrected for null
          priority: data.priority,
          status: data.status,
          linked_contract_id: data.linked_contract_id || '', // Corrected for null
          linked_client_id: data.linked_client_id || '',     // Corrected for null
        });

      } catch (err: any) {
        console.error('Client-side error fetching task:', err);
        setPageError(err.message || 'An unexpected error occurred while loading task data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]); // Re-run if taskId changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...(prev as Omit<Task, 'created_at' | 'updated_at'>),
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
    if (!formData.title || !formData.priority || !formData.status) {
      setSubmitError('Task Title, Priority, and Status are required.');
      setLoading(false);
      return;
    }
    if (formData.linked_contract_id && formData.linked_client_id) {
      setSubmitError('A task can only be linked to one contract OR one client, not both.');
      setLoading(false);
      return;
    }

    try {
      const taskDataToSend = {
        ...formData,
        // Convert due_date string to ISO format if it exists
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null,
        linked_contract_id: formData.linked_contract_id || null,
        linked_client_id: formData.linked_client_id || null,
        assigned_to_user_id: formData.assigned_to_user_id || null,
      };

      const response = await fetch(`/api/tasks/${taskId}`, { // PUT request to API route
        method: 'PUT', // or PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskDataToSend),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.message || 'Failed to update task. Please try again.');
      } else {
        setSuccess('Task updated successfully!');
        router.push('/tasks'); // Redirect back to tasks list
      }
    } catch (err: any) {
      console.error('Client-side error updating task:', err);
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData) {
    return <div className="p-8 text-center text-gray-600">Loading task details...</div>;
  }

  if (pageError) {
    return (
      <div className="p-8 text-center text-red-700">
        <h1 className="text-3xl font-bold mb-4">Error Loading Task</h1>
        <p>{pageError}</p>
        <Link href="/tasks" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Back to Task List
        </Link>
      </div>
    );
  }

  if (!formData) {
    return <div className="p-8 text-center text-gray-600">No task data found.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Task: {formData.title}</h1>
      <div className="bg-white p-6 rounded shadow-md">
        {submitError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{submitError}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Row 1: Task Title */}
          <div>
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Task Title <span className="text-red-500">*</span></label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Row 2: Due Date */}
          <div>
            <label htmlFor="due_date" className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
            <input type="date" id="due_date" name="due_date" value={formData.due_date || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Row 3: Priority */}
          <div>
            <label htmlFor="priority" className="block text-gray-700 text-sm font-bold mb-2">Priority <span className="text-red-500">*</span></label>
            <select id="priority" name="priority" value={formData.priority} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700">
              {taskPriorityOptions.map(option => (
                <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Row 4: Status */}
          <div>
            <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Status <span className="text-red-500">*</span></label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700">
              {taskStatusOptions.map(option => (
                <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Row 5: Linked Contract ID, Linked Client ID */}
          <div>
            <label htmlFor="linked_contract_id" className="block text-gray-700 text-sm font-bold mb-2">Linked Contract ID (Optional)</label>
            <input type="text" id="linked_contract_id" name="linked_contract_id" value={formData.linked_contract_id || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., UUID of an existing contract" />
          </div>
          <div>
            <label htmlFor="linked_client_id" className="block text-gray-700 text-sm font-bold mb-2">Linked Client ID (Optional)</label>
            <input type="text" id="linked_client_id" name="linked_client_id" value={formData.linked_client_id || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., UUID of an existing client" />
          </div>

          {/* Row 6: Assigned User ID */}
          <div className="md:col-span-2">
            <label htmlFor="assigned_to_user_id" className="block text-gray-700 text-sm font-bold mb-2">Assigned User ID (Optional)</label>
            <input type="text" id="assigned_to_user_id" name="assigned_to_user_id" value={formData.assigned_to_user_id || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" placeholder="e.g., UUID of an existing user" />
          </div>

          {/* Row 7: Description (full width) */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="shadow border rounded w-full py-2 px-3 text-gray-700"></textarea>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4">
            <Link href="/tasks" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center">
              {loading ? 'Updating...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}