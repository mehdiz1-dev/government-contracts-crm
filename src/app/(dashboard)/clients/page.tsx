// src/app/(dashboard)/clients/page.tsx
// This is a Server Component

import Link from 'next/link';
import prisma from '@/lib/db'; // Prisma client instance

// Define a type for a Client for better type safety (from your schema.prisma)
interface Client {
  id: string; // UUIDs are strings in Prisma
  name: string;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  created_at: Date;
  updated_at: Date;
}

export default async function ClientsPage() {
  // Temporary: Bypass session check for development, but keep it for structure
  // For actual use, you'd add:
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) { redirect('/login'); }

  let clients: Client[] = [];
  let error: string | null = null;

  try {
    // Fetch clients using Prisma
    clients = await prisma.clients.findMany({ // Use plural 'clients'
      orderBy: {
        name: 'asc', // Order clients alphabetically by name
      },
    });
    console.log('ClientsPage: Fetched clients:', clients.length);
  } catch (e: any) {
    console.error('ClientsPage: Error fetching clients from Prisma:', e);
    error = e.message || 'Failed to load clients.';
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Clients Overview</h1>
        <Link href="/clients/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Client
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {clients.length === 0 && !error ? (
        <p className="text-center text-gray-600">No clients found. Add your first client!</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded">
          <table className="min-w-full leading-normal">
  <thead>
    <tr>
      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client Name</th>
      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Email</th>
      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Phone</th>
      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th> {/* Actions */}
    </tr>
  </thead>
  <tbody>
    {clients.map((client) => (
      <tr key={client.id}>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <Link href={`/clients/${client.id}`} className="text-blue-600 hover:underline">
            {client.name}
          </Link>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{client.contact_email || 'N/A'}</td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{client.contact_phone || 'N/A'}</td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
          <Link href={`/clients/${client.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
            Edit
          </Link>
        </td>
      </tr>
    ))}
  </tbody>
</table>
        </div>
      )}
    </div>
  );
}