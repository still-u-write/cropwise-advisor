import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { WeatherPanel } from "@/components/WeatherPanel";
import { SiteHeader } from "@/components/SiteHeader";
import type { WeatherData } from "@/lib/weather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CloudSun, Droplets, Wind } from "lucide-react";

export const Route = createFileRoute("/weather")({
  component: WeatherPage,
  head: () => ({
    meta: [
      { title: "Weather Forecast — CropGuard" },
      { name: "description", content: "7-day localized weather forecast and fungal-risk insights for your farm location." },
    ],
  }),
});

function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs">
            <CloudSun className="h-3 w-3 text-primary" /> Weather & Risk
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Localized weather forecast</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Search any location to get a 7-day forecast with fungal-outbreak risk based on humidity and rainfall.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <WeatherPanel onWeather={setWeather} />
          <div className="space-y-4">
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-base">How risk is calculated</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-2"><Droplets className="mt-0.5 h-4 w-4 text-primary" /> Avg humidity &gt; 80% over 3 days raises fungal risk to <b className="text-foreground">high</b>.</div>
                <div className="flex gap-2"><CloudSun className="mt-0.5 h-4 w-4 text-primary" /> Total rainfall &gt; 25 mm over 3 days raises fungal risk to <b className="text-foreground">high</b>.</div>
                <div className="flex gap-2"><Wind className="mt-0.5 h-4 w-4 text-primary" /> Moderate humidity (65–80%) or some rain → <b className="text-foreground">moderate</b> risk.</div>
              </CardContent>
            </Card>
            {weather && (
              <Card className="border-0 shadow-elegant">
                <CardHeader><CardTitle className="text-base">Today at {weather.location}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{weather.riskReason}</CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
