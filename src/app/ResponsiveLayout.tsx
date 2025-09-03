"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StudentHeader from "@/components/StudentHeader";
import { useRole } from "@/hooks/useRole";
import { useTests } from "@/hooks/useTests";

export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  const role = useRole();
  const { tests } = useTests();

  if (role === null) {
    return <div className="p-6 text-gray-500">Učitavanje…</div>;
  }

  const isProfessor = role === "professor";

  if (!isProfessor) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex flex-col overflow-hidden">
          <StudentHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header tests={tests} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
