// src/app/(dashboard)/procurement/[id]/page.tsx
// This is a Server Component

import Link from 'next/link';
import { notFound } from 'next/navigation'; // For handling not found
import prisma from '@/lib/db'; // Prisma client instance
import DeleteProcurementButton from '@/components/procurement/DeleteProcurementButton';

// Define a type for a ProcurementStep (from your schema.prisma)
interface ProcurementStep {
  id: string;
  contract_id: string;
  step_name: string;
  step_description: string | null;
  status: string; // Matches the ENUM type procurement_step_status_enum
  due_date: Date | null;
  completed_at: Date | null;
  assigned_to_user_id: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  // Include relations for display
  contracts: { // 'contracts' is the relation name in schema.prisma for Contract model
    contract_number: string;
  };
  users: { // 'users' is the relation name for your public_users model
    email: string;
  } | null;
}

interface ProcurementDetailPageProps {
  params: {
    id: string; // The dynamic procurement step ID from the URL
  };
}

export default async function ProcurementDetailPage({ params }: ProcurementDetailPageProps) {
  const stepId = params.id;

  let procurementStep: ProcurementStep | null = null;
  let error: string | null = null;

  if (!stepId) {
    notFound(); // If ID is missing, trigger Next.js notFound()
  }

  try {
    procurementStep = await prisma.procurement_steps.findUnique({ // Use plural 'procurement_steps'
      where: { id: stepId },
      include: { // Include related data for display
        contracts: {
          select: {
            contract_number: true,
          },
        },
        users: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!procurementStep) {
      notFound(); // If procurement step not found, trigger Next.js notFound()
    }
  } catch (e: any) {
    console.error(`ProcurementDetailPage: Error fetching step ${stepId} from Prisma:`, e);
    error = e.message || `Failed to load procurement step ${stepId}.`;
    notFound(); // Consider showing error or notFound, depending on desired behavior for server errors
  }

  // If procurement step is found (or error occurred before notFound)
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Procurement Details: {procurementStep?.step_name}</h1>
        <div className="flex gap-4"> {/* This is the div for action buttons */}
          <Link href={`/procurement/${stepId}/edit`} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            Edit Step
          </Link>
          {/* --- ADD THE DELETE BUTTON HERE --- */}
          {procurementStep && procurementStep.contracts && ( // Ensure contract data is available
            <DeleteProcurementButton
              stepId={procurementStep.id}
              stepName={procurementStep.step_name}
              contractNumber={procurementStep.contracts.contract_number} // Pass contract number
            />
          )}
          <Link href="/procurement" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
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

      {!procurementStep && !error ? (
        <p className="text-center text-gray-600">Procurement step not found.</p>
      ) : (
        <div className="bg-white p-6 rounded shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-900">
          <p><strong>ID:</strong> {procurementStep?.id}</p>
          <p><strong>Step Name:</strong> {procurementStep?.step_name}</p>
          <p><strong>Contract #:</strong> {procurementStep?.contracts.contract_number}</p>
          <p><strong>Status:</strong> {procurementStep?.status.replace(/_/g, ' ')}</p>
          <p><strong>Due Date:</strong> {procurementStep?.due_date ? new Date(procurementStep.due_date).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Completed At:</strong> {procurementStep?.completed_at ? new Date(procurementStep.completed_at).toLocaleString() : 'N/A'}</p>
          <p><strong>Assigned To:</strong> {procurementStep?.users?.email || 'N/A'}</p>
          <div className="md:col-span-2">
            <p><strong>Description:</strong> {procurementStep?.step_description || 'N/A'}</p>
          </div>
          <div className="md:col-span-2 text-xs text-gray-500 mt-2">
            <p><strong>Created At:</strong> {procurementStep?.created_at?.toLocaleString() || 'N/A'}</p>
            <p><strong>Updated At:</strong> {procurementStep?.updated_at?.toLocaleString() || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
}