'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
// import { Toaster } from '@/components/ui/toaster';
import useLocalStorage from '@/hooks/useLocalStorage';
import { initialTests } from '@/lib/data';
import type { SectionId } from '@/types';
import Header from '@/components/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');

  const [tests] = useLocalStorage('tests', initialTests);
  // const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  // const handleAddStudent = (newStudent: Students) => {
  //   setStudents([...students, newStudent]);
  // };

  // const handleAddTest = (newTest: Test) => {
  //   setTests([...tests, newTest]);
  // };

  // const viewStudentProfile = (studentId: number) => {
  //   setSelectedStudentId(studentId);
  //   setActiveSection('studentProfile');
  // };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setActiveSection={setActiveSection} tests={tests} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      {/* <Toaster /> */}
    </div>
  );
}
