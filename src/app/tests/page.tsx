"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import GenerateTestDialog from "@/components/GenerateTestDialog";
import { useTests } from "@/hooks/useTests";
import { estimateDuration } from "@/helpers/calculateMinutes";
import { downloadTestAsDocx } from "@/lib/exportDoc";
import { formatDate } from "@/helpers/formatDate";
import { RequireProfessor } from "@/components/guards";

const TestsPage: React.FC = () => {
  const { tests, loading, error, addTest, deleteTest } = useTests();

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openGen, setOpenGen] = useState(false);

  const testsPerPage = 5;

  const filteredTests = (tests ?? []).filter((test) =>
    (test.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredTests.slice(indexOfFirstTest, indexOfLastTest);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTests.length / testsPerPage)
  );

  return (
    <RequireProfessor>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Kontrolne zadaće
          </h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Pretraži testove..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <Button onClick={() => setOpenGen(true)} className="cursor-pointer">
                <Bot />
                Generiraj kontrolnu zadaću
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-gray-500">Učitavam...</div>
          ) : error ? (
            <div className="p-8 text-red-600">Greška: {error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left text-xs p-4 font-medium text-gray-600 uppercase">
                        Naziv testa
                      </th>
                      <th className="text-left text-xs p-4 font-medium text-gray-600 uppercase">
                        Datum kreiranja
                      </th>
                      <th className="text-left text-xs p-4 font-medium text-gray-600 uppercase">
                        Trajanje
                      </th>
                      <th className="text-left text-xs p-4 font-medium w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTests.map((test) => (
                      <tr
                        key={String(test.id)}
                        className="text-black border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <Link
                            href={`/tests/${test.id}`}
                            className="flex items-center space-x-3 group"
                          >
                            <span className="font-medium text-gray-900 group-hover:text-blue-600">
                              {test.name}
                            </span>
                          </Link>
                        </td>
                        <td className="p-4 text-gray-600">
                          {formatDate(test.createdAt) ?? "—"}
                        </td>
                        <td className="p-4 text-gray-600">
                          {estimateDuration(test)}
                        </td>
                        <td className="text-black p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild className="cursor-pointer">
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="z-50 min-w-[8rem] bg-white border border-gray-200 shadow-md rounded-md p-1">
                              <DropdownMenuItem
                                onClick={() =>
                                  downloadTestAsDocx(test, {
                                    includeAnswerKey: true,
                                    course: "Osnove informatike",
                                    dateLabel: "Rok: 12.09.2025",
                                    durationLabel: "Trajanje: 45 min",
                                    studentLine: true,
                                  })
                                }
                                className="cursor-pointer"
                              >
                                Download (.docx)
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={async () => {
                                  const ok = window.confirm(
                                    "Jesi li siguran/na da želiš obrisati ovu kontrolnu zadaću?"
                                  );
                                  if (!ok) return;
                                  try {
                                    await deleteTest(test.id);
                                  } catch (e) {
                                    console.error(e);
                                    alert("Greška pri brisanju testa.");
                                  }
                                }}
                                className="text-red-600 focus:text-red-700 cursor-pointer"
                              >
                                Obriši
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredTests.length === 0 && (
                <div className="text-center p-8 text-gray-500">
                  Nema pronađenih testova.
                </div>
              )}

              <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages} ({filteredTests.length}{" "}
                  items)
                </span>
              </div>
            </>
          )}
        </div>

        <GenerateTestDialog
          open={openGen}
          onOpenChange={setOpenGen}
          saveTest={(t) => addTest(t)}
          onSaved={() => {}}
        />
      </div>
    </RequireProfessor>
  );
};

export default TestsPage;
