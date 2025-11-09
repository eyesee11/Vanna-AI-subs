"use client";

import {
  Home,
  FileText,
  Folder,
  Users,
  Building,
  Settings,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: MessageSquare, label: "Chat with Data", href: "/chat" },
  { icon: FileText, label: "Invoice", href: "/invoices" },
  { icon: Folder, label: "Other files", href: "/files" },
  { icon: Building, label: "Departments", href: "/departments" },
  { icon: Users, label: "Users", href: "/users" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-[220px] h-[800px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-base font-bold">B</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-[15px] leading-tight">
            Buchhaltung
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5">12 members</div>
        </div>
        <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg>
        </button>
      </div>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.08em] mb-3 px-3">
          GENERAL
        </div>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" strokeWidth={2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[11px] font-bold">FA</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-gray-900 truncate">
              Flowbit AI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
