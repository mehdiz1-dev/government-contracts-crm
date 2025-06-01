// src/app/(dashboard)/reports/page.tsx
// This is a Server Component

import prisma from '@/lib/db'; // Prisma client instance
import { Decimal } from '@prisma/client/runtime/library'; // Import Decimal type if needed for sum

export default async function ReportsPage() {
  // Temporary: Bypass session check for development
  // For actual use, you'd add:
  // const supabase = await createClient();
  // const { data: { user } = {} } = await supabase.auth.getUser(); // Add = {} for safety
  // if (!user) { redirect('/login'); }

  let totalContracts = 0;
  let totalClients = 0;
  let totalTasks = 0;
  let totalProcurementSteps = 0;
  let totalContractValue: number | null = 0;
  let contractsByStatus: Array<{ contract_status: string; _count: number }> = [];
  let error: string | null = null;

  try {
    // Fetch all counts
    totalContracts = await prisma.contracts.count();
    totalClients = await prisma.clients.count();
    totalTasks = await prisma.tasks.count();
    totalProcurementSteps = await prisma.procurement_steps.count();

    // Fetch total contract value
    const contractValueAggregate = await prisma.contracts.aggregate({
      _sum: {
        contract_value: true,
      },
    });
    totalContractValue = contractValueAggregate._sum.contract_value?.toNumber() || 0; // Convert Decimal to number

    // Fetch contracts grouped by status
    contractsByStatus = await prisma.contracts.groupBy({
      by: ['contract_status'],
      _count: {
        id: true, // Count IDs for each status
      },
    });

    console.log('ReportsPage: Fetched summary data successfully.');
  } catch (e: any) {
    console.error('ReportsPage: Error fetching report data from Prisma:', e);
    error = e.message || 'Failed to load report data.';
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Reports Overview</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card: Total Contracts */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Contracts</h2>
          <p className="text-4xl font-bold text-blue-600">{totalContracts}</p>
        </div>

        {/* Card: Total Clients */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Clients</h2>
          <p className="text-4xl font-bold text-green-600">{totalClients}</p>
        </div>

        {/* Card: Total Tasks */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Tasks</h2>
          <p className="text-4xl font-bold text-purple-600">{totalTasks}</p>
        </div>

        {/* Card: Total Procurement Steps */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Procurement Steps</h2>
          <p className="text-4xl font-bold text-orange-600">{totalProcurementSteps}</p>
        </div>

        {/* Card: Total Contract Value */}
        <div className="bg-white p-6 rounded shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Contract Value</h2>
          <p className="text-4xl font-bold text-indigo-600">${totalContractValue?.toFixed(2)}</p>
        </div>

        {/* Card: Contracts by Status */}
        <div className="bg-white p-6 rounded shadow-md md:col-span-2 lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Contracts by Status</h2>
          <ul className="list-disc list-inside">
            {contractsByStatus.length > 0 ? (
              contractsByStatus.map((statusGroup, index) => (
                <li key={index} className="text-lg text-gray-700">
                  {statusGroup.contract_status.replace(/_/g, ' ')}: <span className="font-bold">{statusGroup._count.id}</span>
                </li>
              ))
            ) : (
              <li className="text-lg text-gray-500">No contracts to categorize.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Detailed Reports</h2>
        <p className="text-gray-600">
          Future sections for filtering, charts, and export options will go here.
        </p>
      </div>
    </div>
  );
}