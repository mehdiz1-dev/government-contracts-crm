// src/app/(dashboard)/tasks/page.tsx
// This is a Server Component

import Link from 'next/link';
import prisma from '@/lib/db'; // Prisma client instance

// Define a type for a Task (from your schema.prisma)
interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: Date | null;
  assigned_to_user_id: string | null;
  priority: string; // Matches the ENUM type task_priority_enum
  status: string; // Matches the ENUM type task_status_enum
  linked_contract_id: string | null; // UUID
  linked_client_id: string | null; // UUID
  created_at: Date | null;
  updated_at: Date | null;
  // Include relations for display
  contracts: { // 'contracts' is the relation name for Contract model
    contract_number: string;
  } | null; // Can be null if not linked to a contract
  clients: { // 'clients' is the relation name for Client model
    name: string;
  } | null; // Can be null if not linked to a client
  users: { // 'users' is the relation name for your public_users model
    email: string;
  } | null; // Can be null if assigned_to_user_id is null
}

export default async function TasksPage() {
  // Temporary: Bypass session check for development
  // For actual use, you'd add:
  // const supabase = await createClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) { redirect('/login'); }

  let tasks: Task[] = [];
  let error: string | null = null;

  try {
    tasks = await prisma.tasks.findMany({ // Use plural 'tasks'
      orderBy: {
        created_at: 'desc', // Order by newest tasks first
      },
      include: { // Include related data for display
        contracts: {
          select: {
            contract_number: true,
          },
        },
        clients: {
          select: {
            name: true,
          },
        },
        users: {
          select: {
            email: true,
          },
        },
      },
    });
    console.log('TasksPage: Fetched tasks:', tasks.length);
  } catch (e: any) {
    console.error('TasksPage: Error fetching tasks from Prisma:', e);
    error = e.message || 'Failed to load tasks.';
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tasks Overview</h1>
        <Link href="/tasks/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add New Task
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {tasks.length === 0 && !error ? (
        <p className="text-center text-gray-600">No tasks found. Add your first task!</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Linked Record</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th> {/* Actions */}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <Link href={`/tasks/${task.id}`} className="text-blue-600 hover:underline">
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {task.contracts?.contract_number ? (
                      <Link href={`/contracts/${task.linked_contract_id}`} className="text-blue-600 hover:underline">
                        Contract #{task.contracts.contract_number}
                      </Link>
                    ) : task.clients?.name ? (
                      <Link href={`/clients/${task.linked_client_id}`} className="text-blue-600 hover:underline">
                        Client: {task.clients.name}
                      </Link>
                    ) : 'N/A'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {task.users?.email || 'N/A'}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      task.priority === 'high' ? 'text-red-900' :
                      task.priority === 'medium' ? 'text-orange-900' :
                      'text-gray-900'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                        task.priority === 'high' ? 'bg-red-200' :
                        task.priority === 'medium' ? 'bg-orange-200' :
                        'bg-gray-200'
                      }`}></span>
                      <span className="relative">{task.priority.replace(/_/g, ' ')}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                      task.status === 'completed' ? 'text-green-900' :
                      task.status === 'in_progress' ? 'text-blue-900' :
                      'text-gray-900'
                    }`}>
                      <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full ${
                        task.status === 'completed' ? 'bg-green-200' :
                        task.status === 'in_progress' ? 'bg-blue-200' :
                        'bg-gray-200'
                      }`}></span>
                      <span className="relative">{task.status.replace(/_/g, ' ')}</span>
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                    <Link href={`/tasks/${task.id}/edit`} className="text-indigo-600 hover:text-indigo-900">
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