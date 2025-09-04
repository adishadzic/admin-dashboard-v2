"use client";

import React, { useEffect, useRef, useState, ChangeEvent } from "react";
import { Search, FileText, Bell, ChevronDown, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "react-avatar";
import GenerateTestDialog from "./GenerateTestDialog";
import { useTests } from "@/hooks/useTests";
import { useRole } from "@/hooks/useRole";
import Link from "next/link";
import {
  collection, onSnapshot, orderBy, query, limit
} from "firebase/firestore";

interface Test {
  id: string | number;
  name: string;
}
interface HeaderProps {
  tests: Test[];
}

type AttemptFS = {
  testId: string;
  testName?: string;
  studentId: string;
  studentName?: string;
  percent: number;
  submittedAt: number;
};
type Attempt = AttemptFS & { id: string };

// util
function formatWhen(ms?: number): string {
  if (!ms) return "—";
  const d = new Date(ms);
  return d.toLocaleString("hr-HR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const Header: React.FC<HeaderProps> = ({ tests }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const role = useRole();
  const isProfessor = role === "professor";
  const { addTest } = useTests();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Test[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [openGen, setOpenGen] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const router = useRouter();
  const photo = user?.photoURL;
  const searchRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch {
      toast({
        title: "Greška prilikom odjave",
        description: "Pokušajte ponovno.",
        variant: "destructive",
      });
    }
  };

  // Listen attempts (last 10) for the popup list
  useEffect(() => {
    if (!isProfessor) return;

    const qRef = query(
      collection(db, "attempts"),
      orderBy("submittedAt", "desc"),
      limit(10)
    );

    const unsub = onSnapshot(qRef, (snap) => {
      const rows: Attempt[] = snap.docs.map((d) => {
        const raw = d.data() as Partial<AttemptFS>;
        return {
          id: d.id,
          testId: String(raw.testId ?? ""),
          testName: raw.testName,
          studentId: String(raw.studentId ?? ""),
          studentName: raw.studentName,
          percent: Number(raw.percent ?? 0),
          submittedAt: Number(raw.submittedAt ?? 0),
        };
      });
      setAttempts(rows);
    });

    return () => unsub();
  }, [isProfessor]);

  // Search tests
  useEffect(() => {
    if (searchQuery) {
      const filtered = tests.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, tests]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | globalThis.MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1 max-w-md" ref={searchRef}>
          {isProfessor && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Pretraži testove..."
                className="pl-10 bg-gray-50 border-gray-100 text-black"
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              {isSearchFocused && searchQuery && (
                <div className="absolute top-full mt-2 w-full bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((test) => (
                      <div
                        key={test.id}
                        className="text-black p-3 hover:bg-gray-100 cursor-pointer flex items-center space-x-3"
                        onClick={() => {
                          setIsSearchFocused(false);
                          setSearchQuery("");
                          router.push(`/tests/${test.id}`);
                        }}
                      >
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <span>{test.name}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">No results found.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6">
          {isProfessor && (
            <>
              <button onClick={() => setOpenGen(true)} aria-label="Generate test">
                <FileText className="w-6 h-6 text-black cursor-pointer" />
              </button>

              <Popover open={notifOpen} onOpenChange={setNotifOpen}>
                <PopoverTrigger asChild>
                  <button aria-label="Notifications" className="relative">
                    <Bell className="w-6 h-6 flex-shrink-0 text-black cursor-pointer" />
                    {/* badge removed as requested */}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  align="end"
                  className="w-[380px] p-0 overflow-hidden"
                >
                  <div className="border-b px-4 py-3 flex items-center justify-between bg-gray-50">
                    <span className="font-medium text-gray-900">Obavijesti</span>
                  </div>

                  {attempts.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">Nema nedavnih pokušaja.</div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {attempts.slice(0, 5).map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
                        >
                          <span className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          <div className="flex-1 text-sm text-gray-800">
                            <div className="mb-0.5">
                              <Link
                                href={`/students/${a.studentId}`}
                                className="font-medium hover:underline"
                                onClick={() => setNotifOpen(false)}
                              >
                                {a.studentName || `Student ${a.studentId}`}
                              </Link>{" "}
                              riješio je{" "}
                              <Link
                                href={`/tests/${a.testId}`}
                                className="font-medium hover:underline"
                                onClick={() => setNotifOpen(false)}
                              >
                                {a.testName || `Test ${a.testId}`}
                              </Link>{" "}
                              – {Math.round(a.percent)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatWhen(a.submittedAt)}
                            </div>
                          </div>
                          <Link
                            href={`/attempts/${a.id}`}
                            className="text-xs text-blue-600 hover:text-blue-800 flex-shrink-0"
                            onClick={() => setNotifOpen(false)}
                          >
                            Detalji
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center">
                {photo ? (
                  <Image
                    className="w-8 h-8 rounded-full object-cover"
                    src={photo}
                    alt="Profile picture"
                    width={32}
                    height={32}
                    priority
                  />
                ) : (
                  <Avatar
                    name={user?.displayName || user?.email || "User"}
                    size="32"
                    round={true}
                    textSizeRatio={2}
                  />
                )}
                {role && (
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                      isProfessor ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {isProfessor ? "Profesor" : "Student"}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-black ml-2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white" align="end">
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                Vidi profil
              </DropdownMenuItem>
              {isProfessor && (
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  Postavke
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Odjava</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isProfessor && (
        <GenerateTestDialog
          open={openGen}
          onOpenChange={setOpenGen}
          saveTest={(t) => addTest(t)}
          onSaved={() => {}}
        />
      )}
    </header>
  );
};

export default Header;
