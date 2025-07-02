"use client";

import React from "react";
import {
  BarChart3,
  BookOpen,
  Users,
  Home,
  Settings,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SectionId } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  href: string;
}

interface SidebarProps {
  activeSection: SectionId;
  setActiveSection: React.Dispatch<React.SetStateAction<SectionId>>;
}

const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/" },
    {
      id: "statistika",
      label: "Statistika",
      icon: BarChart3,
      href: "/studet",
    },
    { id: "testovi", label: "Testovi", icon: BookOpen, href: "/tests" },
    { id: "studenti", label: "Studenti", icon: Users, href: "/students" },
  ];

  const bottomMenuItems: MenuItem[] = [
    { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
  ];

  // Helper to check if the menu item is active based on current path
  const isActive = (href: string) => pathname === href;

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="pt-3 pb-2">
        <div className="flex items-center justify-center space-x-3">
          <Link
            href="/"
            className="w-22 h-22 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center"
          >
            <img src="/fipu-logo.png" alt="Logo" />
          </Link>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map(({ id, label, icon: Icon, href }) => (
          <Link
            key={id}
            href={href}
            passHref
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 sidebar-item",
              isActive(href)
               ? "bg-[#5783db] text-white"
                  : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      <div className="px-4 pb-4">
        {bottomMenuItems.map(({ id, label, icon: Icon, href }) => (
          <Link
            key={id}
            href={href}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 sidebar-item",
              isActive(href)
                ? "bg-[#5783db] text-white"
                  : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
