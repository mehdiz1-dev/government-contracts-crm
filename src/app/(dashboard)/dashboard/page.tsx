// src/app/(dashboard)/dashboard/page.tsx
// This is now a Server Component that focuses on rendering content.
// Authentication and user role fetching are handled by the parent layout.

import Link from 'next/link';

export default async function DashboardPage() {
  // NOTE: User context (authUser, userRole) would typically be passed down from layout
  // or re-fetched if this were strictly a nested server component.
  // For now, it will display 'Not logged in' because the layout handles auth,
  // and this component doesn't re-fetch it in this simplified context.
  // We will refine user context passing later.

  // Mock data for local dev display, since authUser is null here without context passing
  const appUserEmail = "Not logged in (dev)";
  const userRole = "regular_user"; // Default to see the non-admin view

  // Mock dashboard stats for local dev display
  const totalContracts = 10;
  const totalClients = 5;
  const totalTasks = 15;
  const totalProcurementSteps = 8;
  const totalContractValue = 1234567.89;
  const contractsByStatus = [
    { contract_status: 'procurement', _count: { id: 3 } },
    { contract_status: 'delivered', _count: { id: 7 } },
  ];


  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to Your CRM Dashboard!</h1>
      <p className="text-lg">
        User status on dashboard: **{appUserEmail}.**
        {userRole && <span className="ml-2 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">({userRole.toUpperCase()})</span>}
      </p>
      <p className="mt-4">This is your actual dashboard content area.</p>

      {/* Dashboard Summary Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow-md"><h2 className="text-xl font-semibold text-gray-800 mb-2">Total Contracts</h2><p className="text-4xl font-bold text-blue-600">{totalContracts}</p></div>
        <div className="bg-white p-6 rounded shadow-md"><h2 className="text-xl font-semibold text-gray-800 mb-2">Total Clients</h2><p className="text-4xl font-bold text-green-600">{totalClients}</p></div>
        <div className="bg-white p-6 rounded shadow-md"><h2 className="text-xl font-semibold text-gray-800 mb-2">Total Tasks</h2><p className="text-4xl font-bold text-purple-600">{totalTasks}</p></div>
        <div className="bg-white p-6 rounded shadow-md"><h2 className="text-xl font-semibold text-gray-800 mb-2">Total Procurement Steps</h2><p className="text-4xl font-bold text-orange-600">{totalProcurementSteps}</p></div>
        <div className="bg-white p-6 rounded shadow-md"><h2 className="text-xl font-semibold text-gray-800 mb-2">Total Contract Value</h2><p className="text-4xl font-bold text-indigo-600">${totalContractValue.toFixed(2)}</p></div>
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


      {/* Admin-Only Section */}
      <div className="mt-8 p-6 bg-yellow-50 rounded shadow-md border border-yellow-200">
        <h2 className="text-xl font-bold text-yellow-800 mb-4">Admin-Only Section</h2>
        {userRole === 'admin' ? (
          <>
            <p className="text-gray-700 mb-2">This content is only visible to users with the 'admin' role.</p>
            <Link href="/users" className="text-blue-600 hover:underline">
              Go to User Management (Future Page)
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              (Note: For actual user management, you'll need to create the /users page and its API routes.)
            </p>
          </>
        ) : (
          <p className="text-gray-500 italic">You do not have administrative privileges to view this section.</p>
        )}
      </div>

    </div>
  );
}