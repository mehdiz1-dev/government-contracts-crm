// src/app/(dashboard)/tasks/[id]/page.tsx
// This is a Server Component

import Link from 'next/link';
import { notFound } from 'next/navigation'; // For handling not found
import prisma from '@/lib/db'; // Prisma client instance
import DeleteTaskButton from '@/components/tasks/DeleteTaskButton';

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
  contracts: {
    contract_number: string;
  } | null;
  clients: {
    name: string;
  } | null;
  users: {
    email: string;
  } | null;
}

interface TaskDetailPageProps {
  params: {
    id: string; // The dynamic task ID from the URL
  };
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const taskId = params.id;

  let task: Task | null = null;
  let error: string | null = null;

  if (!taskId) {
    notFound(); // If ID is missing, trigger Next.js notFound()
  }

  try {
    task = await prisma.tasks.findUnique({ // Use plural 'tasks'
      where: { id: taskId },
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

    if (!task) {
      notFound(); // If task not found, trigger Next.js notFound()
    }
  } catch (e: any) {
    console.error(`TaskDetailPage: Error fetching task ${taskId} from Prisma:`, e);
    error = e.message || `Failed to load task ${taskId}.`;
    notFound(); // Consider showing error or notFound, depending on desired behavior for server errors
  }

  // If task is found (or error occurred before notFound)
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Details: {task?.title}</h1>
        <div className="flex gap-4"> {/* This is the div for action buttons */}
          <Link href={`/tasks/${taskId}/edit`} className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
            Edit Task
          </Link>
          {task && <DeleteTaskButton taskId={task.id} taskTitle={task.title} />} {/* Pass task.id and task.title */}
          <Link href="/tasks" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
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

      {!task && !error ? (
        <p className="text-center text-gray-600">Task not found.</p>
      ) : (
        <div className="bg-white p-6 rounded shadow-md grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-900">
          <p><strong>ID:</strong> {task?.id}</p>
          <p><strong>Title:</strong> {task?.title}</p>
          <p><strong>Description:</strong> {task?.description || 'N/A'}</p>
          <p><strong>Due Date:</strong> {task?.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Priority:</strong> {task?.priority.replace(/_/g, ' ')}</p>
          <p><strong>Status:</strong> {task?.status.replace(/_/g, ' ')}</p>
          <p>
            <strong>Linked Record:</strong>{' '}
            {task?.contracts?.contract_number ? (
              <Link href={`/contracts/${task.linked_contract_id}`} className="text-blue-600 hover:underline">
                Contract #{task.contracts.contract_number}
              </Link>
            ) : task?.clients?.name ? (
              <Link href={`/clients/${task.linked_client_id}`} className="text-blue-600 hover:underline">
                Client: {task.clients.name}
              </Link>
            ) : 'N/A'}
          </p>
          <p><strong>Assigned To:</strong> {task?.users?.email || 'N/A'}</p>
          <div className="md:col-span-2 text-xs text-gray-500 mt-2">
            <p><strong>Created At:</strong> {task?.created_at?.toLocaleString() || 'N/A'}</p>
            <p><strong>Updated At:</strong> {task?.updated_at?.toLocaleString() || 'N/A'}</p>
          </div>
        </div>
      )}
    </div>
  );
}