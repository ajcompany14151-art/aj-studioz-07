// api/users.ts (New API for user data - usage stats, premium)
import { neon } from '@neondatabase/server';
import type { NextRequest } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

// GET: Fetch user profile and stats
export async function GET(request: NextRequest) {
  const userId = request.headers.get('user-id');
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const user = await sql`
      SELECT id, name, email, photo_url as "photoUrl", is_premium as "isPremium", queries_this_month as "queriesThisMonth"
      FROM users 
      WHERE id = ${userId}
    `;
    if (!user.length) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }
    return new Response(JSON.stringify(user[0]), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user' }), { status: 500 });
  }
}

// POST: Update queries count (after each message)
export async function POST(request: NextRequest) {
  const userId = request.headers.get('user-id');
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await sql`
      UPDATE users 
      SET queries_this_month = queries_this_month + 1 
      WHERE id = ${userId}
    `;
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update usage' }), { status: 500 });
  }
}
