// One-time setup script: creates every table this project uses on your
// Neon database, and (optionally) seeds a few sample cars so the site
// isn't empty on first load. Safe to re-run any time — every statement is
// IF NOT EXISTS, so it never touches data that's already there.
//
// Usage:
//   1. Add DATABASE_URL to a .env.local file in the project root
//   2. npm run db:init

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Minimal .env.local loader so this script works without extra deps
function loadEnvLocal() {
  const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
  try {
    const contents = readFileSync(envPath, "utf-8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // no .env.local, that's fine if DATABASE_URL is already set in the shell
  }
}

loadEnvLocal();

if (!process.env.DATABASE_URL) {
  console.error(
    "Missing DATABASE_URL. Add it to a .env.local file or export it in your shell."
  );
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Creating `cars` table if it doesn't exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS cars (
      id SERIAL PRIMARY KEY,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      price NUMERIC(12, 2) NOT NULL,
      mileage INTEGER,
      body_type TEXT,
      fuel_type TEXT,
      transmission TEXT,
      color TEXT,
      description TEXT,
      image_url TEXT,
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'available',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  console.log("Creating `users` table if it doesn't exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      image TEXT,
      provider TEXT NOT NULL DEFAULT 'credentials',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  console.log("Creating `enquiries` table if it doesn't exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS enquiries (
      id SERIAL PRIMARY KEY,
      car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      preferred_contact TEXT,
      message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  console.log("Creating `favorites` table if it doesn't exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      car_id INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (user_id, car_id)
    );
  `;

  console.log("Creating `test_drives` table if it doesn't exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS test_drives (
      id SERIAL PRIMARY KEY,
      car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      preferred_date DATE,
      preferred_time TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  console.log("Creating `financing_applications` table if it doesn't exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS financing_applications (
      id SERIAL PRIMARY KEY,
      car_id INTEGER REFERENCES cars(id) ON DELETE SET NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      employment_status TEXT,
      monthly_income NUMERIC(12, 2),
      down_payment NUMERIC(12, 2),
      message TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  console.log("Creating `rate_limits` table if it doesn't exist...");
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 1,
      window_start TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM cars`;

  if (count === 0) {
    console.log("Seeding a few sample listings...");
    await sql`
      INSERT INTO cars
        (make, model, year, price, mileage, body_type, fuel_type, transmission, color, description, image_url, featured, status)
      VALUES
        ('Mercedes-Benz', 'S-Class S580', 2024, 148500, 1200, 'Sedan', 'Petrol', 'Automatic', 'Obsidian Black',
         'The flagship of refinement. Air suspension, massage seats, and a cabin engineered for silence.',
         'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=1600&auto=format&fit=crop', true, 'available'),
        ('Range Rover', 'Autobiography', 2023, 132000, 8400, 'SUV', 'Petrol', 'Automatic', 'Santorini Black',
         'Commanding presence, plush leather cabin, and effortless capability on any terrain.',
         'https://images.unsplash.com/photo-1606611013016-969c19ba7d6f?q=80&w=1600&auto=format&fit=crop', true, 'available'),
        ('Porsche', '911 Carrera S', 2024, 156000, 300, 'Coupe', 'Petrol', 'Automatic', 'GT Silver',
         'A modern icon. Precision engineering wrapped in a silhouette that never dates.',
         'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=1600&auto=format&fit=crop', true, 'available'),
        ('BMW', '760i xDrive', 2023, 118900, 6200, 'Sedan', 'Petrol', 'Automatic', 'Alpine White',
         'Effortless power meets first-class comfort, front and back.',
         'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1600&auto=format&fit=crop', false, 'available'),
        ('Bentley', 'Continental GT', 2022, 219000, 4100, 'Coupe', 'Petrol', 'Automatic', 'British Racing Green',
         'Handcrafted luxury at true grand-touring pace.',
         'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?q=80&w=1600&auto=format&fit=crop', false, 'available'),
        ('Toyota', 'Land Cruiser GR Sport', 2024, 92500, 2100, 'SUV', 'Diesel', 'Automatic', 'Precious White Pearl',
         'Unstoppable reliability with a cabin built for every kind of journey.',
         'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1600&auto=format&fit=crop', false, 'available');
    `;
  } else {
    console.log(`Table already has ${count} row(s) — skipping seed.`);
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
