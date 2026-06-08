function DashboardPage() {
  return (
    <main className="space-y-6 p-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Welcome to Shubhayatra Nepal</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-500">
          Use the admin panel to manage news, media, team members, and homepage content.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">News & Blog</h2>
          <p className="mt-2 text-sm text-slate-600">Create stories, publish updates, and keep your visitors informed.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Gallery</h2>
          <p className="mt-2 text-sm text-slate-600">Upload images and videos for your gallery and organize content visually.</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Team Members</h2>
          <p className="mt-2 text-sm text-slate-600">Manage team profiles, roles, and contact links in one place.</p>
        </article>
      </section>
    </main>
  )
}

export default DashboardPage
