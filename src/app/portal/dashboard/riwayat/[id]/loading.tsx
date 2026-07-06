export default function Loading() {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <div className="mb-6 h-8 w-32 rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 md:gap-8">
          <div className="space-y-6 lg:col-span-3">
            <div className="h-32 w-full rounded-xl bg-slate-200" />
            <div className="h-64 w-full rounded-xl bg-slate-200" />
          </div>
          <div className="space-y-6 lg:col-span-2">
            <div className="h-72 w-full rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
