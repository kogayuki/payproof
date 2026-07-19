"use client";

// Sansan風の白いトップアプリバー
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, Zap } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "ホーム" },
  { href: "/apply", label: "契約申込" },
  { href: "/dashboard", label: "事業者ダッシュボード" },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-1.5">
          <Zap className="h-5 w-5 text-primary" fill="currentColor" />
          <span className="text-lg font-bold tracking-tight text-primary">
            PayProof
          </span>
        </Link>
        <nav className="flex h-full items-center gap-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex h-full items-center px-3 transition-colors ${
                  active
                    ? "font-semibold text-primary after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-4 text-muted-foreground">
          <span className="hidden font-mono text-xs sm:inline">MVP Demo</span>
          <Bell className="h-4.5 w-4.5" />
          <HelpCircle className="h-4.5 w-4.5" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            佐
          </span>
        </div>
      </div>
    </header>
  );
}
