import { NavLink, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Search,
  BarChart3,
  BookOpen,
  Database,
  MessageSquare,
  LogOut,
  ShieldCheck,
  ChevronRight,
  GitMerge,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../ui/utils";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/search", icon: Search, label: "Entity Search" },
  { to: "/match", icon: GitMerge, label: "Entity Linkage" },
  { to: "/risk", icon: BarChart3, label: "Risk Analysis" },
  { to: "/audit", icon: BookOpen, label: "Audit Trail" },
  { to: "/data-sources", icon: Database, label: "Data Sources" },
  { to: "/chat", icon: MessageSquare, label: "AI Assistant" },
];

interface Props {
  collapsed?: boolean;
}

export function Sidebar({ collapsed = false }: Props) {
  const { user, logout, token } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-4">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
          <ShieldCheck className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-sidebar-foreground">
              AI Tax Portal
            </p>
            <p className="truncate text-xs text-muted-foreground">
              FBR Intelligence
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="space-y-0.5 px-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-primary-foreground")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{label}</span>
                      {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer — user info + logout */}
      <div className="border-t border-border p-3">
        {!collapsed && (
          <div className="mb-2 rounded-lg bg-muted/50 px-3 py-2">
            <p className="truncate text-xs font-medium text-foreground">
              {user?.fullName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.role}</p>
            {/* DEV token display for debugging */}
            <p className="mt-1 truncate text-[10px] text-muted-foreground/60">
              Token: {token?.slice(0, 20)}…
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </aside>
  );
}
