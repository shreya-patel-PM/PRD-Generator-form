import { PrdForm } from '@/components/prd/prd-form'

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
              PRD Generator
            </span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Write a sharper product requirements doc
          </h1>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Pick a format — a quick 1-Pager, an implementation-ready Full PRD, or
            an Amazon-style PR/FAQ — then work through each phase to generate a
            sharp first draft.
          </p>
        </header>
        <PrdForm />
      </div>
    </main>
  )
}
