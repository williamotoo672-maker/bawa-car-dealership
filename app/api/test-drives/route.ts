import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Public: anyone (signed in or not) can request a test drive.
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const allowed = await checkRateLimit(`test-drive:${ip}`, 8, 10 * 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { car_id, name, email, phone, preferred_date, preferred_time, message, website } = body;

    // Honeypot: silently accept but never write it to the database.
    if (website) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (!name || !email || !preferred_date) {
      return NextResponse.json(
        { error: "Name, email and a preferred date are required." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

    await sql`
      INSERT INTO test_drives (car_id, user_id, name, email, phone, preferred_date, preferred_time, message)
      VALUES (${car_id ?? null}, ${userId}, ${name}, ${email}, ${phone ?? null}, ${preferred_date}, ${preferred_time ?? null}, ${message ?? null})
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not book your test drive. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only (gated in middleware.ts)
export async function GET() {
  try {
    const rows = await sql`
      SELECT test_drives.*, cars.make, cars.model, cars.year
      FROM test_drives
      LEFT JOIN cars ON cars.id = test_drives.car_id
      ORDER BY test_drives.created_at DESC
    `;
    return NextResponse.json({ testDrives: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load bookings" }, { status: 500 });
  }
}
