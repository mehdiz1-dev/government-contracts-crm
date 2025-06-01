// src/app/api/contracts/[id]/route.ts
// This is a Next.js API Route for single contract operations (GET, PUT, DELETE)

import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Your Prisma client instance

interface Context {
  params: {
    id: string; // The dynamic contract ID from the URL
  };
}

export async function GET(request: Request, context: Context) {
  const contractId = context.params.id;

  if (!contractId) {
    return NextResponse.json({ message: 'Contract ID is required' }, { status: 400 });
  }

  try {
    const contract = await prisma.contracts.findUnique({
      where: { id: contractId },
      // You might add `include: { client: { select: { name: true } } }` here later
    });

    if (!contract) {
      return NextResponse.json({ message: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json(contract, { status: 200 });
  } catch (error) {
    console.error(`API Error (GET /contracts/${contractId}): Failed to fetch contract:`, error);
    return NextResponse.json(
      { message: `Failed to fetch contract ${contractId}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: Context) {
  const contractId = context.params.id;

  if (!contractId) {
    return NextResponse.json({ message: 'Contract ID is required for update' }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Basic validation (more robust validation library can be used here)
    if (!body.contract_number || !body.client_id || !body.contract_status || !body.payment_type) {
      return NextResponse.json(
        { message: 'Missing required contract fields for update' },
        { status: 400 }
      );
    }

    const updatedContract = await prisma.contracts.update({ // Use plural 'contracts'
      where: { id: contractId },
      data: {
        bc_date: body.bc_date ? new Date(body.bc_date) : null,
        delivery_deadline_date: body.delivery_deadline_date ? new Date(body.delivery_deadline_date) : null,
        contract_number: body.contract_number, // Contract number is unique, ensure it's not changed to an existing one
        tuneps_number: body.tuneps_number || null,
        client_id: body.client_id, // Make sure this is a valid UUID of an existing client
        contract_status: body.contract_status,
        is_moins_disant: body.is_moins_disant,
        payment_type: body.payment_type,
        contract_value: body.contract_value !== '' ? parseFloat(body.contract_value) : null,
        description: body.description || null,
        assigned_user_id: body.assigned_user_id || null, // Make sure this is a valid UUID of an existing user
        updated_at: new Date(), // Manually update the timestamp as trigger might not run for updateMany
      },
    });

    return NextResponse.json(updatedContract, { status: 200 }); // 200 OK
  } catch (error) {
    console.error(`API Error (PUT /contracts/${contractId}): Failed to update contract:`, error);
    // Handle specific Prisma errors (e.g., unique constraint violation for contract_number if changed)
    if (error instanceof Error && error.message.includes('Unique constraint failed on the fields: (`contract_number`)')) {
        return NextResponse.json(
            { message: 'Contract Number already exists. Please use a unique number.' },
            { status: 409 } // Conflict
        );
    }
    return NextResponse.json(
      { message: `Failed to update contract ${contractId}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// src/app/api/contracts/[id]/route.ts
// ... (rest of imports and GET/PUT functions) ...

interface Context {
  params: {
    id: string; // The dynamic contract ID from the URL
  };
}

export async function DELETE(request: Request, context: Context) {
  const contractId = context.params.id;

  if (!contractId) {
    return NextResponse.json({ message: 'Contract ID is required for deletion' }, { status: 400 });
  }

  try {
    const deletedContract = await prisma.contracts.delete({ // Use plural 'contracts'
      where: { id: contractId },
    });

    // Respond with success (e.g., 204 No Content or the deleted object)
    return NextResponse.json({ message: `Contract ${deletedContract.contract_number} deleted successfully` }, { status: 200 });
    // Or simply: return new NextResponse(null, { status: 204 }); // 204 No Content - if you use 204, client should not call response.json()
  } catch (error: any) {
    console.error(`API Error (DELETE /contracts/${contractId}): Failed to delete contract:`, error);
    // Handle specific Prisma errors (e.g., record not found)
    if (error.code === 'P2025') { // Prisma error code for RecordNotFound
      return NextResponse.json({ message: 'Contract not found for deletion' }, { status: 404 });
    }
    return NextResponse.json(
      { message: `Failed to delete contract ${contractId}`, error: error.message },
      { status: 500 }
    );
  }
}