import type { ReactNode } from 'react'

type AuthView = 'login' | 'register'

interface AuthPageShellProps {
  activeView: AuthView
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

function AuthPageShell({ activeView, title, subtitle, children, footer }: AuthPageShellProps) {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(240,50,50,0.24)_0%,rgba(240,50,50,0)_72%)]" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(37,50,102,0.18)_0%,rgba(37,50,102,0)_70%)]" />

      <section
        className="w-full max-w-124 animate-[card-enter_420ms_ease-out_both] rounded-[1.25rem] border border-brand-blue/14 bg-white p-6 shadow-[0_20px_45px_rgba(37,50,102,0.12)] sm:p-8"
        aria-labelledby="auth-title"
      >
        <header className="mb-5 flex items-center gap-3">
          <img className="h-11 w-11 shrink-0 object-contain" src="/logo.png" alt="Shubhayatra NGO logo" />
          <div>
            <p className="m-0 font-heading text-[0.98rem] font-bold tracking-[0.02em] text-brand-blue">
              Shubhayatra Nepal
            </p>
            <p className="m-0 mt-0.5 text-xs text-brand-muted">Serving communities with care and dignity</p>
          </div>
        </header>



        {children}
        <div className="mb-2" />
        {footer}
      </section>
    </main>
  )
}

export default AuthPageShell
