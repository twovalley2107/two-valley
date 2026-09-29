import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { validateRedirectUrl } from "@/lib/auth/redirect";
import { cookies } from "next/headers";
import { migrateGuestSessionToProfile } from "@/actions/authActions";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") || searchParams.get("redirectTo");
  const next = validateRedirectUrl(rawNext, "/account");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const userId = user.id;
        const userEmail = user.email || `${userId}@user.twovalley.com`;
        const userName = user.user_metadata?.full_name || user.user_metadata?.name || null;

        // Retrieve or sync Profile in Prisma DB
        let profile = await db.profile.findUnique({ where: { id: userId } });
        if (!profile) {
          profile = await db.profile.findFirst({
            where: { email: userEmail },
          });

          if (profile) {
            try {
              await db.profile.update({
                where: { id: profile.id },
                data: {
                  id: userId,
                  email: userEmail,
                  name: profile.name || userName,
                },
              });
            } catch {
              // Ignore if ID update constrained
            }
          } else {
            profile = await db.profile.create({
              data: {
                id: userId,
                email: userEmail,
                name: userName,
                role: Role.CUSTOMER,
              },
            });
          }
        }

        // Migrate guest session items if guest session_id cookie exists
        try {
          const cookieStore = await cookies();
          const sessionId = cookieStore.get("session_id")?.value;
          if (sessionId) {
            await migrateGuestSessionToProfile(sessionId, profile.id);
          }
        } catch (cookieErr) {
          console.warn("Failed guest session migration on OAuth callback:", cookieErr);
        }

        // If user is an ADMIN logging in via OAuth, redirect to /admin
        if (profile.role === Role.ADMIN) {
          return NextResponse.redirect(`${origin}/admin`);
        }

        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Fallback if code exchange fails
  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
