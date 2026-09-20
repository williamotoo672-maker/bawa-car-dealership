import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // 8 enquiries per 10 minutes per IP — plenty for a real shopper
    // looking at several cars, blunt for a scripted spam flood.
    const allowed = await checkRateLimit(`enquiry:${ip}`, 8, 10 * 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { car_id, name, email, phone, preferred_contact, message, website } = body;

    // Honeypot: silently accept (so a bot can't tell it was caught) but
    // never write it to the database.
    if (website) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required." },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ? Number(session.user.id) : null;

    await sql`
      INSERT INTO enquiries (car_id, user_id, name, email, phone, preferred_contact, message)
      VALUES (${car_id ?? null}, ${userId}, ${name}, ${email}, ${phone ?? null}, ${preferred_contact ?? null}, ${message ?? null})
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not send your request. Please try again." },
      { status: 500 }
    );
  }
}

// Reads are gated by the dealer admin session in middleware.ts.
export async function GET() {
  try {
    const rows = await sql`
      SELECT
        enquiries.*,
        cars.make, cars.model, cars.year
      FROM enquiries
      LEFT JOIN cars ON cars.id = enquiries.car_id
      ORDER BY enquiries.created_at DESC
    `;
    return NextResponse.json({ enquiries: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load enquiries" },
      { status: 500 }
    );
  }
}
