"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginAction } from "@/actions/authActions";
import { validateRedirectUrl } from "@/lib/auth/redirect";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirectTo = searchParams.get("redirectTo");
  const initialErrorParam = searchParams.get("error");
  const redirectTo = validateRedirectUrl(rawRedirectTo, "/admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    initialErrorParam === "denied"
      ? "Access Denied: Administrator privileges (Role: ADMIN) are required to access the management portal."
      : null
  );
  const [nonAdminUser, setNonAdminUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNonAdminUser(false);
    setLoading(true);

    try {
      const result = await loginAction({ identifier: email, password, loginContext: "admin" });
      if (!result.success) {
        setError(result.error || "Invalid administrator credentials.");
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError("An unexpected authentication error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-brand-charcoal/90 backdrop-blur-lg p-8 rounded-2xl border border-brand-gold/30 shadow-2xl text-brand-ivory font-sans relative">
      {/* Subtle top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-gold/40 via-brand-gold to-brand-gold/40 rounded-t-2xl" />

      {/* Header & Branding */}
      <div className="text-center mb-8 flex flex-col items-center">
        <Link href="/" className="inline-block mb-4 group" title="Return to Two Valley Storefront">
          <Image
            src="/brand/two-valley-logo.png"
            alt="Two Valley — Pure Natural Finest"
            width={84}
            height={84}
            className="h-20 w-20 object-contain rounded-full border border-brand-gold/40 p-1 shadow-lg transition-transform duration-300 group-hover:scale-105 bg-brand-ivory/5"
            priority
          />
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-[10px] font-semibold tracking-[0.2em] uppercase text-brand-gold mb-2">
          Management Portal
        </div>
        <h1 className="text-2xl font-serif text-brand-gold tracking-wide">Administrator Sign In</h1>
        <p className="text-xs text-brand-ivory/60 mt-1 font-sans">
          Authorized personnel only. Access monitored and logged.
        </p>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div
          id="admin-login-error"
          role="alert"
          aria-live="polite"
          className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs leading-relaxed font-sans space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>{error}</div>
          </div>
          {nonAdminUser && (
            <div className="pt-2 border-t border-red-500/20 flex flex-col sm:flex-row items-center gap-2 text-center">
              <Link
                href="/account"
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-brand-gold/20 text-brand-gold hover:bg-brand-gold/30 font-semibold text-[11px] uppercase tracking-wider transition-colors"
              >
                Go to Customer Account
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-brand-ivory/20 text-brand-ivory/80 hover:bg-brand-ivory/10 font-semibold text-[11px] uppercase tracking-wider transition-colors"
              >
                Return to Store
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
        <div>
          <label
            htmlFor="admin-login-email"
            className="block text-[11px] font-semibold tracking-wider text-brand-gold/90 uppercase mb-2"
          >
            Admin Email Address
          </label>
          <input
            id="admin-login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "admin-login-error" : undefined}
            placeholder="admin@twovalley.com"
            className="w-full px-4 py-3 rounded-xl bg-brand-charcoal border border-brand-gold/25 text-brand-ivory placeholder-brand-ivory/30 focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="admin-login-password"
            className="block text-[11px] font-semibold tracking-wider text-brand-gold/90 uppercase mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="admin-login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "admin-login-error" : undefined}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-11 rounded-xl bg-brand-charcoal border border-brand-gold/25 text-brand-ivory placeholder-brand-ivory/30 focus:outline-none focus:ring-2 focus:ring-brand-gold text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-ivory/50 hover:text-brand-gold transition-colors focus:outline-none"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-brand-gold text-brand-charcoal font-semibold text-xs uppercase tracking-widest hover:bg-brand-gold/90 shadow-lg hover:shadow-brand-gold/20 transition-all duration-200 disabled:opacity-50 mt-2"
        >
          {loading ? "Authenticating Admin..." : "Sign In to Admin Portal"}
        </button>
      </form>

      {/* Footer link to main store */}
      <div className="mt-8 pt-6 border-t border-brand-gold/15 text-center text-xs text-brand-ivory/50 flex items-center justify-center gap-2">
        <svg className="w-3.5 h-3.5 text-brand-gold/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <Link href="/" className="text-brand-gold/90 hover:text-brand-gold underline underline-offset-4">
          Return to Customer Storefront
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-charcoal px-4 py-12">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-brand-charcoal/90 p-8 rounded-2xl border border-brand-gold/30 text-center font-sans text-sm text-brand-gold/70">
            Loading Admin Portal...
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
