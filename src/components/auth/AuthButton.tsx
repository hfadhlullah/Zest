"use client";

import { useAuth } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AuthButton() {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  if (isSignedIn) {
    // Authenticated: show Clerk UserButton
    return <UserButton afterSignOutUrl="/" />;
  }

  // Anonymous: show Sign In link
  const redirectUrl = pathname ? `?redirect_url=${encodeURIComponent(pathname)}` : "";

  return (
    <Link
      href={`/sign-in${redirectUrl}`}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-all duration-150"
      title="Sign In"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M13 7H3M3 7l3 3M3 7l3-3M13 2v10a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Sign In</span>
    </Link>
  );
}
