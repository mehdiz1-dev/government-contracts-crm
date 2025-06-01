// src/app/api/procurement/route.ts
// This is a Next.js API Route (serverless function) for procurement steps

import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Your Prisma client instance

export async function GET(request: Request) {
  try {
    const procurementSteps = await prisma.procurement_steps.findMany({ // Use plural 'procurement_steps'
      orderBy: {
        created_at: 'desc',
      },
      include: { // Include related data for display in frontend
        contracts: {
          select: {
            contract_number: true,
          },
        },
        users: { // <--- CORRECTED: 'users' (plural lowercase)
          select: {
            email: true,
          },
        },
      },
    });
    return NextResponse.json(procurementSteps, { status: 200 });
  } catch (error) {
    console.error('API Error (GET /procurement): Failed to fetch procurement steps:', error);
    return NextResponse.json(
      { message: 'Failed to fetch procurement steps', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation: Step Name and Contract ID are required
    if (!body.step_name || !body.contract_id || !body.status) {
      return NextResponse.json(
        { message: 'Step Name, Contract ID, and Status are required' },
        { status: 400 }
      );
    }

    const newProcurementStep = await prisma.procurement_steps.create({ // Use plural 'procurement_steps'
      data: {
        step_name: body.step_name,
        contract_id: body.contract_id, // Must be a valid UUID of an existing contract
        step_description: body.step_description || null,
        status: body.status, // Prisma will handle enum string to enum type
        due_date: body.due_date ? new Date(body.due_date) : null,
        assigned_to_user_id: body.assigned_to_user_id || null, // Must be a valid UUID of an existing user
      },
    });

    return NextResponse.json(newProcurementStep, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('API Error (POST /procurement): Failed to create procurement step:', error);
    // Handle specific Prisma errors (e.g., foreign key constraint violation)
    if ((error as any).code === 'P2003') { // Prisma error code for Foreign key constraint failed
      let errorMessage = 'Foreign key constraint failed. Ensure Contract ID and Assigned User ID are valid UUIDs of existing records.';
      if ((error as any).meta && (error as any).meta.field_name) {
          errorMessage += ` Problem field: ${(error as any).meta.field_name}.`;
      }
      return NextResponse.json(
        { message: errorMessage, error: (error as Error).message },
        { status: 400 } // Bad Request due to invalid FK
      );
    }
    return NextResponse.json(
      { message: 'Failed to create procurement step', error: (error as Error).message },
      { status: 500 }
    );
  }
}

// We'll add PUT, DELETE methods here later