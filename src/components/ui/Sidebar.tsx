// src/components/ui/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Wallet,
  Settings,
  BookOpen,
  Wrench,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/technicians", label: "Technicians", icon: Users },
  { href: "/months", label: "Month Payouts", icon: Wallet },
  { href: "/guide", label: "Incentive Guide", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-gray-200 bg-white min-h-screen flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <Wrench size={16} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 leading-none">Servyn</p>
          <p className="text-xs text-gray-400 mt-0.5">Incentive System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">CST Portal · v1</p>
      </div>
    </aside>
  );
}