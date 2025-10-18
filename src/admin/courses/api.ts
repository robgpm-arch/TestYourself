import {
  addDoc, collection, doc, getDoc, getDocs, query, where, serverTimestamp, setDoc, limit, onSnapshot, orderBy, QueryConstraint
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CourseCatalog, CourseInstance } from "./model";
import { CourseFilters, normBoard, normExam } from "./filterUtils";

export async function createCatalogCourse(seed: Omit<CourseCatalog, "id" | "slug"> & { slug?: string }) {
  const payload = {
    name: seed.name.trim(),
    slug: (seed.slug ?? seed.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    emoji: seed.emoji ?? null,
    colorHex: seed.colorHex ?? null,
    description: seed.description ?? null,
    tags: seed.tags ?? [],
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, "course_catalog"), payload);
  return ref.id;
}

/** Enforce: medium required AND (board OR exam) */
export function contextValid(ctx: { medium?: string; board?: string | null; examId?: string | null }) {
  const hasMedium = !!ctx.medium;
  const hasOne = !!(ctx.board && ctx.board !== "All Boards") || !!(ctx.examId && ctx.examId !== "All Exams");
  return hasMedium && hasOne;
}

/**
 * Ensure a context instance exists for catalogId + (medium, board|exam).
 * Reuses existing; creates if missing. Returns instance id.
 */
export async function ensureCourseInstance(opts: {
  catalogId: string;
  medium: string;
  board?: string | null;
  examId?: string | null;
  order?: number;
}) {
  if (!contextValid(opts)) throw new Error("Medium and either Board or Exam are required.");

  const ref = collection(db, "courses");
  const cs = [
    where("catalogId", "==", opts.catalogId),
    where("medium", "==", opts.medium),
  ];
  if (opts.board && opts.board !== "All Boards") cs.push(where("board", "==", opts.board));
  if (opts.examId && opts.examId !== "All Exams") cs.push(where("examId", "==", opts.examId));

  const q = query(ref, ...cs, limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id; // reuse

  // Need catalog name for denormalized instance
  const cat = await getDoc(doc(db, "course_catalog", opts.catalogId));
  if (!cat.exists()) throw new Error("Catalog course not found");
  const name = (cat.data() as CourseCatalog).name;

  const payload = {
    catalogId: opts.catalogId,
    name,
    medium: opts.medium,
    board: opts.board ?? null,
    examId: opts.examId ?? null,
    order: opts.order ?? 1,
    enabled: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const created = await addDoc(collection(db, "courses"), payload);
  return created.id;
}

export function listenCourses(filters: CourseFilters, cb: (rows:any[])=>void) {
  const cs: QueryConstraint[] = [ where("medium","==", filters.medium) ];

  const board = normBoard(filters.board);
  const exam  = normExam(filters.examId);
  if (board) cs.push(where("board", "==", board));
  if (exam)  cs.push(where("examId", "==", exam));

  cs.push(orderBy("order"));

  const q = query(collection(db, "courses"), ...cs);
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
}