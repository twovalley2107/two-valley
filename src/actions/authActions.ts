"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import {
  loginSchema,
  registerSchema,
  LoginInput,
  RegisterInput,
} from "@/lib/validation/auth";
import { Role } from "@prisma/client";
import { cookies, headers } from "next/headers";

export type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Migrates guest wishlist items and event logs associated with guest `sessionId`
 * to the authenticated user's `profileId` upon login or registration.
 */
export async function migrateGuestSessionToProfile(sessionId: string, profileId: string) {
  if (!sessionId || !profileId) return;

  try {
    const guestWishlistItems = await db.wishlistItem.findMany({
      where: { sessionId },
    });

    for (const item of guestWishlistItems) {
      const existing = await db.wishlistItem.findUnique({
        where: {
          profileId_productId: {
            profileId,
            productId: item.productId,
          },
        },
      });

      if (!existing) {
        await db.wishlistItem.create({
          data: {
            profileId,
            productId: item.productId,
          },
        });
      }
    }

    await db.wishlistItem.deleteMany({
      where: { sessionId },
    });

    await db.eventLog.updateMany({
      where: { sessionId, profileId: null },
      data: { profileId },
    });
  } catch (err) {
    console.error("Failed to migrate guest session data:", err);
  }
}

/**
 * Register Server Action: Registers user strictly via Supabase Auth with Email and Password.
 */
export async function registerAction(
  formData: RegisterInput
): Promise<ActionResult<{ userId: string; email: string }>> {
  const parseResult = registerSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues?.[0]?.message || "Invalid registration input.",
    };
  }

  const { email, password, name } = parseResult.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check duplicate email in Prisma DB to provide immediate UX feedback
  try {
    const existingProfile = await db.profile.findFirst({
      where: { email: normalizedEmail },
    });

    if (existingProfile) {
      return {
        success: false,
        error: "An account with this email address already exists. Please sign in instead.",
      };
    }
  } catch (dbCheckErr) {
    console.warn("DB duplicate check warning:", dbCheckErr);
  }

  let supabaseUser;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (
        msg.includes("already registered") ||
        msg.includes("already exists") ||
        msg.includes("unique constraint") ||
        msg.includes("user_already_exists")
      ) {
        return {
          success: false,
          error: "An account with this email address already exists. Please sign in instead.",
        };
      }
      return {
        success: false,
        error: error.message || "Registration failed via authentication provider.",
      };
    }

    if (!data?.user) {
      return {
        success: false,
        error: "Registration did not return a valid user session.",
      };
    }

    supabaseUser = data.user;
  } catch (err) {
    console.error("Supabase Auth signUp exception:", err);
    return {
      success: false,
      error: "Authentication service is currently unavailable.",
    };
  }

  const userId = supabaseUser.id;

  // Sync or create Profile record in Prisma DB with Role.CUSTOMER
  try {
    let profile = await db.profile.findUnique({ where: { id: userId } });
    if (!profile) {
      profile = await db.profile.findFirst({
        where: { email: normalizedEmail },
      });

      if (profile) {
        try {
          await db.profile.update({
            where: { id: profile.id },
            data: { id: userId, email: normalizedEmail, name: name || profile.name },
          });
        } catch {
          // Ignore if ID update constrained
        }
      } else {
        await db.profile.create({
          data: {
            id: userId,
            email: normalizedEmail,
            name,
            role: Role.CUSTOMER,
          },
        });
      }
    }
  } catch (dbErr) {
    console.error("Failed to create profile record:", dbErr);
  }

  return {
    success: true,
    data: {
      userId,
      email: normalizedEmail,
    },
  };
}

/**
 * Google OAuth Server Action: Generates Google OAuth redirect URL using Supabase Auth.
 */
export async function loginWithGoogleAction(): Promise<ActionResult<{ url: string }>> {
  try {
    const headerList = await headers();
    const origin = headerList.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${origin}/auth/callback`;

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error || !data?.url) {
      return {
        success: false,
        error: error?.message || "Failed to initialize Google OAuth login.",
      };
    }

    return {
      success: true,
      data: { url: data.url },
    };
  } catch (err: any) {
    console.error("Google OAuth exception:", err);
    return {
      success: false,
      error: err?.message || "Google authentication service unavailable.",
    };
  }
}

/**
 * Login Server Action: Authenticates user strictly via Supabase Auth using Email & Password,
 * and strictly enforces customer/admin login context.
 */
export async function loginAction(
  formData: LoginInput
): Promise<ActionResult<{ userId: string; role: Role }>> {
  const parseResult = loginSchema.safeParse(formData);
  if (!parseResult.success) {
    return {
      success: false,
      error: parseResult.error.issues?.[0]?.message || "Invalid credentials format.",
    };
  }

  const { identifier, password, loginContext = "customer" } = parseResult.data;
  const normalizedEmail = identifier.toLowerCase().trim();

  let supabaseUser;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Invalid email or password.",
      };
    }

    if (!data?.user) {
      return {
        success: false,
        error: "Invalid email or password.",
      };
    }

    supabaseUser = data.user;
  } catch (err) {
    console.error("Supabase Auth signInWithPassword exception:", err);
    return {
      success: false,
      error: "Authentication service is currently unavailable.",
    };
  }

  const userId = supabaseUser.id;

  // Retrieve or sync Profile in Prisma DB
  let profile = await db.profile.findUnique({ where: { id: userId } });
  if (!profile) {
    profile = await db.profile.findFirst({
      where: { email: normalizedEmail },
    });

    if (profile) {
      try {
        await db.profile.update({
          where: { id: profile.id },
          data: { id: userId, email: normalizedEmail },
        });
      } catch {
        // Ignore if ID update constrained
      }
    } else {
      profile = await db.profile.create({
        data: {
          id: userId,
          email: normalizedEmail,
          name: supabaseUser.user_metadata?.name || null,
          role: Role.CUSTOMER,
        },
      });
    }
  }

  // ── STRICT SERVER-LEVEL LOGIN CONTEXT ENFORCEMENT ──────────────────────────
  if (loginContext === "customer") {
    if (profile.role === Role.ADMIN) {
      try {
        const supabase = await createClient();
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.warn("SignOut exception during customer context rejection:", signOutErr);
      }

      return {
        success: false,
        error: "Invalid email or password.",
      };
    }
  } else if (loginContext === "admin") {
    if (profile.role !== Role.ADMIN) {
      try {
        const supabase = await createClient();
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.warn("SignOut exception during admin context rejection:", signOutErr);
      }

      return {
        success: false,
        error: "This account does not have administrator access.",
      };
    }

    // Set admin_session cookie ONLY for verified ADMIN role in admin context
    try {
      const cookieStore = await cookies();
      cookieStore.set("admin_session", profile.id, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
      });
    } catch (cookieErr) {
      console.warn("Failed to set admin_session cookie:", cookieErr);
    }
  }

  // Migrate guest items if session_id cookie exists
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;
    if (sessionId) {
      await migrateGuestSessionToProfile(sessionId, profile.id);
    }
  } catch (cookieErr) {
    console.warn("Failed session sync / migration:", cookieErr);
  }

  return {
    success: true,
    data: {
      userId: profile.id,
      role: profile.role,
    },
  };
}

export async function getCurrentUserRoleAction(): Promise<
  ActionResult<{ isAuthenticated: boolean; isCustomer: boolean; isAdmin: boolean }>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: true,
        data: { isAuthenticated: false, isCustomer: false, isAdmin: false },
      };
    }

    let profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile && user.email) {
      profile = await db.profile.findFirst({ where: { email: user.email } });
    }

    const isCustomer = profile?.role === Role.CUSTOMER;
    const isAdmin = profile?.role === Role.ADMIN;

    return {
      success: true,
      data: {
        isAuthenticated: true,
        isCustomer,
        isAdmin,
      },
    };
  } catch {
    return {
      success: true,
      data: { isAuthenticated: false, isCustomer: false, isAdmin: false },
    };
  }
}

/**
 * Logout Server Action: Signs out of Supabase Auth session and clears local session cookies.
 */
export async function logoutAction(): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Supabase Auth signOut error:", err);
  }

  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    cookieStore.delete("user_session");
  } catch (cookieErr) {
    console.warn("Failed to clear auth cookies:", cookieErr);
  }

  return { success: true };
}
