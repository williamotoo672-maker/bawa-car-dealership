import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    // 8 signups per hour per IP — generous for real users, blunt for
    // automated account-creation spam.
    const allowed = await checkRateLimit(`signup:${ip}`, 8, 60 * 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, password, website } = await req.json();

    // Honeypot: a real browser never fills this hidden field, bots often do.
    if (website) {
      return NextResponse.json({ success: true }, { status: 201 });
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are all required." },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const [existing] = await sql`
      SELECT id FROM users WHERE email = ${normalizedEmail}
    `;
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try signing in instead." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (name, email, password_hash, provider)
      VALUES (${name}, ${normalizedEmail}, ${passwordHash}, 'credentials')
    `;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not create your account. Please try again." },
      { status: 500 }
    );
  }
}
