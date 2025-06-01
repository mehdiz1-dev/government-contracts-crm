// src/app/api/tasks/route.ts
// This is a Next.js API Route (serverless function) for tasks

import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Your Prisma client instance

export async function GET(request: Request) {
  try {
    const tasks = await prisma.tasks.findMany({ // Use plural 'tasks'
      orderBy: {
        created_at: 'desc',
      },
      include: { // Include related data for display in frontend
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
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    console.error('API Error (GET /tasks): Failed to fetch tasks:', error);
    return NextResponse.json(
      { message: 'Failed to fetch tasks', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation: Title, Priority, and Status are required
    if (!body.title || !body.priority || !body.status) {
      return NextResponse.json(
        { message: 'Task Title, Priority, and Status are required' },
        { status: 400 }
      );
    }

    // Ensure only one linked record ID is provided if both are filled (optional logic)
    if (body.linked_contract_id && body.linked_client_id) {
      return NextResponse.json(
        { message: 'A task can only be linked to one contract OR one client, not both.' },
        { status: 400 }
      );
    }

    const newTask = await prisma.tasks.create({ // Use plural 'tasks'
      data: {
        title: body.title,
        description: body.description || null,
        due_date: body.due_date ? new Date(body.due_date) : null,
        priority: body.priority, // Prisma will handle enum string to enum type
        status: body.status, // Prisma will handle enum string to enum type
        linked_contract_id: body.linked_contract_id || null, // Must be valid UUID of existing contract (optional)
        linked_client_id: body.linked_client_id || null,     // Must be valid UUID of existing client (optional)
        assigned_to_user_id: body.assigned_to_user_id || null, // Must be valid UUID of existing user (optional)
      },
    });

    return NextResponse.json(newTask, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error('API Error (POST /tasks): Failed to create task:', error);
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
      { message: 'Failed to create task', error: error.message },
      { status: 500 }
    );
  }
}

// We'll add PUT, DELETE methods here later