// src/app/(dashboard)/clients/[id]/edit/page.tsx
'use client'; // This is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Hook to get dynamic route parameters

// Define a type for a Client (should match the one in clients/page.tsx)
interface Client {
  id: string;
  name: string;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  created_at: Date; // These will be Date objects after fetch, converted to string for inputs
  updated_at: Date;
}

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams(); // Get the ID from the URL
  const clientId = params.id as string;

  const [formData, setFormData] = useState<Omit<Client, 'created_at' | 'updated_at'> | null>(null); // Omit date objects initially
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null); // For fetching error
  const [submitError, setSubmitError] = useState<string | null>(null); // For form submission error
  const [success, setSuccess] = useState<string | null>(null);

  // Effect to fetch client data when the page loads
  useEffect(() => {
    if (!clientId) {
      setPageError("Client ID is missing.");
      return;
    }

    const fetchClient = async () => {
      setLoading(true);
      setPageError(null);
      try {
        const response = await fetch(`/api/clients/${clientId}`); // GET request to API
        const data = await response.json();

        if (!response.ok) {
          setPageError(data.message || 'Failed to fetch client details.');
          return;
        }

        setFormData({
          id: data.id,
          name: data.name,
          contact_person: data.contact_person || '', // Corrected for null
          contact_email: data.contact_email || '',   // Corrected for null
          contact_phone: data.contact_phone || '',   // Corrected for null
          address: data.address || '',               // Corrected for null
        });

      } catch (err: any) {
        console.error('Client-side error fetching client:', err);
        setPageError(err.message || 'An unexpected error occurred while loading client data.');
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId]); // Re-run if clientId changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return; // Should not happen after initial load
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...(prev as Omit<Client, 'created_at' | 'updated_at'>),
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
    if (!formData.name) {
      setSubmitError('Client Name is required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, { // PUT request to API route
        method: 'PUT', // or PATCH
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setSubmitError(result.message || 'Failed to update client. Please try again.');
      } else {
        setSuccess('Client updated successfully!');
        router.push('/clients'); // Redirect back to clients list
      }
    } catch (err: any) {
      console.error('Client-side error updating client:', err);
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData) {
    return <div className="p-8 text-center text-gray-600">Loading client details...</div>;
  }

  if (pageError) {
    return (
      <div className="p-8 text-center text-red-700">
        <h1 className="text-3xl font-bold mb-4">Error Loading Client</h1>
        <p>{pageError}</p>
        <Link href="/clients" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Back to Clients
        </Link>
      </div>
    );
  }

  if (!formData) {
    return <div className="p-8 text-center text-gray-600">No client data found.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Client: {formData.name}</h1>
      <div className="bg-white p-6 rounded shadow-md">
        {submitError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{submitError}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Name (read-only if it's the primary identifier, editable otherwise) */}
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Client Name <span className="text-red-500">*</span></label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Contact Person */}
          <div>
            <label htmlFor="contact_person" className="block text-gray-700 text-sm font-bold mb-2">Contact Person</label>
            <input type="text" id="contact_person" name="contact_person" value={formData.contact_person || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contact_email" className="block text-gray-700 text-sm font-bold mb-2">Contact Email</label>
            <input type="email" id="contact_email" name="contact_email" value={formData.contact_email || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Contact Phone */}
          <div>
            <label htmlFor="contact_phone" className="block text-gray-700 text-sm font-bold mb-2">Contact Phone</label>
            <input type="tel" id="contact_phone" name="contact_phone" value={formData.contact_phone || ''} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Address (full width) */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address</label>
            <textarea id="address" name="address" value={formData.address || ''} onChange={handleChange} rows={3} className="shadow border rounded w-full py-2 px-3 text-gray-700"></textarea>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4">
            <Link href="/clients" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center">
              {loading ? 'Updating...' : 'Update Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}