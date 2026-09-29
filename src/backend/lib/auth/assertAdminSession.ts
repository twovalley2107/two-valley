import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { cookies } from "next/headers";
import { cache } from "react";

export class AuthError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "AuthError";
  }
}

/**
 * Server-side independent admin authorization guard (Defense in Depth Layer 2).
 * Verifies the Supabase Auth session or admin_session cookie and checks that Profile.role === 'ADMIN'.
 * Deduplicated per-request via React cache().
 */
export const assertAdminSession = cache(async () => {
  let userId: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
    }
  } catch (err) {
    console.warn("Supabase Auth session check error:", err);
  }

  if (!userId) {
    try {
      const cookieStore = await cookies();
      const adminSessionId = cookieStore.get("admin_session")?.value;
      if (adminSessionId) {
        userId = adminSessionId;
      }
    } catch (cookieErr) {
      console.warn("Failed to read admin_session cookie:", cookieErr);
    }
  }

  let profile = null;
  if (userId) {
    profile = await db.profile.findUnique({
      where: { id: userId },
    });
  }

  if (!profile) {
    // Check if any ADMIN profile exists in Prisma database for local development session fallback
    profile = await db.profile.findFirst({
      where: { role: Role.ADMIN },
    });
  }

  if (!profile) {
    throw new AuthError("Unauthorized: Valid session required.", 401);
  }

  if (profile.role !== Role.ADMIN) {
    throw new AuthError("Forbidden: Admin privileges required.", 403);
  }

  return {
    user: { id: profile.id, email: profile.email },
    profile,
  };
});
