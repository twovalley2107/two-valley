"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { registerAction, loginWithGoogleAction } from "@/actions/authActions";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify your password entry.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerAction({ name, email, password, confirmPassword });
      if (!result.success) {
        setError(result.error || "Registration failed. Please try again.");
      } else {
        router.push("/account");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const result = await loginWithGoogleAction();
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        setError(result.error || "Failed to initialize Google signup.");
        setGoogleLoading(false);
      }
    } catch {
      setError("An error occurred during Google sign in.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-ivory px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-brand-ivory/95 backdrop-blur-md p-8 rounded-2xl border border-brand-gold/25 shadow-2xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link href="/" className="inline-block mb-3 group" title="Return to Two Valley Storefront">
            <Image
              src="/brand/two-valley-logo.png"
              alt="Two Valley — Pure Natural Finest"
              width={80}
              height={80}
              className="h-20 w-20 object-contain rounded-full border border-brand-gold/30 p-0.5 shadow-md transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </Link>
          <h1 className="text-3xl font-serif text-brand-forest mb-2">Create Account</h1>
          <p className="text-sm text-brand-olive font-sans">
            Join Two Valley to discover luxury fragrances and single-estate mountain teas
          </p>
        </div>

        {error && (
          <div id="register-error" role="alert" aria-live="polite" className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="block text-xs font-semibold tracking-wider text-brand-charcoal uppercase mb-1.5">
              Full Name
            </label>
            <input
              id="register-name"
              type="text"
              value={name}
              onChange={(e) => {
                setError(null);
                setName(e.target.value);
              }}
              required
              placeholder="Julian Vance"
              className="w-full px-4 py-3 rounded-xl bg-brand-beige/50 border border-brand-gold/30 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-xs font-semibold tracking-wider text-brand-charcoal uppercase mb-1.5">
              Email Address
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => {
                setError(null);
                setEmail(e.target.value);
              }}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-error" : undefined}
              placeholder="you@domain.com"
              className="w-full px-4 py-3 rounded-xl bg-brand-beige/50 border border-brand-gold/30 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-xs font-semibold tracking-wider text-brand-charcoal uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setError(null);
                  setPassword(e.target.value);
                }}
                required
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "register-error" : undefined}
                placeholder="At least 8 chars (letters & numbers)"
                className="w-full px-4 py-3 pr-11 rounded-xl bg-brand-beige/50 border border-brand-gold/30 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-olive hover:text-brand-forest transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a9.96 9.96 0 014.122-.963c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="register-confirm-password" className="block text-xs font-semibold tracking-wider text-brand-charcoal uppercase mb-1.5">
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setError(null);
                setConfirmPassword(e.target.value);
              }}
              required
              placeholder="Re-enter your password"
              className="w-full px-4 py-3 rounded-xl bg-brand-beige/50 border border-brand-gold/30 text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-brand-forest text-brand-ivory font-semibold text-xs uppercase tracking-widest hover:bg-brand-olive transition-colors duration-200 disabled:opacity-50 mt-2 cursor-pointer shadow-md"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-gold/25" />
          </div>
          <span className="relative px-3 bg-brand-ivory text-[11px] font-semibold tracking-wider text-brand-olive uppercase">
            OR
          </span>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full py-3 px-4 rounded-xl border border-brand-gold/40 bg-brand-beige/60 hover:bg-brand-beige transition-colors duration-200 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-wider text-brand-charcoal shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
        </button>

        {/* Sign In Link */}
        <div className="mt-8 text-center font-sans text-xs text-brand-olive">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-forest hover:text-brand-gold underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
