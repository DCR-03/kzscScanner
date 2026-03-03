"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Scan" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white tracking-tight">
          kzscScanner
        </Link>
        <nav className="flex gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
