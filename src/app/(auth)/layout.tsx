import type { Metadata } from "next";
import "./auth.css";

export const metadata: Metadata = {
  title: "Sign In — Zest",
  description: "Sign in to Zest to save your projects and access premium features.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--color-bg-primary)" }}>
      {/* Background gradient pattern */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, var(--color-primary) 0%, transparent 50%),
                       radial-gradient(circle at bottom left, var(--color-primary) 0%, transparent 50%)`,
          opacity: 0.05,
        }}
        aria-hidden="true"
      />

      {/* Card container */}
      <div className="relative w-full max-w-md px-4">
        <div
          className="rounded-3xl border-2 p-8 shadow-2xl"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          {/* Logo / Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              Zest
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
              AI-powered UI Builder
            </p>
          </div>

          {/* Auth content (SignIn or SignUp) */}
          <div className="space-y-6">{children}</div>

          {/* Footer link */}
          <div className="mt-8 text-center text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <p>
              Protected by{" "}
              <a href="https://clerk.com" className="font-medium hover:underline" style={{ color: "var(--color-primary)" }}>
                Clerk
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
