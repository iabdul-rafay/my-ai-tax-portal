interface Props {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message = "Loading…", size = "md" }: Props) {
  const sizeMap = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
      <div
        className={`${sizeMap[size]} animate-spin rounded-full border-2 border-muted border-t-primary`}
      />
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <LoadingSpinner size="lg" message="Fetching data…" />
    </div>
  );
}
