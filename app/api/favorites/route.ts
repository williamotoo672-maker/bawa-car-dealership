import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ carIds: [] });
  }

  try {
    const rows = await sql`
      SELECT car_id FROM favorites WHERE user_id = ${Number(session.user.id)}
    `;
    return NextResponse.json({ carIds: rows.map((r) => r.car_id) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ carIds: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Sign in to save favorites." },
      { status: 401 }
    );
  }

  try {
    const { car_id } = await req.json();
    if (!car_id) {
      return NextResponse.json({ error: "car_id is required" }, { status: 400 });
    }
    const userId = Number(session.user.id);

    const [existing] = await sql`
      SELECT id FROM favorites WHERE user_id = ${userId} AND car_id = ${car_id}
    `;

    if (existing) {
      await sql`DELETE FROM favorites WHERE id = ${existing.id}`;
      return NextResponse.json({ favorited: false });
    } else {
      await sql`INSERT INTO favorites (user_id, car_id) VALUES (${userId}, ${car_id})`;
      return NextResponse.json({ favorited: true });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not update favorites." },
      { status: 500 }
    );
  }
}
