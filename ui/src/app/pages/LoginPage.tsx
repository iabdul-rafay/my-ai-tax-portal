import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { ShieldCheck, Eye, EyeOff, AlertCircle, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { DEV_CREDENTIALS } from "../services/authService";

export function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  function fillDevCredentials() {
    setUsername(DEV_CREDENTIALS.username);
    setPassword(DEV_CREDENTIALS.password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white">My AI Portal</h1>
          <p className="mt-1 text-sm text-slate-400">
            Tax Compliance Intelligence System
          </p>
          <div className="mt-2 inline-block rounded-full bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-300">
            Federal Board of Revenue — Pakistan
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-200">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/30 focus:bg-white/15"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition focus:border-white/30 focus:bg-white/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
            >
              {isLoading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          {/* Dev credentials section */}
          <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-400">
              Development Login
            </p>
            <div className="space-y-1 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Username:</span>
                <code className="rounded bg-white/10 px-2 py-0.5 text-amber-300">
                  {DEV_CREDENTIALS.username}
                </code>
              </div>
              <div className="flex items-center justify-between">
                <span>Password:</span>
                <code className="rounded bg-white/10 px-2 py-0.5 text-amber-300">
                  {DEV_CREDENTIALS.password}
                </code>
              </div>
            </div>
            <button
              type="button"
              onClick={fillDevCredentials}
              className="mt-3 w-full rounded-lg bg-amber-500/10 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
            >
              Auto-fill Dev Credentials
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          Authorized personnel only. All access is monitored and logged.
        </p>
      </div>
    </div>
  );
}
