// src/app/api/clients/[id]/route.ts
// This is a Next.js API Route for single client operations (GET, PUT, DELETE)

import { NextResponse } from 'next/server';
import prisma from '@/lib/db'; // Your Prisma client instance

// GET method: Fetch a single client by ID
export async function GET(request: Request, { params }: { params: { id: string } }) { // <-- CHANGED SIGNATURE
  const clientId = params.id; // <-- Access params.id directly

  if (!clientId) {
    return NextResponse.json({ message: 'Client ID is required' }, { status: 400 });
  }

  try {
    const client = await prisma.clients.findUnique({ // Use plural 'clients'
      where: { id: clientId },
      // You might add `include: { contracts: true }` here later if you want to list related contracts
    });

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client, { status: 200 });
  } catch (error) {
    console.error(`API Error (GET /clients/${clientId}): Failed to fetch client:`, error);
    return NextResponse.json(
      { message: `Failed to fetch client ${clientId}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT method: Update a single client by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) { // <-- CHANGED SIGNATURE
  const clientId = params.id; // <-- Access params.id directly

  if (!clientId) {
    return NextResponse.json({ message: 'Client ID is required for update' }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Basic validation: Client Name is required
    if (!body.name) {
      return NextResponse.json(
        { message: 'Client Name is required' },
        { status: 400 }
      );
    }

    const updatedClient = await prisma.clients.update({ // Use plural 'clients'
      where: { id: clientId },
      data: {
        name: body.name,
        contact_person: body.contact_person || null,
        contact_email: body.contact_email || null,
        contact_phone: body.contact_phone || null,
        address: body.address || null,
        updated_at: new Date(), // Manually update the timestamp
      },
    });

    return NextResponse.json(updatedClient, { status: 200 }); // 200 OK
  } catch (error) {
    console.error(`API Error (PUT /clients/${clientId}): Failed to update client:`, error);
    // Handle specific Prisma errors (e.g., unique constraint violation for client name if changed)
    if ((error as any).code === 'P2002') { // Prisma error code for Unique constraint failed
      return NextResponse.json(
        { message: `Client with name "${body.name}" already exists. Please use a unique name.` },
        { status: 409 } // Conflict
      );
    }
    return NextResponse.json(
      { message: `Failed to update client ${clientId}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE method: Delete a single client by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) { // <-- CHANGED SIGNATURE
  const clientId = params.id; // <-- Access params.id directly

  if (!clientId) {
    return NextResponse.json({ message: 'Client ID is required for deletion' }, { status: 400 });
  }

  try {
    const deletedClient = await prisma.clients.delete({ // Use plural 'clients'
      where: { id: clientId },
    });

    // Respond with success
    return NextResponse.json({ message: `Client "${deletedClient.name}" deleted successfully` }, { status: 200 });
    // Or simply: return new NextResponse(null, { status: 204 }); // 204 No Content, if you prefer no body
  } catch (error) {
    console.error(`API Error (DELETE /clients/${clientId}): Failed to delete client:`, error);
    if ((error as any).code === 'P2025') { // Prisma error code for RecordNotFound
      return NextResponse.json({ message: 'Client not found for deletion' }, { status: 404 });
    }
    // Handle foreign key constraint if client has associated contracts
    if ((error as any).code === 'P2003') { // Prisma error code for Foreign key constraint failed
      return NextResponse.json(
        { message: `Client "${clientId}" cannot be deleted as it has associated records (e.g., contracts). Delete associated records first.` },
        { status: 409 } // Conflict
      );
    }
    return NextResponse.json(
      { message: `Failed to delete client ${clientId}`, error: (error as Error).message },
      { status: 500 }
    );
  }
}