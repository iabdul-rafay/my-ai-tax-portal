import { useNavigate } from "react-router";
import { ShieldOff, ArrowLeft } from "lucide-react";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShieldOff className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-lg font-medium text-foreground">Page Not Found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you requested does not exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 flex items-center gap-2 mx-auto rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
