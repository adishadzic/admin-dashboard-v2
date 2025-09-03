"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import Avatar from "react-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function StudentHeader() {
  const { user } = useAuth();
  const role = useRole();
  const router = useRouter();

  const photo = user?.photoURL;
  const isStudent = role === "student";

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-center space-x-3">
            <Image src={"/fipu-logo.png"} width={88} height={88} alt="logo" />
        <span className="text-lg font-semibold text-gray-900">Zadaće</span>
        </div>

        <div className="flex items-center gap-3">
          {isStudent && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
              Student
            </span>
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
                <ChevronDown className="w-4 h-4 text-black ml-1" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white" align="end">
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut(auth)}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
