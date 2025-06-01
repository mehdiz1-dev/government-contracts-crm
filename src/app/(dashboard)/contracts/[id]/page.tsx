// src/app/(dashboard)/contracts/[id]/page.tsx
// This is a Server Component, so it doesn't need 'use client'

import Link from 'next/link';
import { notFound } from 'next/navigation'; // For handling contract not found
import prisma from '@/lib/db'; // Prisma client instance
import DeleteContractButton from '@/components/contracts/DeleteContractButton'; // <--- ADD THIS IMPORT

// Define a type for a Contract for better type safety
// This should match the type used in contracts/page.tsx
interface Contract {
  id: string; // UUIDs are strings in Prisma
  bc_date: Date | null;
  delivery_deadline_date: Date | null;
  contract_number: string;
  tuneps_number: string | null;
  client_id: string; // Will be UUID string
  contract_status: string;
  is_moins_disant: boolean;
  payment_type: string;
  contract_value: number | null;
  description: string | null;
  assigned_user_id: string | null;
  created_at: Date;
  updated_at: Date;
  // Potentially add client relation here later: client?: { name: string }
}

interface ContractDetailPageProps {
  params: {
    id: string; // The dynamic contract ID from the URL
  };
}

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
  const contractId = params.id;

  let contract: Contract | null = null;
  let error: string | null = null;

  if (!contractId) {
    notFound(); // If ID is missing, trigger Next.js notFound()
  }

  try {
    contract = await prisma.contracts.findUnique({ // Use plural 'contracts'
      where: { id: contractId },
      // You might add `include: { client: { select: { name: true } } }` here later
    });

    if (!contract) {
      notFound(); // If contract not found, trigger Next.js notFound()
    }
  } catch (e: any) {
    console.error(`ContractsPage: Error fetching contract ${contractId} from Prisma:`, e);
    error = e.message || `Failed to load contract ${contractId}.`;
    notFound(); // Consider showing error or notFound, depending on desired behavior for server errors
  }

  // If contract is found (or error occurred before notFound)
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contract Details: {contract?.contract_number}</h1>
        <div className="flex gap-4"> {/* This is the div containing your buttons */}
          <Link href={`/contracts/${contractId}/edit`} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            Edit Contract
          </Link>
          {/* --- ADD THE DELETE BUTTON COMPONENT (JSX) HERE --- */}
          {/* Only render the button if contract data is available to pass its ID and number */}
          {contract && <DeleteContractButton contractId={contract.id} contractNumber={contract.contract_number} />}
          {/* --- END DELETE BUTTON COMPONENT --- */}
          <Link href="/contracts" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
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

      {!contract && !error ? (
        <p className="text-center text-gray-600">Contract not found.</p>
      ) : (
        <div className="bg-white p-6 rounded shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-900"> {/* Added text-gray-900 here */}
          <p><strong>ID:</strong> {contract?.id}</p>
          <p><strong>Contract Number:</strong> {contract?.contract_number}</p>
          <p><strong>TUNEPS Number:</strong> {contract?.tuneps_number || 'N/A'}</p>
          <p><strong>Client ID:</strong> {contract?.client_id}</p>
          <p><strong>Assigned User ID:</strong> {contract?.assigned_user_id || 'N/A'}</p>
          <p><strong>BC Date:</strong> {contract?.bc_date ? new Date(contract.bc_date).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Delivery Deadline:</strong> {contract?.delivery_deadline_date ? new Date(contract.delivery_deadline_date).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Status:</strong> {contract?.contract_status.replace(/_/g, ' ')}</p>
          <p><strong>Payment Type:</strong> {contract?.payment_type.replace(/_/g, ' ')}</p>
          <p><strong>Moins Disant:</strong> {contract?.is_moins_disant ? 'Yes' : 'No'}</p>
          <p><strong>Value:</strong> {contract?.contract_value !== null ? `$${contract.contract_value.toFixed(2)}` : 'N/A'}</p>
          <div className="md:col-span-2">
            <p><strong>Description:</strong> {contract?.description || 'N/A'}</p>
          </div>
          <div className="md:col-span-2 text-xs text-gray-500 mt-2">
            <p><strong>Created At:</strong> {contract?.created_at.toLocaleString()}</p>
            <p><strong>Updated At:</strong> {contract?.updated_at.toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}