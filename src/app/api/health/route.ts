import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "OK",
    service: "Gestalt Arena",
    authentication: "Pending",
    database: "Connected",
  });
}