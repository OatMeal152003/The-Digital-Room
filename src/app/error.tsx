"use client";

export default function RoomError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-void text-bone">
      <p className="text-sm text-dim">The room flickered out.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full border border-smoke px-5 py-2 text-sm hover:border-dim"
      >
        Re-enter
      </button>
    </main>
  );
}
