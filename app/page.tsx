import Link from "next/link";
import { CalendarDays, FileText, ListMusic, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: ListMusic, label: "Drag songs into show order" },
  { icon: CalendarDays, label: "Track venue, date, keys, tempos, and notes" },
  { icon: Share2, label: "Send a live URL to the band" },
  { icon: FileText, label: "Print clean charts or export PDF" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto grid min-h-[88vh] max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            For gigs, rehearsals, and lessons
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.96] sm:text-7xl">
            Set List
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-muted-foreground">
            Build a printable, phone-friendly setlist in minutes. Guest links work out of the box,
            and signed-in players can keep a reusable song library.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/s/new">Create a setlist</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 shadow-xl">
          <div className="rounded-md bg-foreground p-4 text-background">
            <div className="mb-5 flex items-center justify-between border-b border-background/20 pb-4">
              <div>
                <p className="text-sm text-background/70">Friday night</p>
                <h2 className="text-2xl font-bold">First set</h2>
              </div>
              <p className="rounded-full bg-accent px-3 py-1 text-sm font-bold text-foreground">
                42:15
              </p>
            </div>
            {["Opener in A", "Feature ballad", "Crowd singalong", "Closer"].map((song, index) => (
              <div key={song} className="mb-3 rounded-md bg-background/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{index + 1}. {song}</p>
                  <p className="text-sm text-background/70">4:{(index + 2) * 7}</p>
                </div>
                <p className="mt-1 text-sm text-background/65">Key, tempo, cue notes ready.</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="border-t border-border bg-white px-5 py-8">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.label} className="flex items-center gap-3">
              <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <p className="font-medium">{feature.label}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
