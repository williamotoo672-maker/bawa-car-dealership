import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const dynamic = "force-dynamic";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB

// Checks the file's actual bytes rather than trusting the client-reported
// MIME type, which is trivial to spoof (e.g. renaming a .html file to
// .jpg). This stops someone uploading an HTML/SVG file that could run
// script when opened directly, disguised as an image.
function matchesImageSignature(bytes: Uint8Array, mimeType: string): boolean {
  const hex = (start: number, end: number) =>
    Array.from(bytes.slice(start, end))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  switch (mimeType) {
    case "image/jpeg":
      return hex(0, 3) === "ffd8ff";
    case "image/png":
      return hex(0, 8) === "89504e470d0a1a0a";
    case "image/webp":
      return hex(0, 4) === "52494646" && hex(8, 12) === "57454250";
    case "image/avif":
      // AVIF is an ISO-BMFF file with an "ftyp" box whose brand starts
      // with "avif" or "avis", found a few bytes in.
      return hex(4, 8) === "66747970" && /avif|avis/.test(
        new TextDecoder().decode(bytes.slice(8, 16))
      );
    default:
      return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WEBP or AVIF images are allowed" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image must be smaller than 8MB" },
        { status: 400 }
      );
    }

    const headerBytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    if (!matchesImageSignature(headerBytes, file.type)) {
      return NextResponse.json(
        { error: "This file doesn't look like a valid image. Please try a different file." },
        { status: 400 }
      );
    }

    const filename = `cars/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Upload failed. Check that BLOB_READ_WRITE_TOKEN is set." },
      { status: 500 }
    );
  }
}
