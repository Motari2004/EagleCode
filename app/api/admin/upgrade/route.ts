import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// This must be at the top level, outside any function
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { userId, plan } = await request.json();

  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  // Validate plan
  const validPlans = ['free', 'pro', 'business'];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Create Neon connection inside the handler
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    return NextResponse.json({ error: "Database configuration error" }, { status: 500 });
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    await sql`
      UPDATE user_credits
      SET plan = ${plan}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;

    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error("Failed to upgrade user:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}