import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const allowed = await checkRateLimit(`financing:${ip}`, 5, 10 * 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      car_id,
      name,
      email,
      phone,
      employment_status,
      monthly_income,
      down_payment,
      message,
      website,
    } = body;

    // Honeypot: silently accept but never write it to the database.
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
      INSERT INTO financing_applications
        (car_id, user_id, name, email, phone, employment_status, monthly_income, down_payment, message)
      VALUES
        (${car_id ?? null}, ${userId}, ${name}, ${email}, ${phone ?? null}, ${employment_status ?? null},
         ${monthly_income ?? null}, ${down_payment ?? null}, ${message ?? null})
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not submit your application. Please try again." },
      { status: 500 }
    );
  }
}

// Admin-only (gated in middleware.ts)
export async function GET() {
  try {
    const rows = await sql`
      SELECT financing_applications.*, cars.make, cars.model, cars.year
      FROM financing_applications
      LEFT JOIN cars ON cars.id = financing_applications.car_id
      ORDER BY financing_applications.created_at DESC
    `;
    return NextResponse.json({ applications: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load applications" }, { status: 500 });
  }
}
