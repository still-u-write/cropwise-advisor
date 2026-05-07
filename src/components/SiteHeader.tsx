import { Link } from "@tanstack/react-router";
import { Leaf, CloudSun, LineChart } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          CropGuard
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavItem to="/" icon={<Leaf className="h-4 w-4" />} label="Diagnose" />
          <NavItem to="/weather" icon={<CloudSun className="h-4 w-4" />} label="Weather" />
          <NavItem to="/market" icon={<LineChart className="h-4 w-4" />} label="Market & Schemes" />
        </nav>
      </div>
    </header>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: true }}
      activeProps={{ className: "bg-secondary text-foreground" }}
      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
