export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>

      {/* Right side - Decorative panel (hidden on mobile) */}
      <div className="hidden lg:flex w-[45%] hero-gradient pattern-overlay relative overflow-hidden items-center justify-center">
        <div className="blob w-80 h-80 bg-[#A85A6A] top-20 left-10 opacity-30" />
        <div className="blob w-96 h-96 bg-[#D4A574] bottom-20 right-10 opacity-15" style={{ animationDelay: "4s" }} />
        <div className="blob w-60 h-60 bg-cream/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: "7s" }} />
        <div className="relative z-10 text-center p-12">
          <div className="w-20 h-20 rounded-3xl bg-cream/10 backdrop-blur-sm border border-cream/20 flex items-center justify-center mx-auto mb-8">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cream">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8" />
              <path d="M8 11h6" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-cream mb-4 tracking-tight">Learn Smarter</h2>
          <p className="text-cream/60 text-lg leading-relaxed max-w-sm">
            Where every page turns into progress, and every quiz builds mastery.
          </p>
        </div>
      </div>
    </div>
  );
}
