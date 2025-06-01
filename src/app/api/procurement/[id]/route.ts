// src/app/api/procurement/[id]/route.ts
// This is a Next.js API Route for single procurement step operations (GET, PUT, DELETE)

import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Your Prisma client instance

interface RouteContext {
  params: {
    id: string; // The dynamic procurement step ID from the URL
  };
}

export async function GET(request: Request, context: RouteContext) {
  const stepId = context.params.id;

  if (!stepId) {
    return NextResponse.json({ message: 'Procurement Step ID is required' }, { status: 400 });
  }

  try {
    const procurementStep = await prisma.procurement_steps.findUnique({ // Use plural 'procurement_steps'
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
      return NextResponse.json({ message: 'Procurement Step not found' }, { status: 404 });
    }

    return NextResponse.json(procurementStep, { status: 200 });
  } catch (error) {
    console.error(`API Error (GET /procurement/${stepId}): Failed to fetch procurement step:`, error);
    return NextResponse.json(
      { message: `Failed to fetch procurement step ${stepId}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// src/app/api/procurement/[id]/route.ts
// ... (rest of imports, GET function, and RouteContext interface) ...

export async function PUT(request: Request, context: RouteContext) {
  const stepId = context.params.id;

  if (!stepId) {
    return NextResponse.json({ message: 'Procurement Step ID is required for update' }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Basic validation: Step Name, Contract ID, and Status are required
    if (!body.step_name || !body.contract_id || !body.status) {
      return NextResponse.json(
        { message: 'Step Name, Contract ID, and Status are required' },
        { status: 400 }
      );
    }

    const updatedProcurementStep = await prisma.procurement_steps.update({ // Use plural 'procurement_steps'
      where: { id: stepId },
      data: {
        step_name: body.step_name,
        contract_id: body.contract_id, // Must be a valid UUID of an existing contract
        step_description: body.step_description || null,
        status: body.status, // Prisma will handle enum string to enum type
        due_date: body.due_date ? new Date(body.due_date) : null,
        assigned_to_user_id: body.assigned_to_user_id || null, // Must be a valid UUID of an existing user
        updated_at: new Date(), // Manually update the timestamp
      },
    });

    return NextResponse.json(updatedProcurementStep, { status: 200 }); // 200 OK
  } catch (error: any) {
    console.error(`API Error (PUT /procurement/${stepId}): Failed to update procurement step:`, error);
    // Handle specific Prisma errors (e.g., foreign key constraint violation)
    if (error.code === 'P2003') { // Prisma error code for Foreign key constraint failed
      let errorMessage = 'Foreign key constraint failed. Ensure Contract ID and Assigned User ID are valid UUIDs of existing records.';
      if (error.meta && error.meta.field_name) {
          errorMessage += ` Problem field: ${error.meta.field_name}.`;
      }
      return NextResponse.json(
        { message: errorMessage, error: error.message },
        { status: 400 } // Bad Request due to invalid FK
      );
    }
    return NextResponse.json(
      { message: `Failed to update procurement step ${stepId}`, error: error.message },
      { status: 500 }
    );
  }
}

// src/app/api/procurement/[id]/route.ts
// ... (rest of imports, GET, and PUT functions) ...

export async function DELETE(request: Request, context: RouteContext) {
  const stepId = context.params.id;

  if (!stepId) {
    return NextResponse.json({ message: 'Procurement Step ID is required for deletion' }, { status: 400 });
  }

  try {
    const deletedProcurementStep = await prisma.procurement_steps.delete({ // Use plural 'procurement_steps'
      where: { id: stepId },
    });

    // Respond with success
    return NextResponse.json({ message: `Procurement step "${deletedProcurementStep.step_name}" deleted successfully` }, { status: 200 });
    // Or simply: return new NextResponse(null, { status: 204 }); // 204 No Content, if you prefer no body
  } catch (error: any) {
    console.error(`API Error (DELETE /procurement/${stepId}): Failed to delete procurement step:`, error);
    if (error.code === 'P2025') { // Prisma error code for RecordNotFound
      return NextResponse.json({ message: 'Procurement step not found for deletion' }, { status: 404 });
    }
    // Handle foreign key constraint if step has associated records (unlikely for this model)
    // if (error.code === 'P2003') { ... }
    return NextResponse.json(
      { message: `Failed to delete procurement step ${stepId}`, error: error.message },
      { status: 500 }
    );
  }
}