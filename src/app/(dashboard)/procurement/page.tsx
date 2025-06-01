// src/app/(dashboard)/procurement/page.tsx
// This is a Server Component

import Link from 'next/link';
import prisma from '@/lib/db'; // Prisma client instance

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
  users: { // <--- CORRECTED: 'users' (plural lowercase)
    email: string;
  } | null; // Can be null if assigned_to_user_id is null
}

export default async function ProcurementPage() {
  // Temporary: Bypass session check for development, but keep it for structure
  // For actual use, you'd add:
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) { redirect('/login'); }

  let procurementSteps: ProcurementStep[] = [];
  let error: string | null = null;

  try {
    procurementSteps = await prisma.procurement_steps.findMany({ // Use plural 'procurement_steps'
      orderBy: {
        created_at: 'desc', // Order by newest entries first
      },
      include: { // Include related data for display
        contracts: {
          select: {
            contract_number: true, // Only fetch the contract_number
          },
        },
        users: { // <--- CORRECTED: 'users' (plural lowercase)
          select: {
            email: true,
          },
        },
      },
    });
    console.log('ProcurementPage: Fetched procurement steps:', procurementSteps.length);
  } catch (e: any) {
    console.error('ProcurementPage: Error fetching procurement steps from Prisma:', e);
    error = e.message || 'Failed to load procurement steps.';
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Procurement Overview</h1>
        <Link href="/procurement/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Step
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {procurementSteps.length === 0 && !error ? (
        <p className="text-center text-gray-600">No procurement steps found. Add your first step!</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Step Name</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contract #</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th> {/* Actions */}
              </tr>
            </thead>
            <tbody>
              {procurementSteps.map((step) => (
                <tr key={step.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/procurement/${step.id}`} className="text-blue-600 hover:underline">
                      {step.step_name}
                    </Link>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/contracts/${step.contract_id}`} className="text-blue-600 hover:underline">
                      {step.contracts.contract_number}
                    </Link>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      step.status === 'completed' ? 'text-green-900' :
                      step.status === 'in_progress' ? 'text-yellow-900' :
                      step.status === 'blocked' ? 'text-red-900' :
                      'text-gray-900'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                        step.status === 'completed' ? 'bg-green-200' :
                        step.status === 'in_progress' ? 'bg-yellow-200' :
                        step.status === 'blocked' ? 'bg-red-200' :
                        'bg-gray-200'
                      }`}></span>
                      <span className="relative">{step.status.replace(/_/g, ' ')}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {step.due_date ? new Date(step.due_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {step.users?.email || 'N/A'} {/* <--- CORRECTED: 'users' (plural lowercase) */}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Link href={`/procurement/${step.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
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