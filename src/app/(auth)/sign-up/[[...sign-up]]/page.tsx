import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <SignUp
      appearance={{
        variables: {
          colorPrimary: "#22c55e",
          colorText: "var(--color-text)",
          colorTextSecondary: "var(--color-text-secondary)",
          colorBackground: "var(--color-bg)",
          colorBorder: "var(--color-border)",
          borderRadius: "12px",
          fontFamily: "var(--font-body)",
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: "#22c55e",
            color: "white",
            borderRadius: "12px",
            fontWeight: "500",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "&:hover": {
              backgroundColor: "#16a34a",
              transform: "translateY(-2px)",
            },
          },
          formButtonSecondary: {
            borderColor: "var(--color-border)",
            color: "var(--color-text)",
          },
          socialButtonsBlockButton: {
            borderRadius: "12px",
            border: "2px solid var(--color-border)",
            backgroundColor: "var(--color-bg-secondary)",
            color: "var(--color-text)",
          },
          dividerLine: {
            backgroundColor: "var(--color-border)",
          },
          dividerText: {
            color: "var(--color-text-secondary)",
          },
          footerAction: {
            color: "var(--color-text-secondary)",
          },
          footerActionLink: {
            color: "#22c55e",
            fontWeight: "500",
          },
        },
      }}
      redirectUrl="/dashboard"
    />
  );
}
