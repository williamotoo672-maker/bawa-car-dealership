import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["pending", "confirmed", "completed", "cancelled"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [row] = await sql`
      UPDATE test_drives SET status = ${status} WHERE id = ${id} RETURNING *
    `;
    if (!row) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ testDrive: row });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not update booking" }, { status: 500 });
  }
}
