// src/app/api/contracts/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Your Prisma client instance

export async function GET(request: Request) {
  try {
    const contracts = await prisma.contracts.findMany({ // Ensure plural 'contracts' here too
      orderBy: {
        created_at: 'desc',
      },
    });
    return NextResponse.json(contracts, { status: 200 });
  } catch (error) {
    console.error('API Error (GET): Failed to fetch contracts:', error);
    return NextResponse.json(
      { message: 'Failed to fetch contracts', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation (more robust validation library can be used here)
    if (!body.contract_number || !body.client_id || !body.contract_status || !body.payment_type) {
      return NextResponse.json(
        { message: 'Missing required contract fields' },
        { status: 400 }
      );
    }

    // --- Important: Ensure client_id and assigned_user_id are valid UUIDs if not null ---
    // For now, we'll assume they are valid UUID strings if provided.
    // In a real app, you'd validate these against your clients/users tables.

    const newContract = await prisma.contracts.create({ // Use plural 'contracts' here
      data: {
        bc_date: body.bc_date ? new Date(body.bc_date) : null,
        delivery_deadline_date: body.delivery_deadline_date ? new Date(body.delivery_deadline_date) : null,
        contract_number: body.contract_number,
        tuneps_number: body.tuneps_number || null,
        client_id: body.client_id, // Make sure this is a valid UUID of an existing client
        contract_status: body.contract_status, // Prisma will handle enum string to enum type
        is_moins_disant: body.is_moins_disant,
        payment_type: body.payment_type, // Prisma will handle enum string to enum type
        contract_value: body.contract_value !== '' ? parseFloat(body.contract_value) : null,
        description: body.description || null,
        assigned_user_id: body.assigned_user_id || null, // Make sure this is a valid UUID of an existing user
      },
    });

    return NextResponse.json(newContract, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('API Error (POST): Failed to create contract:', error);
    // Handle specific Prisma errors (e.g., unique constraint violation)
    if (error instanceof Error && error.message.includes('Unique constraint failed on the fields: (`contract_number`)')) {
        return NextResponse.json(
            { message: 'Contract Number already exists. Please use a unique number.' },
            { status: 409 } // Conflict
        );
    }
    return NextResponse.json(
      { message: 'Failed to create contract', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// You can add other HTTP methods (PUT, DELETE) here later
// export async function PUT(request: Request) { ... }
// export async function DELETE(request: Request) { ... }