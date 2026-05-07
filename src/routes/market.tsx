import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, Minus, Loader2, Search, ExternalLink, Landmark, IndianRupee } from "lucide-react";
import { marketForecast, type MarketForecast } from "@/utils/market.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/market")({
  component: MarketPage,
  head: () => ({
    meta: [
      { title: "Market Forecast & Govt Schemes — CropGuard" },
      { name: "description", content: "AI-powered Indian mandi price forecasts using real data.gov.in data, plus government schemes for farmers." },
    ],
  }),
});

const COMMON_COMMODITIES = ["Wheat", "Rice", "Paddy(Dhan)(Common)", "Onion", "Potato", "Tomato", "Cotton", "Soyabean", "Maize", "Mustard"];
const STATES = ["", "Maharashtra", "Punjab", "Uttar Pradesh", "Karnataka", "Gujarat", "Madhya Pradesh", "Rajasthan", "Tamil Nadu", "Andhra Pradesh", "Bihar", "West Bengal", "Haryana", "Telangana", "Kerala", "Odisha"];

function MarketPage() {
  const [commodity, setCommodity] = useState("Onion");
  const [state, setState] = useState("Maharashtra");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MarketForecast | null>(null);

  async function run() {
    if (!commodity.trim()) return;
    setLoading(true);
    try {
      const r = await marketForecast({ data: { commodity: commodity.trim(), state: state.trim() } });
      setData(r);
      toast.success("Forecast ready");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to fetch market data");
    } finally {
      setLoading(false);
    }
  }

  const chartData = data
    ? [
        ...data.recentPrices.map((p) => ({ date: p.date, actual: p.price, forecast: null as number | null })),
        ...data.forecast.map((p) => ({ date: p.date, actual: null as number | null, forecast: p.price })),
      ]
    : [];

  const splitDate = data?.recentPrices.at(-1)?.date;

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs">
            <IndianRupee className="h-3 w-3 text-primary" /> Real mandi data · AI forecast
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Market forecast & government schemes</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Live Indian mandi modal prices from <span className="font-medium text-foreground">data.gov.in (Agmarknet)</span>, with a 7-day AI price forecast and curated government schemes.
          </p>
        </div>

        <Card className="border-0 shadow-elegant">
          <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Commodity</label>
              <Input value={commodity} onChange={(e) => setCommodity(e.target.value)} list="commodities" placeholder="e.g. Onion" />
              <datalist id="commodities">{COMMON_COMMODITIES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">State (optional)</label>
              <select value={state} onChange={(e) => setState(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm">
                {STATES.map((s) => <option key={s} value={s}>{s || "All India"}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={run} disabled={loading} className="w-full md:w-auto">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span className="ml-2">{loading ? "Fetching" : "Forecast"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {data && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-lg">{data.commodity} · {data.state}</CardTitle>
                    <TrendBadge trend={data.trend} />
                  </div>
                  <p className="text-xs text-muted-foreground">{data.market} · {data.unit}</p>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        {splitDate && <ReferenceLine x={splitDate} stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ value: "today", fontSize: 10, fill: "var(--primary)" }} />}
                        <Line type="monotone" dataKey="actual" stroke="oklch(0.6 0.15 150)" strokeWidth={2} dot={false} name="Actual" connectNulls />
                        <Line type="monotone" dataKey="forecast" stroke="oklch(0.65 0.18 50)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} name="Forecast" connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground"><span className="font-medium text-foreground">Why: </span>{data.trendReason}</p>
                  <div className="mt-3 rounded-xl border bg-secondary/40 p-3 text-sm">
                    <div className="font-semibold">Recommendation</div>
                    <p className="mt-1 text-muted-foreground">{data.recommendation}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg"><Landmark className="h-4 w-4 text-primary" /> Government schemes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.schemes.map((s, i) => (
                    <div key={i} className="rounded-xl border bg-card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold">{s.name}</div>
                        {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-primary"><ExternalLink className="h-4 w-4" /></a>}
                      </div>
                      <Badge variant="outline" className="mt-1 text-[10px]">{s.agency}</Badge>
                      <p className="mt-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">Benefit: </span>{s.benefit}</p>
                      <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium text-foreground">Eligibility: </span>{s.eligibility}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!data && !loading && (
          <p className="mt-8 text-center text-sm text-muted-foreground">Choose a commodity and state, then click Forecast to load real mandi prices.</p>
        )}
      </main>
    </div>
  );
}

function TrendBadge({ trend }: { trend: MarketForecast["trend"] }) {
  const map = {
    rising: { c: "bg-success text-success-foreground", I: TrendingUp, l: "Rising" },
    falling: { c: "bg-destructive text-destructive-foreground", I: TrendingDown, l: "Falling" },
    stable: { c: "bg-muted text-foreground", I: Minus, l: "Stable" },
  } as const;
  const { c, I, l } = map[trend];
  return <Badge className={`gap-1 ${c}`}><I className="h-3 w-3" />{l}</Badge>;
}
