import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const status = req.nextUrl.searchParams.get("status");
    const rows = status
      ? await sql`SELECT * FROM cars WHERE status = ${status} ORDER BY featured DESC, created_at DESC`
      : await sql`SELECT * FROM cars ORDER BY featured DESC, created_at DESC`;
    return NextResponse.json({ cars: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to load cars" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      make,
      model,
      year,
      price,
      mileage,
      body_type,
      fuel_type,
      transmission,
      color,
      description,
      image_url,
      featured,
      status,
    } = body;

    if (!make || !model || !year || !price) {
      return NextResponse.json(
        { error: "make, model, year and price are required" },
        { status: 400 }
      );
    }

    const [car] = await sql`
      INSERT INTO cars
        (make, model, year, price, mileage, body_type, fuel_type, transmission, color, description, image_url, featured, status)
      VALUES
        (${make}, ${model}, ${year}, ${price}, ${mileage ?? null}, ${body_type ?? null}, ${fuel_type ?? null},
         ${transmission ?? null}, ${color ?? null}, ${description ?? null}, ${image_url ?? null},
         ${featured ?? false}, ${status ?? "available"})
      RETURNING *;
    `;

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath("/admin");

    return NextResponse.json({ car }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create car" },
      { status: 500 }
    );
  }
}
