"use client";

import * as React from "react";
import type { UITest } from "@/types/test";
import { listenTests, addTest as repoAdd, deleteTest as repoDelete, updateTest as repoUpdate } from "@/lib/testsRepo";

export function useTests() {
  const [tests, setTests] = React.useState<UITest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsub = listenTests(
      (items) => {
        setTests(items);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  async function addTest(test: Omit<UITest, "id" | "createdAt" | "createdBy">) {
    return repoAdd(test);
  }
  async function updateTest(id: string, patch: Partial<Omit<UITest, "id">>) {
    return repoUpdate(id, patch);
  }
  async function deleteTest(id: string) {
    return repoDelete(id);
  }

  return { tests, loading, error, addTest, updateTest, deleteTest };
}
