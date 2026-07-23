"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NAV, type NavItem } from "./nav";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "./user-context";

export function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const isAdmin = !!user?.is_admin;

  const nav = NAV.filter((item) => isAdmin || !item.adminOnly).map((item) =>
    item.children
      ? { ...item, children: item.children.filter((c) => isAdmin || !c.adminOnly) }
      : item,
  );

  return (
    <aside
      className={cn(
        "sticky top-0 h-screen shrink-0 bg-[var(--color-surface-sidebar)] border-r border-[var(--color-border)]",
        "transition-all duration-300 ease-in-out flex flex-col",
        expanded ? "w-64" : "w-16",
      )}
    >
      {/* Brand + toggle */}
      <div className="flex items-center justify-between h-16 px-3 border-b border-[var(--color-border)]">
        {expanded && (
          <span className="font-bold text-[var(--color-primary)] text-lg truncate">
            🧡 FEBC ไปรษณีย์
          </span>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-2 rounded-lg text-[var(--color-primary)] hover:bg-[var(--color-surface-hover)] transition-colors"
          aria-label="toggle sidebar"
        >
          {expanded ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {nav.map((item) => (
          <NavNode key={item.label} item={item} expanded={expanded} pathname={pathname} />
        ))}
      </nav>
    </aside>
  );
}

function NavNode({
  item,
  expanded,
  pathname,
}: {
  item: NavItem;
  expanded: boolean;
  pathname: string;
}) {
  const [open, setOpen] = useState(true);

  if (item.href) {
    const active = pathname === item.href;
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors",
          active
            ? "bg-[var(--color-primary)] text-white"
            : "text-[var(--color-text-body)] hover:bg-[var(--color-surface-hover)]",
        )}
        title={item.label}
      >
        <span className="text-lg shrink-0">{item.emoji}</span>
        {expanded && <span className="truncate">{item.label}</span>}
      </Link>
    );
  }

  // group with children
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-[var(--color-text-label)] hover:bg-[var(--color-surface-hover)] transition-colors"
        title={item.label}
      >
        <span className="text-lg shrink-0">{item.emoji}</span>
        {expanded && (
          <>
            <span className="truncate flex-1 text-left">{item.label}</span>
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </>
        )}
      </button>
      {expanded && open && (
        <div className="ml-4 mt-1 space-y-1 border-l border-[var(--color-border)] pl-2">
          {item.children!.map((c) => {
            const active = pathname + (typeof window !== "undefined" ? window.location.search : "") === c.href || pathname === c.href;
            return (
              <Link
                key={c.href}
                href={c.href}
                className={cn(
                  "block px-3 py-1.5 rounded-lg text-sm transition-colors",
                  active
                    ? "text-[var(--color-primary)] font-semibold bg-[var(--color-primary-surface)]"
                    : "text-[var(--color-text-body)] hover:bg-[var(--color-surface-hover)]",
                )}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
