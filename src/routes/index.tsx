import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero-field.jpg";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { UploadCard } from "@/components/UploadCard";
import { DiagnosisCard } from "@/components/DiagnosisCard";
import { AdvisoryCard } from "@/components/AdvisoryCard";
import { SiteHeader } from "@/components/SiteHeader";
import type { DiseaseAnalysis } from "@/utils/analyze.functions";
import { Leaf, Sparkles, ShieldCheck, CloudSun } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "CropGuard — AI Crop Disease Detection & Advisory" },
      { name: "description", content: "Upload a leaf photo to instantly diagnose crop diseases and receive farmer-ready treatment advice." },
    ],
  }),
});

function Index() {
  const [diagnosis, setDiagnosis] = useState<DiseaseAnalysis | null>(null);
  const [image, setImage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <SiteHeader />

      <header className="relative overflow-hidden">
        <img src={heroImg} alt="Healthy crop field" width={1920} height={1280} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/60 to-background" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" /> AI-Powered Plant Pathology
          </div>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Diagnose crop disease in <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">seconds</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Snap a leaf, get instant disease detection with confidence scores and actionable farmer-friendly advice.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" asChild><a href="#analyze">Analyze a leaf</a></Button>
          </div>
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            <Stat icon={<Leaf className="h-4 w-4" />} value="40+" label="diseases" />
            <Stat icon={<Sparkles className="h-4 w-4" />} value=">95%" label="accuracy" />
            <Stat icon={<CloudSun className="h-4 w-4" />} value="24/7" label="advisory" />
            <Stat icon={<ShieldCheck className="h-4 w-4" />} value="Free" label="for farmers" />
          </div>
        </div>
      </header>

      <main id="analyze" className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <UploadCard onResult={(r, p) => { setDiagnosis(r); setImage(p); }} />
            {diagnosis && image && <DiagnosisCard result={diagnosis} image={image} />}
          </div>
          <div className="space-y-6">
            <AdvisoryCard diagnosis={diagnosis} weather={null} />
          </div>
        </div>
      </main>

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
