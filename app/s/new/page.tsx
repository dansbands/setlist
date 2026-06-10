"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSetlistPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/setlists", { method: "POST" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not create setlist");
        const data = (await response.json()) as { slug: string };
        router.replace(`/s/${data.slug}`);
      })
      .catch(() => setError("Could not create a setlist. Check your database configuration."));
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md rounded-lg border border-border bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-black">Creating your setlist</h1>
        <p className="mt-3 text-muted-foreground">
          {error || "Hang tight while we make a private share URL."}
        </p>
      </div>
    </main>
  );
}
