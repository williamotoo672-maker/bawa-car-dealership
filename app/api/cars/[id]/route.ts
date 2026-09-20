import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [car] = await sql`SELECT * FROM cars WHERE id = ${id}`;
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }
    return NextResponse.json({ car });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load car" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const [car] = await sql`
      UPDATE cars SET
        make = ${make},
        model = ${model},
        year = ${year},
        price = ${price},
        mileage = ${mileage ?? null},
        body_type = ${body_type ?? null},
        fuel_type = ${fuel_type ?? null},
        transmission = ${transmission ?? null},
        color = ${color ?? null},
        description = ${description ?? null},
        image_url = ${image_url ?? null},
        featured = ${featured ?? false},
        status = ${status ?? "available"},
        updated_at = now()
      WHERE id = ${id}
      RETURNING *;
    `;

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath(`/cars/${id}`);
    revalidatePath("/admin");

    return NextResponse.json({ car });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update car" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [car] = await sql`
      DELETE FROM cars WHERE id = ${id} RETURNING id;
    `;
    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/inventory");
    revalidatePath(`/cars/${id}`);
    revalidatePath("/admin");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to delete car" },
      { status: 500 }
    );
  }
}
