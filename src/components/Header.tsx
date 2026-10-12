import { Link } from "@tanstack/react-router";
import { Moon, Sun, Menu, X, Footprints } from "lucide-react";
import { useEffect, useState } from "react";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-primary-foreground shadow-glow"><Footprints className="h-5 w-5" /></span>
      DreamStep
    </Link>
  );
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.classList.contains("dark")); }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("dreamstep:theme", next ? "dark" : "light");
  };
  return (
    <button onClick={toggle} aria-label="Toggle theme" className="btn btn-outline !p-2.5">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

const links = [
  { to: "/", label: "Home" },
  { to: "/goals", label: "My Goals" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/settings", label: "Settings" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} activeOptions={{ exact: true }} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "!text-primary bg-primary-soft" }}>{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/new" className="btn btn-primary hidden sm:inline-flex">Start Your Journey</Link>
          <button className="btn btn-outline !p-2.5 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}</button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t px-4 py-3 md:hidden">
          {links.map((l) => <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium" activeOptions={{ exact: true }} activeProps={{ className: "text-primary bg-primary-soft" }}>{l.label}</Link>)}
          <Link to="/new" onClick={() => setOpen(false)} className="btn btn-primary mt-2">Start Your Journey</Link>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t py-8 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} DreamStep — Turn your dream into today's action.
    </footer>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
      <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${Math.round(value * 100)}%` }} />
    </div>
  );
}
