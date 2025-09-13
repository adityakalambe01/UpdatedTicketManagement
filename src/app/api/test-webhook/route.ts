import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    message: "Webhook endpoint is working!",
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  console.log("=== TEST WEBHOOK RECEIVED ===");
  console.log("Headers:", Object.fromEntries(req.headers.entries()));
  
  const body = await req.text();
  console.log("Body:", body);
  
  return NextResponse.json({ 
    status: "received", 
    timestamp: new Date().toISOString() 
  });
}