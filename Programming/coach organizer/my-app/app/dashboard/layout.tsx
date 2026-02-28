"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import {
  HelpCircle,
  Search,
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  User,
  Menu,
  X,
} from "lucide-react";

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/flows", label: "Flows", icon: FolderKanban },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#fafafa]">
      {/* Mobile overlay when sidebar is open */}
      <button
        type="button"
        aria-label="Close menu"
        className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden ${
          sidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-out md:sticky md:translate-x-0 md:shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-100 px-4 md:justify-start">
          <Link href="/" className="flex items-center gap-2 text-black">
            <Logo size={28} />
            <span className="text-base font-medium tracking-tight">Growial</span>
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-100 text-black"
                        : "text-gray-600 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-black" : "text-gray-500"}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 border-t border-gray-100 pt-4">
            <Link
              href="/dashboard?add=client"
              onClick={() => setSidebarOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Add client
            </Link>
          </div>
        </nav>
        <div className="border-t border-gray-100 p-3">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-gray-300"
            />
          </div>
          <button
            type="button"
            aria-label="Help"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-black"
          >
            <HelpCircle className="h-5 w-5 shrink-0" />
            Help
          </button>
        </div>
      </aside>

      {/* Main content + top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 md:px-6">
          <button
            type="button"
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 md:flex-none" />
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search clients/mentors"
              className="h-9 w-48 rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none placeholder:text-gray-400 focus:border-gray-300 lg:w-56"
            />
          </div>
          <button
            aria-label="Help / Support"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
          >
            <HelpCircle className="h-5 w-5" />
          </button>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
