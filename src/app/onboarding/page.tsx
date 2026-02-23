"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const THEMES = [
    { id: "system", label: "System", icon: "💻" },
    { id: "dark", label: "Dark", icon: "🌙" },
    { id: "light", label: "Light", icon: "☀️" },
];

const ROLES = [
    "Developer",
    "Product Manager",
    "Founder",
    "Designer",
    "Marketer",
    "Student",
    "Other"
];

const COMPANY_SIZES = [
    "Just me",
    "2-10",
    "11-50",
    "51-200",
    "200+"
];

function OnboardingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        theme: "system",
        name: "",
        role: "",
        companySize: ""
    });

    const handleNext = () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Finished onboarding
            const redirect = searchParams.get("redirect") || "/";
            router.push(redirect);
        }
    };

    const currentProgress = (step / 4) * 100;

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <div className="w-full max-w-md px-6">

                {/* Progress Bar */}
                <div className="w-full h-1 bg-muted rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-in-out"
                        style={{ width: `${currentProgress}%` }}
                    />
                </div>

                <div className="min-h-[300px] flex flex-col justify-center">
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">What's your name?</h1>
                            <p className="text-muted-foreground mb-8">Let's personalize your Zest experience.</p>

                            <Input
                                autoFocus
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-12 text-lg bg-background"
                                onKeyDown={(e) => { if (e.key === "Enter" && formData.name) handleNext(); }}
                            />

                            <Button
                                className="w-full mt-6 h-12 text-md font-medium"
                                onClick={handleNext}
                                disabled={!formData.name.trim()}
                            >
                                Continue
                            </Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">What look do you want?</h1>
                            <p className="text-muted-foreground mb-8">Choose your preferred theme.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {THEMES.map((theme) => (
                                    <button
                                        key={theme.id}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all",
                                            formData.theme === theme.id
                                                ? "border-primary bg-primary/5 shadow-sm"
                                                : "border-border/50 bg-background hover:bg-muted/50 hover:border-border"
                                        )}
                                        onClick={() => setFormData({ ...formData, theme: theme.id })}
                                    >
                                        <span className="text-3xl mb-3">{theme.icon}</span>
                                        <span className="font-medium text-sm">{theme.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <Button variant="ghost" onClick={() => setStep(1)} className="h-12 w-20">Back</Button>
                                <Button className="flex-1 h-12 text-md font-medium" onClick={handleNext}>Continue</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">What describes you best?</h1>
                            <p className="text-muted-foreground mb-8">Help us tailor Zest to your needs.</p>

                            <div className="flex flex-wrap gap-2">
                                {ROLES.map((role) => (
                                    <button
                                        key={role}
                                        className={cn(
                                            "px-4 py-2.5 rounded-full border text-sm font-medium transition-all",
                                            formData.role === role
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border bg-background hover:bg-muted hover:border-muted-foreground/30 text-foreground"
                                        )}
                                        onClick={() => setFormData({ ...formData, role })}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <Button variant="ghost" onClick={() => setStep(2)} className="h-12 w-20">Back</Button>
                                <Button
                                    className="flex-1 h-12 text-md font-medium"
                                    onClick={handleNext}
                                    disabled={!formData.role}
                                >
                                    Continue
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <h1 className="text-3xl font-bold tracking-tight mb-2">How many people work at your company?</h1>
                            <p className="text-muted-foreground mb-8">This helps us understand your team structure.</p>

                            <div className="flex flex-col gap-2">
                                {COMPANY_SIZES.map((size) => (
                                    <button
                                        key={size}
                                        className={cn(
                                            "px-4 py-3 rounded-lg border text-left font-medium transition-all",
                                            formData.companySize === size
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border bg-background hover:bg-muted hover:border-muted-foreground/30 text-foreground"
                                        )}
                                        onClick={() => setFormData({ ...formData, companySize: size })}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3 mt-8">
                                <Button variant="ghost" onClick={() => setStep(3)} className="h-12 w-20">Back</Button>
                                <Button
                                    className="flex-1 h-12 text-md font-medium"
                                    onClick={handleNext}
                                    disabled={!formData.companySize}
                                >
                                    Finish
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background">Loading...</div>}>
            <OnboardingContent />
        </Suspense>
    );
}
