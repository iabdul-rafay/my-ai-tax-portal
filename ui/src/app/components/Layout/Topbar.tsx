import { Bell, Menu, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { mockAlerts } from "../../data/mockData";

interface Props {
  title: string;
  onMenuClick?: () => void;
}

export function Topbar({ title, onMenuClick }: Props) {
  const { user } = useAuth();
  const unreadCount = mockAlerts.filter((a) => !a.isRead).length;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Alert bell */}
        <div className="relative">
          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <Bell className="h-5 w-5" />
          </button>
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {user?.fullName?.charAt(0) ?? "A"}
          </div>
          <div className="hidden text-sm sm:block">
            <p className="font-medium text-foreground leading-tight">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground">{user?.role}</p>
          </div>
        </div>

        {/* Risk status indicator */}
        <div className="hidden items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 lg:flex">
          <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
          <span className="text-xs font-medium text-red-700">
            {unreadCount} Active Alert{unreadCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </header>
  );
}
