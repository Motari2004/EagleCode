import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Get user credits from backend
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 400 });
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/credits?user_id=${userId}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Credits API error:", error);
    // Return fallback credits
    return NextResponse.json({
      plan: "free",
      dailyRemaining: 5,
      monthlyRemaining: 30,
      dailyUsed: 0,
      monthlyUsed: 0,
      dailyLimit: 5,
      monthlyLimit: 30,
      error: true
    });
  }
}

// Deduct credits via backend
export async function POST(request: NextRequest) {
  const { userId, credits } = await request.json();
  
  if (!userId || !credits) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/credits/deduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, credits })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json({ error: data.detail || "Failed to deduct credits" }, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Deduct credits error:", error);
    return NextResponse.json({ error: "Failed to connect to backend" }, { status: 500 });
  }
}