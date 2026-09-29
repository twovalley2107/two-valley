import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/actions/authActions";
import { Role } from "@prisma/client";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const userEmail = user.email || `${userId}@user.twovalley.com`;

  // Fetch profile by user.id or email fallback
  let profile = await db.profile.findUnique({
    where: { id: userId },
  });

  if (!profile && user.email) {
    profile = await db.profile.findFirst({
      where: { email: user.email },
    });

    if (profile) {
      try {
        await db.profile.update({
          where: { id: profile.id },
          data: { id: userId, email: userEmail },
        });
      } catch {
        // Ignore if primary key update constrained
      }
    } else {
      profile = await db.profile.create({
        data: {
          id: userId,
          email: userEmail,
          name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          role: Role.CUSTOMER,
        },
      });
    }
  }

  // Strict role authorization: Admin accounts visiting /account are redirected to /admin
  if (profile?.role === Role.ADMIN) {
    redirect("/admin");
  }

  if (profile?.role !== Role.CUSTOMER) {
    redirect("/login");
  }

  async function handleLogout() {
    "use server";
    await logoutAction();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-brand-ivory px-4 py-16 font-sans">
      <div className="max-w-2xl mx-auto bg-brand-ivory/90 backdrop-blur-md p-8 rounded-2xl border border-brand-gold/20 shadow-lg">
        <h1 className="text-3xl font-serif text-brand-forest mb-2">My Account</h1>
        <p className="text-sm text-brand-olive mb-6">
          Welcome to your Two Valley personal space.
        </p>

        <div className="bg-brand-beige/50 p-6 rounded-xl border border-brand-gold/15 mb-8 space-y-3 text-sm">
          <div>
            <span className="font-semibold text-brand-charcoal">Name: </span>
            <span className="text-brand-olive">{profile?.name || user.user_metadata?.name || "Valued Customer"}</span>
          </div>
          <div>
            <span className="font-semibold text-brand-charcoal">Email: </span>
            <span className="text-brand-olive">{user.email}</span>
          </div>
          <div>
            <span className="font-semibold text-brand-charcoal">Account Role: </span>
            <span className="text-brand-forest font-semibold uppercase tracking-wider text-xs">
              {profile?.role || "CUSTOMER"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/account/orders"
            className="py-3 px-6 rounded-xl bg-brand-forest text-brand-ivory hover:bg-brand-olive transition-colors text-xs uppercase tracking-wider font-semibold shadow-sm inline-flex items-center space-x-2"
          >
            <span>View Order History</span>
            <span>&rarr;</span>
          </Link>
          <Link
            href="/wishlist"
            className="py-3 px-6 rounded-xl border border-brand-forest text-brand-forest hover:bg-brand-beige transition-colors text-xs uppercase tracking-wider font-semibold"
          >
            My Saved Wishlist
          </Link>
        </div>

        <form action={handleLogout}>
          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl border border-brand-gold/40 text-brand-olive hover:text-red-700 hover:border-red-200 hover:bg-red-50 transition-colors text-xs uppercase tracking-wider font-semibold cursor-pointer"
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
