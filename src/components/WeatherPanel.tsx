import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Cloud, CloudRain, Droplets, MapPin, Search, Sun, Wind, Loader2 } from "lucide-react";
import { fetchWeather, geocode, weatherLabel, type WeatherData } from "@/lib/weather";
import { toast } from "sonner";

const riskColor: Record<string, string> = {
  low: "bg-success text-success-foreground",
  moderate: "bg-warning text-warning-foreground",
  high: "bg-destructive text-destructive-foreground",
};

export function WeatherPanel({ onWeather }: { onWeather: (w: WeatherData | null) => void }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    load(20.5937, 78.9629, "India (default)");
  }, []);

  async function load(lat: number, lon: number, label: string) {
    setLoading(true);
    try {
      const w = await fetchWeather(lat, lon, label);
      setWeather(w);
      onWeather(w);
    } catch {
      toast.error("Failed to load weather");
    } finally {
      setLoading(false);
    }
  }

  async function search() {
    if (!query.trim()) return;
    const g = await geocode(query.trim());
    if (!g) {
      toast.error("Location not found");
      return;
    }
    load(g.lat, g.lon, g.label);
  }

  return (
    <Card className="overflow-hidden border-0 bg-gradient-sky text-foreground shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-4 w-4" /> {weather?.location ?? "Loading…"}
          </CardTitle>
          {weather && <Badge className={riskColor[weather.fungalRisk]}>Fungal risk: {weather.fungalRisk}</Badge>}
        </div>
        <div className="flex gap-2 pt-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search city or village…"
            className="bg-background/70"
          />
          <Button onClick={search} variant="secondary" size="icon" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {weather && (
          <>
            <div className="grid grid-cols-4 gap-2 rounded-xl bg-background/60 p-3 text-center text-xs backdrop-blur">
              <Stat icon={<Sun className="h-4 w-4" />} label="Temp" value={`${weather.current.temp.toFixed(0)}°`} />
              <Stat icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${weather.current.humidity}%`} />
              <Stat icon={<CloudRain className="h-4 w-4" />} label="Rain" value={`${weather.current.rain}mm`} />
              <Stat icon={<Wind className="h-4 w-4" />} label="Wind" value={`${weather.current.wind.toFixed(0)}`} />
            </div>
            <p className="text-sm text-foreground/80">{weather.riskReason}</p>
            <div className="grid grid-cols-7 gap-1.5">
              {weather.daily.map((d) => (
                <div key={d.date} className="rounded-lg bg-background/60 p-2 text-center text-[11px] backdrop-blur">
                  <div className="font-medium">{new Date(d.date).toLocaleDateString(undefined, { weekday: "short" })}</div>
                  <Cloud className="mx-auto my-1 h-4 w-4 opacity-70" />
                  <div className="font-semibold">{d.tMax.toFixed(0)}°</div>
                  <div className="opacity-60">{d.tMin.toFixed(0)}°</div>
                  <div className="mt-1 text-[10px] opacity-70">{weatherLabel(d.code)}</div>
                  <div className="text-[10px]">{d.rain.toFixed(1)}mm</div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-primary">{icon}</div>
      <div className="text-base font-semibold">{value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
