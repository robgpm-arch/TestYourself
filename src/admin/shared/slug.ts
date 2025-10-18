export function slugify(input: string) {
  return (input || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildSlugSuggestions(name: string, ctx?: {
  medium?: string; board?: string; examName?: string;
}) {
  const base = slugify(name);
  const med  = ctx?.medium ? slugify(ctx.medium) : "";
  const brd  = ctx?.board  ? slugify(ctx.board)  : "";
  const exm  = ctx?.examName ? slugify(ctx.examName) : "";

  const out = new Set<string>([
    base,
    [base, med].filter(Boolean).join("-"),
    [base, brd].filter(Boolean).join("-"),
    [base, exm].filter(Boolean).join("-"),
    [med, base].filter(Boolean).join("-"),
    [base, "practice"].filter(Boolean).join("-")
  ]);
  return [...out].filter(Boolean);
}