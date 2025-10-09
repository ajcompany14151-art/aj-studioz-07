// api/chats.ts (New serverless function for Neon DB - Vercel API route)
import { neon } from '@neondatabase/server';
import type { NextRequest } from 'next/server'; // For Vercel compatibility

const sql = neon(process.env.DATABASE_URL!);

// GET: Fetch all saved chats for user
export async function GET(request: NextRequest) {
  const userId = request.headers.get('user-id'); // Assume auth middleware sets this
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const chats = await sql`
      SELECT id, name, timestamp, messages 
      FROM saved_chats 
      WHERE user_id = ${userId} 
      ORDER BY timestamp DESC
    `;
    return new Response(JSON.stringify(chats), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch chats' }), { status: 500 });
  }
}

// POST: Save new chat
export async function POST(request: NextRequest) {
  const userId = request.headers.get('user-id');
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const { name, messages } = await request.json();

  try {
    const result = await sql`
      INSERT INTO saved_chats (user_id, name, timestamp, messages) 
      VALUES (${userId}, ${name}, NOW(), ${JSON.stringify(messages)}) 
      RETURNING id
    `;
    return new Response(JSON.stringify({ id: result[0].id }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to save chat' }), { status: 500 });
  }
}

// DELETE: Delete chat by ID
export async function DELETE(request: NextRequest) {
  const userId = request.headers.get('user-id');
  const { id } = await request.json();

  if (!userId || !id) {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  try {
    await sql`
      DELETE FROM saved_chats 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete chat' }), { status: 500 });
  }
}
