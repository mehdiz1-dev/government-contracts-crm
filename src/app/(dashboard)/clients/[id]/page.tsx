// src/app/(dashboard)/clients/[id]/page.tsx
// This is a Server Component, so it doesn't need 'use client'

import Link from 'next/link';
import { notFound } from 'next/navigation'; // For handling client not found
import prisma from '@/lib/db'; // Prisma client instance
import DeleteClientButton from '@/components/clients/DeleteClientButton'; // 

// Define a type for a Client for better type safety (from your schema.prisma)
interface Client {
  id: string;
  name: string;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  created_at: Date;
  updated_at: Date;
  // You might add relations here later, e.g., contracts?: Contract[];
}

interface ClientDetailPageProps {
  params: {
    id: string; // The dynamic client ID from the URL
  };
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const clientId = params.id;

  let client: Client | null = null;
  let error: string | null = null;

  if (!clientId) {
    notFound(); // If ID is missing, trigger Next.js notFound()
  }

  try {
    client = await prisma.clients.findUnique({ // Use plural 'clients'
      where: { id: clientId },
      // You might add `include: { contracts: true }` here later if you want to list related contracts
    });

    if (!client) {
      notFound(); // If client not found, trigger Next.js notFound()
    }
  } catch (e: any) {
    console.error(`ClientDetailPage: Error fetching client ${clientId} from Prisma:`, e);
    error = e.message || `Failed to load client ${clientId}.`;
    notFound(); // Consider showing error or notFound, depending on desired behavior for server errors
  }

  // If client is found (or error occurred before notFound)
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Details: {client?.name}</h1>
        <div className="flex gap-4"> {/* This is the div for action buttons */}
          <Link href={`/clients/${clientId}/edit`} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            Edit Client
          </Link>
          {/* --- ADD THE DELETE BUTTON HERE --- */}
          {client && <DeleteClientButton clientId={client.id} clientName={client.name} />} {/* Pass client.id and client.name */}
          {/* --- END DELETE BUTTON --- */}
          <Link href="/clients" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
            Back to List
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!client && !error ? (
        <p className="text-center text-gray-600">Client not found.</p>
      ) : (
        <div className="bg-white p-6 rounded shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-900">
          <p><strong>ID:</strong> {client?.id}</p>
          <p><strong>Name:</strong> {client?.name}</p>
          <p><strong>Contact Person:</strong> {client?.contact_person || 'N/A'}</p>
          <p><strong>Contact Email:</strong> {client?.contact_email || 'N/A'}</p>
          <p><strong>Contact Phone:</strong> {client?.contact_phone || 'N/A'}</p>
          <div className="md:col-span-2">
            <p><strong>Address:</strong> {client?.address || 'N/A'}</p>
          </div>
          <div className="md:col-span-2 text-xs text-gray-500 mt-2">
            <p><strong>Created At:</strong> {client?.created_at.toLocaleString()}</p>
            <p><strong>Updated At:</strong> {client?.updated_at.toLocaleString()}</p>
          </div>
          {/* Related Contracts list can go here later */}
        </div>
      )}
    </div>
  );
}
// src/app/(dashboard)/clients/[id]/page.tsx
// ...

