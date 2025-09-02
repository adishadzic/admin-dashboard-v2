"use client";

import React, { useEffect, useRef, useState, ChangeEvent, MouseEvent } from "react";
import { Search, FileText, Bell, ChevronDown, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "react-avatar";
import GenerateTestDialog from "./GenerateTestDialog";
import { useTests } from "@/hooks/useTests";
import { useRole } from "@/hooks/useRole";

interface Test {
  id: string | number;
  name: string;
}
interface HeaderProps {
  tests: Test[];
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

  const handleNotificationClick = () => {
    toast({ title: "🚧 Notifikacije nisu još implementirane." });
  };

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
        {/* Search — samo profesorima ima smisla */}
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
              <button onClick={() => setOpenGen(true)}>
                <FileText className="w-6 h-6 text-black cursor-pointer" />
              </button>
              <button onClick={handleNotificationClick}>
                <Bell className="w-6 h-6 flex-shrink-0 text-black cursor-pointer" />
              </button>
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
                View Profile
              </DropdownMenuItem>
              {isProfessor && (
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* samo profesor koristi generator */}
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
