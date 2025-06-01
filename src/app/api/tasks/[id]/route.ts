// src/app/api/tasks/[id]/route.ts
// This is a Next.js API Route for single task operations (GET, PUT, DELETE)

import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Your Prisma client instance

interface RouteContext {
  params: {
    id: string; // The dynamic task ID from the URL
  };
}

export async function GET(request: Request, context: RouteContext) {
  const taskId = context.params.id;

  if (!taskId) {
    return NextResponse.json({ message: 'Task ID is required' }, { status: 400 });
  }

  try {
    const task = await prisma.tasks.findUnique({ // Use plural 'tasks'
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
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error(`API Error (GET /tasks/${taskId}): Failed to fetch task:`, error);
    return NextResponse.json(
      { message: `Failed to fetch task ${taskId}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// src/app/api/tasks/[id]/route.ts
// ... (rest of imports, GET function, and RouteContext interface) ...

export async function PUT(request: Request, { params }: { params: { id: string } }) { // Use destructuring for params
  const taskId = params.id;

  if (!taskId) {
    return NextResponse.json({ message: 'Task ID is required for update' }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Basic validation: Title, Priority, and Status are required
    if (!body.title || !body.priority || !body.status) {
      return NextResponse.json(
        { message: 'Task Title, Priority, and Status are required' },
        { status: 400 }
      );
    }

    // Ensure only one linked record ID is provided if both are filled
    if (body.linked_contract_id && body.linked_client_id) {
      return NextResponse.json(
        { message: 'A task can only be linked to one contract OR one client, not both.' },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.tasks.update({ // Use plural 'tasks'
      where: { id: taskId },
      data: {
        title: body.title,
        description: body.description || null,
        due_date: body.due_date ? new Date(body.due_date) : null,
        priority: body.priority,
        status: body.status,
        linked_contract_id: body.linked_contract_id || null,
        linked_client_id: body.linked_client_id || null,
        assigned_to_user_id: body.assigned_to_user_id || null,
        updated_at: new Date(), // Manually update the timestamp
      },
    });

    return NextResponse.json(updatedTask, { status: 200 }); // 200 OK
  } catch (error: any) {
    console.error(`API Error (PUT /tasks/${taskId}): Failed to update task:`, error);
    // Handle specific Prisma errors (e.g., foreign key constraint violation)
    if (error.code === 'P2003') { // Prisma error code for Foreign key constraint failed
      let errorMessage = 'Foreign key constraint failed. Ensure linked Contract ID, Client ID, and Assigned User ID are valid UUIDs of existing records.';
      if (error.meta && error.meta.field_name) {
          errorMessage += ` Problem field: ${error.meta.field_name}.`;
      }
      return NextResponse.json(
        { message: errorMessage, error: error.message },
        { status: 400 } // Bad Request due to invalid FK
      );
    }
    return NextResponse.json(
      { message: `Failed to update task ${taskId}`, error: error.message },
      { status: 500 }
    );
  }
}

// src/app/api/tasks/[id]/route.ts
// ... (rest of imports, GET, and PUT functions) ...

export async function DELETE(request: Request, context: RouteContext) {
  const taskId = context.params.id;

  if (!taskId) {
    return NextResponse.json({ message: 'Task ID is required for deletion' }, { status: 400 });
  }

  try {
    const deletedTask = await prisma.tasks.delete({ // Use plural 'tasks'
      where: { id: taskId },
    });

    // Respond with success
    return NextResponse.json({ message: `Task "${deletedTask.title}" deleted successfully` }, { status: 200 });
    // Or simply: return new NextResponse(null, { status: 204 }); // 204 No Content, if you prefer no body
  } catch (error: any) {
    console.error(`API Error (DELETE /tasks/${taskId}): Failed to delete task:`, error);
    if (error.code === 'P2025') { // Prisma error code for RecordNotFound
      return NextResponse.json({ message: 'Task not found for deletion' }, { status: 404 });
    }
    // Tasks don't have direct dependent records, so P2003 (foreign key constraint) is less likely here.
    return NextResponse.json(
      { message: `Failed to delete task ${taskId}`, error: error.message },
      { status: 500 }
    );
  }
}