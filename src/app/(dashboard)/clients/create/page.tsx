// src/app/(dashboard)/clients/create/page.tsx
'use client'; // This is a client component for form handling

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateClientPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    if (!formData.name) {
      setError('Client Name is required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/clients', { // POST request to your API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to create client. Please try again.');
      } else {
        setSuccess('Client added successfully!');
        // Optionally, reset form or redirect
        setFormData({ // Reset form to initial state
          name: '',
          contact_person: '',
          contact_email: '',
          contact_phone: '',
          address: '',
        });
        router.push('/clients'); // Redirect back to clients list
      }
    } catch (err: any) {
      console.error('Client-side error creating client:', err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Add New Client</h1>
      <div className="bg-white p-6 rounded shadow-md">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Name */}
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Client Name <span className="text-red-500">*</span></label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Contact Person */}
          <div>
            <label htmlFor="contact_person" className="block text-gray-700 text-sm font-bold mb-2">Contact Person</label>
            <input type="text" id="contact_person" name="contact_person" value={formData.contact_person} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Contact Email */}
          <div>
            <label htmlFor="contact_email" className="block text-gray-700 text-sm font-bold mb-2">Contact Email</label>
            <input type="email" id="contact_email" name="contact_email" value={formData.contact_email} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Contact Phone */}
          <div>
            <label htmlFor="contact_phone" className="block text-gray-700 text-sm font-bold mb-2">Contact Phone</label>
            <input type="tel" id="contact_phone" name="contact_phone" value={formData.contact_phone} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* Address (full width) */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">Address</label>
            <textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={3} className="shadow border rounded w-full py-2 px-3 text-gray-700"></textarea>
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex justify-end gap-4">
            <Link href="/clients" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline inline-flex items-center">
              {loading ? 'Adding...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}