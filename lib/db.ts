import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL is not set. Add it to your .env.local file (see .env.example)."
  );
}

// Tagged-template SQL client. Usage: await sql`select * from cars`
export const sql = neon(process.env.DATABASE_URL || "");

export type Car = {
  id: number;
  make: string;
  model: string;
  year: number;
  price: string; // numeric comes back as string from Postgres
  mileage: number | null;
  body_type: string | null;
  fuel_type: string | null;
  transmission: string | null;
  color: string | null;
  description: string | null;
  image_url: string | null;
  featured: boolean;
  status: "available" | "sold" | "reserved";
  created_at: string;
  updated_at: string;
};
