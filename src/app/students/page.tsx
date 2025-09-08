"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteStudentById } from "@/lib/studentsRepo";
import type { StudentYear } from "@/types/student";
import { Button } from "@/components/ui/button";
import { useStudents } from "@/hooks/useStudent";
import { useRole } from "@/hooks/useRole";
import AddStudentDialog from "@/components/AddStudentDialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

const YEARS: StudentYear[] = [1, 2, 3, 4, 5];

export default function StudentsPage() {
  const router = useRouter();
  const role = useRole();

  const { students, loading, error } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState<number | "All">("All");
  const [openAdd, setOpenAdd] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const testsPerPage = 2;

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return (students ?? []).filter((s) => {
      const matchesSearch =
        !term ||
        s.fullName.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.jmbag.toLowerCase().includes(term);
      const matchesYear = yearFilter === "All" || s.year === yearFilter;
      return matchesSearch && matchesYear;
    });
  }, [students, searchTerm, yearFilter]);

  const indexOfLastTest = currentPage * testsPerPage;
  const indexOfFirstTest = indexOfLastTest - testsPerPage;
  const currentTests = filteredStudents.slice(
    indexOfFirstTest,
    indexOfLastTest
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredStudents.length / testsPerPage)
  );

  async function handleDelete(id: string) {
    const ok = confirm("Obrisati studenta?");
    if (!ok) return;
    await deleteStudentById(id);
  }

  if (role === "student") {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Pristup odbijen
        </h1>
        <p className="text-gray-600">
          Ova stranica je dostupna samo profesorima.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Studenti</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Ukupno studenata: {students?.length ?? 0}
          </div>
          <Button onClick={() => setOpenAdd(true)}>Dodaj studenta</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Pretraži po imenu, emailu ili JMBAG-u…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="xl:w-[370px] text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

            <select
              value={yearFilter}
              onChange={(e) =>
                setYearFilter(
                  e.target.value === "All" ? "All" : Number(e.target.value)
                )
              }
              className="text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">Sve godine</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}. godina
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Učitavam…</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">Greška: {error}</div>
          ) : filteredStudents.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              Nema studenata.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ime i prezime
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    JMBAG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Godina studija
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcije
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTests.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => router.push(`/students/${s.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {s.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {s.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {s.jmbag}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {s.year}. godina
                    </td>
                    <td
                      className="px-6 py-4 whitespace-nowrap text-sm font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(s.id)}
                      >
                        Obriši
                      </button>
                    </td>
                  </tr>
                ))}

                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
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
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages} (
                    {filteredStudents.length} items)
                  </span>
                </div>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AddStudentDialog open={openAdd} onOpenChange={setOpenAdd} />
    </div>
  );
}
