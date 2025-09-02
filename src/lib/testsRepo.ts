import {
    addDoc, collection, deleteDoc, doc, getDoc, onSnapshot,
    orderBy, query, updateDoc
  } from "firebase/firestore";
  import { db } from "./firebaseClient";
  import type { UITest } from "@/types/test";
  import { auth } from "./firebaseClient";
  
  const TESTS = "tests";
  
  export function listenTests(
    cb: (items: UITest[]) => void,
    onError?: (e: Error) => void
  ): () => void {
    const q = query(collection(db, TESTS), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const list: UITest[] = snap.docs.map((d) => {
          const data = d.data() as Omit<UITest, "id">;
          return { ...data, id: d.id };
        });
        cb(list);
      },
      (err) => onError?.(err as Error)
    );
  }
  
  export async function getTestById(id: string): Promise<UITest | null> {
    const ref = doc(db, TESTS, id);
    const s = await getDoc(ref);
    if (!s.exists()) return null;
    const data = s.data() as Omit<UITest, "id">;
    return { ...data, id: s.id };
  }
  
  export async function addTest(
    test: Omit<UITest, "id" | "createdAt" | "createdBy">
  ): Promise<string> {
    const uid = auth.currentUser?.uid ?? "anonymous";
  
    const payload: Record<string, unknown> = {
      name: test.name,
      createdBy: uid,
      createdAt: Date.now(),
    };
  
    if (test.description) payload.description = test.description;
    if (test.questions && test.questions.length) {
      payload.questions = test.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        correctAnswer: q.correctAnswer,
        points: q.points ?? 1,
        ...(q.options && q.options.length ? { options: q.options } : {}),
        ...(q.topic ? { topic: q.topic } : {}),
      }));
    }
  
    console.dir({ payloadToFirestore: payload }, { depth: null }); // debug
  
    const docRef = await addDoc(collection(db, "tests"), payload);
    return docRef.id;
  }
  
  
  export async function updateTest(id: string, patch: Partial<Omit<UITest, "id">>): Promise<void> {
    const ref = doc(db, TESTS, id);
    await updateDoc(ref, patch);
  }
  
  export async function deleteTest(id: string): Promise<void> {
    const ref = doc(db, TESTS, id);
    await deleteDoc(ref);
  }
  