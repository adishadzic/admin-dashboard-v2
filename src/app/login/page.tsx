"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebaseClient";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const login = async () => {
    try {
      setError("");
      const cred = await signInWithPopup(auth, googleProvider);
      const u = cred.user;
      const email = u.email ?? "";

      const isProfessor = email.endsWith("@unipu.hr");
      const isStudent = email.endsWith("@student.unipu.hr");

      if (!isProfessor && !isStudent) {
        setError("Prijava dopuštena samo za @unipu.hr ili @student.unipu.hr račune.");
        // signOut nije nužan; korisnik može kliknuti ponovno s drugim računom
        return;
      }

      // Upis/merge user dokumenta s ulogom
      await setDoc(
        doc(db, "users", u.uid),
        {
          email,
          displayName: u.displayName ?? "",
          photoURL: u.photoURL ?? "",
          role: isProfessor ? "professor" : "student",
          updatedAt: Date.now(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      await setDoc(
        doc(db, "students", u.uid),
        {
          fullName: u.displayName ?? "Nepoznato ime",
          email: u.email ?? "",
          jmbag: "", 
          year: 1,
          authUid: u.uid,
          createdAt: Date.now(),
        },
        { merge: true }
      );

      router.replace("/");
    } catch (e) {
      console.error(e);
      setError("Neuspjela prijava. Pokušajte ponovno.");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-600">Provjera stanja prijave…</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Prijava</h1>
        <p className="text-sm text-gray-600 mb-6">
          Dozvoljene domene: <strong>@unipu.hr</strong> (profesori) i{" "}
          <strong>@student.unipu.hr</strong> (studenti).
        </p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
            <path d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.4h147.4c-6.4 34.6-25.6 63.9-54.5 83.5l88.1 68.4c51.5-47.5 80.5-117.5 80.5-196.9z" fill="#4285f4"/>
            <path d="M272 544.3c73.7 0 135.5-24.3 180.7-66l-88.1-68.4c-24.4 16.4-55.4 26.1-92.6 26.1-71.2 0-131.6-48-153.2-112.4l-90.5 69.9c44.5 88.1 135.5 151.8 243.7 151.8z" fill="#34a853"/>
            <path d="M118.8 323.6c-10.6-31.9-10.6-66.3 0-98.2L28.3 155.5c-40.6 81.2-40.6 177.4 0 258.6l90.5-69.9z" fill="#fbbc04"/>
            <path d="M272 107.7c38.8 0 73.7 13.4 101.2 39.6l75.6-75.6C407.5 24.7 345.7 0 272 0 163.8 0 72.8 63.7 28.3 155.5l90.5 69.9c21.6-64.4 82-112.4 153.2-112.4z" fill="#ea4335"/>
          </svg>
          <span className="font-medium">Prijavi se Google računom</span>
        </button>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
}
