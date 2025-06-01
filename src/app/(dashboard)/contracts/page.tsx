// src/app/(dashboard)/contracts/page.tsx
// This is a Server Component, so it doesn't need 'use client'

import Link from 'next/link';
import { createClient } from '@/utils/supabase/server'; // Supabase server-side client
import prisma from '@/lib/db'; // Prisma client instance

// Define a type for a Contract for better type safety
interface Contract {
  id: string; // UUIDs are strings in Prisma
  bc_date: Date | null;
  delivery_deadline_date: Date | null;
  contract_number: string;
  tuneps_number: string | null;
  client_id: string; // Will be UUID string
  contract_status: string; // Matches the ENUM type
  is_moins_disant: boolean;
  payment_type: string; // Matches the ENUM type
  contract_value: number | null; // DECIMAL maps to number in Prisma by default
  description: string | null;
  assigned_user_id: string | null;
  created_at: Date;
  updated_at: Date;
  // You might add the client relation here later: client?: { name: string }
}
export default async function ContractsPage() {
  // Temporary: Bypass session check for development, but keep it for structure
  // For actual use, you'd add:
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) { redirect('/login'); }

  let contracts: Contract[] = [];
  let error: string | null = null;

  try {
    // Fetch contracts using Prisma.
    // For Client Name, we'll need to fetch clients and map them, or include.
    contracts = await prisma.contracts.findMany({
      orderBy: {
        created_at: 'desc', // Order by newest contracts first
      },
      // You might add `include: { client: { select: { name: true } } }` here later
      // but first, ensure the client model is correctly linked in schema.prisma
    });
    console.log('ContractsPage: Fetched contracts:', contracts.length);
  } catch (e: any) {
    console.error('ContractsPage: Error fetching contracts from Prisma:', e);
    error = e.message || 'Failed to load contracts.';
  }
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contracts Overview</h1>
        <Link href="/contracts/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Contract
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {contracts.length === 0 && !error ? (
        <p className="text-center text-gray-600">No contracts found. Add your first contract!</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded">
          <table className="min-w-full leading-normal">
            <thead>
            <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contract #
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Client ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Delivery Deadline
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th> {/* Actions */}
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/contracts/${contract.id}`} className="text-blue-600 hover:underline">
                      {contract.contract_number}
                    </Link>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {contract.client_id} {/* Will replace with client name later */}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      contract.contract_status === 'delivered' ? 'text-green-900' :
                      contract.contract_status === 'procurement' ? 'text-yellow-900' :
                      'text-gray-900' // Default or other statuses
                    }`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                        contract.contract_status === 'delivered' ? 'bg-green-200' :
                        contract.contract_status === 'procurement' ? 'bg-yellow-200' :
                        'bg-gray-200'
                      }`}></span>
                      <span className="relative">{contract.contract_status.replace(/_/g, ' ')}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {contract.delivery_deadline_date ? new Date(contract.delivery_deadline_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Link href={`/contracts/${contract.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
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