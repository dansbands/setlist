import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5">
      <h1 className="text-4xl font-black">Setlist not found</h1>
      <p className="mt-3 text-muted-foreground">That share link may have been mistyped or deleted.</p>
      <Button asChild className="mt-6 w-fit">
        <Link href="/s/new">Create a new setlist</Link>
      </Button>
    </main>
  );
}
