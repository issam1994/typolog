import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/db/auth";
import { getTest, getAllTraits } from "@/lib/db/queries";
import { createQuestion } from "@/lib/db/mutations";
import {
  parseCSVRows,
  normalizeFromCSV,
  normalizeFromJSON,
  type ImportError,
  type JSONRow,
  type NormalizedQuestion,
} from "@/lib/import/parse";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const test = await getTest(slug);
  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const text = await file.text();
  const fileName = file.name.toLowerCase();

  const traits = await getAllTraits(test.id);
  const traitBySlug = new Map(traits.map((t) => [t.slug, t.id]));

  const errors: ImportError[] = [];
  let normalized: NormalizedQuestion[] = [];

  if (fileName.endsWith(".json")) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { created: 0, errors: [{ row: 0, message: "Invalid JSON" }] },
        { status: 400 },
      );
    }
    if (!Array.isArray(parsed)) {
      return NextResponse.json(
        {
          created: 0,
          errors: [{ row: 0, message: "JSON must be an array of questions" }],
        },
        { status: 400 },
      );
    }
    normalized = normalizeFromJSON(parsed as JSONRow[], traitBySlug, errors);
  } else {
    const rows = parseCSVRows(text);
    normalized = normalizeFromCSV(rows, traitBySlug, errors);
  }

  let created = 0;
  for (const q of normalized) {
    const result = await createQuestion(
      test.id,
      q.kind === "likert"
        ? {
            kind: "likert",
            text: q.text,
            traitId: q.traitId,
            reverseKeyed: q.reverseKeyed,
          }
        : { kind: "forced_choice", text: q.text, options: q.options },
    );
    if (result.error) {
      errors.push({ row: 0, message: result.error });
    } else {
      created++;
    }
  }

  return NextResponse.json({ created, errors });
}
