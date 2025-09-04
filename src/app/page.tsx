"use client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  MoreHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTests } from "@/hooks/useTests";
import { estimateDuration } from "@/helpers/calculateMinutes";
import { formatDate } from "@/helpers/formatDate";
import { useStudents } from "@/hooks/useStudent";
import { Student } from "@/types/student";
import { RequireProfessor } from "@/components/guards";
import Link from "next/link";
import { useAttemptsSummary } from "@/hooks/useAttemptsSummary";
import { deleteStudentById } from "@/lib/studentsRepo";

export default function Home() {
  const { tests, loading, error } = useTests();
  const { students } = useStudents();
  const router = useRouter();
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour >= 18 ? "Dobra večer" : "Dobar dan";
  const name = user?.displayName?.split(" ")[0] ?? "";
  const { totalAttempts, averagePercent } = useAttemptsSummary();
  const totalStudents = students.length;
  const activeTestsCount = tests?.length ?? 0;
  const topStudents: Student[] = students ?? [];

  const recentTests = (tests ?? []).map((test) => ({
    ...test,
    title: test.name ?? "Untitled test",
    durationDisplay: estimateDuration(test),
    startDateDisplay: formatDate(test.createdAt),
  }));

  const recentTestsLimited = recentTests.slice(0, 4);
  const topStudentsLimited = topStudents.slice(0, 4);

  return (
    <RequireProfessor>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {greeting}
            {name && `, ${name}`}!
          </h1>{" "}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Broj studenata
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalStudents}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Aktivne zadaće
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {activeTestsCount}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Ukupno pokušaja
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {totalAttempts}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Prosječni rezultat
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {averagePercent}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tests */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Najnovije kontrolne zadaće
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/tests")}
              >
                Vidi sve
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {loading ? (
              <div className="text-sm text-gray-500">Učitavam testove…</div>
            ) : error ? (
              <div className="text-sm text-red-600">Greška: {error}</div>
            ) : recentTests.length === 0 ? (
              <div className="text-sm text-gray-500">
                Još nema spremljenih testova. Klikni “View all” i dodaj prvi
                test.
              </div>
            ) : (
              <div className="space-y-4">
                {recentTestsLimited.map((test) => (
                  <div
                    key={String(test.id)}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors card-hover"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        <Link
                          href={`/tests/${test.id}`}
                          className="hover:underline"
                        >
                          {test.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500">
                        {test.durationDisplay} • Kreiran {test.startDateDisplay}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="z-50 min-w-[8rem] bg-white border border-gray-200 shadow-md rounded-md p-3">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.push(`/tests/${test.id}`)}
                        >
                          See test details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Studenti
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  router.push("/students");
                }}
              >
                Vidi sve
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wide pb-2 border-b">
                <span>Ime i prezime</span>
                <span>Email</span>
                <span></span>
              </div>

              {topStudentsLimited.map((student) => (
                <div
                  key={student.id}
                  className="grid grid-cols-3 gap-4 items-center py-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900">
                    {student.fullName}
                  </span>
                  <span className="text-gray-600 truncate">
                    {student.email}
                  </span>

                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="z-50 min-w-[10rem] bg-white border border-gray-200 shadow-md rounded-md p-1">
                        <DropdownMenuItem
                          className="cursor-pointer px-3 py-2"
                          onClick={() => router.push(`/students/${student.id}`)}
                        >
                          Idi na profil
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer px-3 py-2 text-red-600 focus:text-red-700"
                          onClick={async () => {
                            const ok = confirm("Obrisati ovog studenta?");
                            if (!ok) return;
                            try {
                              await deleteStudentById(student.id);
                            } catch (e) {
                              console.error(e);
                              alert("Greška pri brisanju studenta.");
                            }
                          }}
                        >
                          Obriši
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RequireProfessor>
  );
}
