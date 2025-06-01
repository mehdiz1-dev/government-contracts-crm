// src/app/api/clients/route.ts
// This is a Next.js API Route (serverless function) for clients

import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Your Prisma client instance

export async function GET(request: Request) {
  try {
    const clients = await prisma.clients.findMany({ // Use plural 'clients'
      orderBy: {
        name: 'asc', // Order clients alphabetically
      },
    });
    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    console.error('API Error (GET /clients): Failed to fetch clients:', error);
    return NextResponse.json(
      { message: 'Failed to fetch clients', error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation: Client Name is required and unique
    if (!body.name) {
      return NextResponse.json(
        { message: 'Client Name is required' },
        { status: 400 }
      );
    }

    const newClient = await prisma.clients.create({ // Use plural 'clients'
      data: {
        name: body.name,
        contact_person: body.contact_person || null,
        contact_email: body.contact_email || null,
        contact_phone: body.contact_phone || null,
        address: body.address || null,
      },
    });

    return NextResponse.json(newClient, { status: 201 }); // 201 Created
  } catch (error: any) {
    console.error('API Error (POST /clients): Failed to create client:', error);
    // Handle specific Prisma errors (e.g., unique constraint violation for client name)
    if (error.code === 'P2002') { // Prisma error code for Unique constraint failed
      return NextResponse.json(
        { message: `Client with name "${body.name}" already exists. Please use a unique name.` },
        { status: 409 } // Conflict
      );
    }
    return NextResponse.json(
      { message: 'Failed to create client', error: error.message },
      { status: 500 }
    );
  }
}

// We'll add PUT, DELETE methods for specific client IDs later