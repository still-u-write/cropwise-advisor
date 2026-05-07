import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock } from "lucide-react";
import type { DiseaseAnalysis } from "@/utils/analyze.functions";
import type { WeatherData } from "@/lib/weather";

export function AdvisoryCard({ diagnosis, weather }: { diagnosis: DiseaseAnalysis | null; weather: WeatherData | null }) {
  const advisories = buildAdvisories(diagnosis, weather);
  return (
    <Card className="border-0 shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-4 w-4 text-accent" /> Advisory & Action Plan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {advisories.length === 0 && <p className="text-sm text-muted-foreground">Upload a leaf image and set your location to receive personalized recommendations.</p>}
        {advisories.map((a, i) => (
          <div key={i} className="flex gap-3 rounded-xl border bg-secondary/40 p-3">
            <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${a.urgency === "urgent" ? "bg-destructive" : a.urgency === "soon" ? "bg-warning" : "bg-success"}`} />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{a.title}</p>
                <Badge variant="outline" className="gap-1 text-[10px]"><Clock className="h-3 w-3" />{a.window}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{a.detail}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

type Advisory = { title: string; detail: string; urgency: "urgent" | "soon" | "routine"; window: string };

function buildAdvisories(d: DiseaseAnalysis | null, w: WeatherData | null): Advisory[] {
  const out: Advisory[] = [];
  if (!d && !w) return out;

  const rainSoon = w && w.daily.slice(0, 2).some((x) => x.rain > 5);

  if (d && d.status === "diseased") {
    if (d.severity === "severe" || rainSoon) {
      out.push({
        title: `Treat ${d.disease} immediately`,
        detail: `${d.treatment[0] ?? "Apply recommended fungicide/pesticide."} ${rainSoon ? "Rain expected within 48h — act before precipitation washes off treatment." : ""}`,
        urgency: "urgent",
        window: "Within 24h",
      });
    } else {
      out.push({
        title: `Manage ${d.disease}`,
        detail: d.treatment[0] ?? "Begin treatment based on guidance below.",
        urgency: "soon",
        window: "Within 2–3 days",
      });
    }
    if (d.preventive[0]) {
      out.push({ title: "Preventive maintenance", detail: d.preventive[0], urgency: "routine", window: "Ongoing" });
    }
  } else if (d && d.status === "healthy") {
    out.push({ title: "Crop appears healthy", detail: "Continue routine monitoring and irrigation schedule.", urgency: "routine", window: "Weekly" });
  }

  if (w?.fungalRisk === "high") {
    out.push({
      title: "High fungal outbreak risk",
      detail: `${w.riskReason} Consider preventive fungicide and improve air circulation.`,
      urgency: "soon",
      window: "Next 3 days",
    });
  } else if (w?.fungalRisk === "moderate") {
    out.push({ title: "Monitor for early disease signs", detail: w.riskReason, urgency: "routine", window: "This week" });
  }

  return out;
}
