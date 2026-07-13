export default function Loading() {
  return (
    <div className="container flex min-h-[50vh] items-center justify-center py-24">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-saffron-200 border-t-saffron-500" />
        <p className="text-sm text-maroon-500">Loading fresh masalas…</p>
      </div>
    </div>
  );
}
