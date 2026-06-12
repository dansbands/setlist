import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { setlists } from "@/db/schema";
import { formatDuration } from "@/lib/utils";
import { getOrCreateUser } from "@/lib/users";

export default async function DashboardPage() {
  const session = await auth();
  const user = await getOrCreateUser(session);

  async function signInWithGoogle() {
    "use server";
    await signIn("google", { redirectTo: "/dashboard" });
  }

  async function signOutUser() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  if (!session?.user?.email || !user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Dashboard</p>
        <h1 className="mt-3 text-4xl font-black">Sign in to keep your setlists together.</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Guest setlists still work from their share URL. Signing in adds a private dashboard for
          setlists you create while authenticated.
        </p>
        {process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? (
          <form action={signInWithGoogle} className="mt-8">
            <Button type="submit">Sign in with Google</Button>
          </form>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.
          </p>
        )
      </main>
    );
  }

  const rows = await db
    .select()
    .from(setlists)
    .where(eq(setlists.userId, user.id))
    .orderBy(desc(setlists.createdAt));

  async function createNew() {
    "use server";
    redirect("/s/new");
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Dashboard</p>
          <h1 className="mt-2 text-4xl font-black">Your setlists</h1>
        </div>
        <div className="flex gap-2">
          <form action={createNew}>
            <Button type="submit">New setlist</Button>
          </form>
          <form action={signOutUser}>
            <Button type="submit" variant="outline">Sign out</Button>
          </form>
        </div>
      </div>
      <div className="mt-6 grid gap-3">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-border bg-white p-8">
            <h2 className="text-xl font-bold">No setlists yet</h2>
            <p className="mt-2 text-muted-foreground">Create one and it will appear here.</p>
          </div>
        ) : (
          rows.map((setlist) => (
            <Link
              key={setlist.id}
              href={`/s/${setlist.slug}`}
              className="rounded-lg border border-border bg-white p-5 transition hover:border-primary"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{setlist.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[setlist.venue, setlist.performanceDate].filter(Boolean).join(" / ") ||
                      "No venue or date yet"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-primary">—</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
