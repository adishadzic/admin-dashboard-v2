"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebaseClient";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./useAuth";

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return setRole(null);
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      setRole((snap.data()?.role as string) ?? null);
    });
    return () => unsub();
  }, [user]);

  return role;
}
