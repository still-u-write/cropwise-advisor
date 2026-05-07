import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero-field.jpg";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { UploadCard } from "@/components/UploadCard";
import { DiagnosisCard } from "@/components/DiagnosisCard";
import { WeatherPanel } from "@/components/WeatherPanel";
import { AdvisoryCard } from "@/components/AdvisoryCard";
import type { DiseaseAnalysis } from "@/server/analyze.functions";
import type { WeatherData } from "@/lib/weather";
import { Leaf, Sparkles, ShieldCheck, CloudSun } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "CropGuard — AI Crop Disease Detection & Weather Advisory" },
      { name: "description", content: "Upload a leaf photo to instantly diagnose crop diseases, view 7-day weather, and get farmer-ready treatment advice." },
    ],
  }),
});

function Index() {
  const [diagnosis, setDiagnosis] = useState<DiseaseAnalysis | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <img src={heroImg} alt="Healthy crop field" width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/60 to-background" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" /> AI-Powered Plant Pathology
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Diagnose crop disease in <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">seconds</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Snap a leaf, get instant disease detection with confidence scores, weather-aware risk forecasting, and actionable farmer-friendly advice.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" asChild><a href="#analyze">Analyze a leaf</a></Button>
            <Button size="lg" variant="outline" asChild><a href="#how">How it works</a></Button>
          </div>
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={<Leaf className="h-4 w-4" />} value="40+" label="diseases" />
            <Stat icon={<Sparkles className="h-4 w-4" />} value=">95%" label="accuracy" />
            <Stat icon={<CloudSun className="h-4 w-4" />} value="7-day" label="forecast" />
            <Stat icon={<ShieldCheck className="h-4 w-4" />} value="24/7" label="advisory" />
          </div>
        </div>
      </header>

      {/* Workspace */}
      <main id="analyze" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <UploadCard onResult={(r, p) => { setDiagnosis(r); setImage(p); }} />
            {diagnosis && image && <DiagnosisCard result={diagnosis} image={image} />}
          </div>
          <div className="space-y-6">
            <WeatherPanel onWeather={setWeather} />
            <AdvisoryCard diagnosis={diagnosis} weather={weather} />
          </div>
        </div>
      </main>

      {/* How */}
      <section id="how" className="border-t bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-bold tracking-tight">How CropGuard works</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">A complete pipeline from image to action — built for the field.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { n: "01", t: "Capture", d: "Upload a clear photo of an affected leaf — front-lit, in focus." },
              { n: "02", t: "Diagnose", d: "Our vision model identifies the crop, disease, severity, and affected region." },
              { n: "03", t: "Act", d: "Combined with local 7-day forecast, we deliver an urgency-ranked treatment plan." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="text-sm font-mono text-primary">{s.n}</div>
                <div className="mt-2 text-lg font-semibold">{s.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Built for farmers · CropGuard © {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border bg-card/70 p-3 backdrop-blur">
      <div className="flex items-center gap-2 text-primary">{icon}<span className="text-lg font-bold text-foreground">{value}</span></div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
