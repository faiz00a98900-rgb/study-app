"use client";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form on warm cream background */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative"
        style={{ background: "#FAF5EF" }}
      >
        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "#5C1F2C" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: "#5C1F2C", fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              StudyAI
            </span>
          </div>

          {children}
        </div>
      </div>

      {/* Right side - 3D Illustration */}
      <div
        className="hidden lg:flex w-[50%] relative overflow-hidden items-end justify-center"
        style={{ background: "linear-gradient(135deg, #F5EDE4 0%, #FAF5EF 50%, #F0E8DD 100%)" }}
      >
        {/* Soft decorative blobs */}
        <div
          className="absolute top-20 right-20 w-80 h-80 rounded-full blur-3xl opacity-40"
          style={{ background: "#E8DDD3" }}
        />
        <div
          className="absolute bottom-32 left-20 w-72 h-72 rounded-full blur-3xl opacity-40"
          style={{ background: "#F0E8DD" }}
        />

        {/* 3D Illustration */}
        <div className="relative z-10 w-full h-full flex items-end justify-center p-8">
          <img
            src="/study-illustration.png"
            alt="Student studying with AI"
            className="object-contain max-h-[85%] w-auto drop-shadow-2xl"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>

        {/* Fallback text if image missing */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 pointer-events-none"
          id="illustration-fallback"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 border"
            style={{ background: "rgba(92,31,44,0.08)", borderColor: "rgba(92,31,44,0.15)" }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ color: "#5C1F2C" }}
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h2
            className="text-4xl font-bold mb-4"
            style={{ color: "#5C1F2C", fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Learn Smarter
          </h2>
          <p className="text-lg max-w-sm" style={{ color: "rgba(92,31,44,0.6)" }}>
            Where every page turns into progress, and every quiz builds mastery.
          </p>
        </div>
      </div>
    </div>
  );
}
