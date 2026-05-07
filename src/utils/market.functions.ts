import { createServerFn } from "@tanstack/react-start";

export type MarketForecast = {
  commodity: string;
  state: string;
  market: string;
  unit: string;
  recentPrices: { date: string; price: number }[];
  forecast: { date: string; price: number }[];
  trend: "rising" | "falling" | "stable";
  trendReason: string;
  recommendation: string;
  schemes: { name: string; agency: string; benefit: string; eligibility: string; link?: string }[];
};

type Input = { commodity: string; state: string };

// Fetch real Indian mandi (market) prices from data.gov.in (Agmarknet feed).
// API key is a public/published key meant for client use, but we keep it server-side.
const DATA_GOV_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";

export const marketForecast = createServerFn({ method: "POST" })
  .inputValidator((d: Input) => d)
  .handler(async ({ data }): Promise<MarketForecast> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    // 1) Pull recent mandi records for the commodity + state
    const url = new URL("https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070");
    url.searchParams.set("api-key", DATA_GOV_KEY);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "200");
    url.searchParams.set("filters[commodity]", data.commodity);
    if (data.state) url.searchParams.set("filters[state]", data.state);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Mandi API error ${res.status}`);
    const j = await res.json();
    const records: any[] = j.records ?? [];

    // Aggregate by arrival_date → average modal price across markets
    const byDate = new Map<string, { sum: number; n: number; market: string }>();
    for (const r of records) {
      const d = r.arrival_date || r.Arrival_Date;
      const p = parseFloat(r.modal_price ?? r.Modal_Price ?? "0");
      if (!d || !p || isNaN(p)) continue;
      const cur = byDate.get(d) ?? { sum: 0, n: 0, market: r.market ?? r.Market ?? "" };
      cur.sum += p;
      cur.n += 1;
      byDate.set(d, cur);
    }

    const parseDate = (s: string) => {
      // dd/mm/yyyy
      const [dd, mm, yyyy] = s.split(/[\/\-]/);
      return new Date(`${yyyy}-${mm}-${dd}`).getTime();
    };

    const recentPrices = Array.from(byDate.entries())
      .map(([date, v]) => ({ date, price: Math.round(v.sum / v.n), ts: parseDate(date) }))
      .filter((x) => !isNaN(x.ts))
      .sort((a, b) => a.ts - b.ts)
      .slice(-30)
      .map(({ date, price }) => ({ date, price }));

    if (recentPrices.length === 0) {
      throw new Error(`No recent mandi data for ${data.commodity} in ${data.state || "India"}. Try another commodity or state.`);
    }

    const market = records[0]?.market ?? records[0]?.Market ?? "Multiple mandis";

    // 2) Ask Lovable AI to forecast next 7 days + reasoning + schemes
    const schema = {
      type: "object",
      properties: {
        forecast: {
          type: "array",
          description: "Predicted modal price (INR per quintal) for the next 7 days",
          items: {
            type: "object",
            properties: { date: { type: "string", description: "YYYY-MM-DD" }, price: { type: "number" } },
            required: ["date", "price"],
            additionalProperties: false,
          },
        },
        trend: { type: "string", enum: ["rising", "falling", "stable"] },
        trendReason: { type: "string" },
        recommendation: { type: "string", description: "Short, farmer-friendly action: sell now, hold, etc." },
        schemes: {
          type: "array",
          description: "3-5 relevant Indian government schemes for this commodity / farmers",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              agency: { type: "string" },
              benefit: { type: "string" },
              eligibility: { type: "string" },
              link: { type: "string" },
            },
            required: ["name", "agency", "benefit", "eligibility"],
            additionalProperties: false,
          },
        },
      },
      required: ["forecast", "trend", "trendReason", "recommendation", "schemes"],
      additionalProperties: false,
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are an agricultural market analyst for Indian farmers. Forecast mandi modal prices (INR/quintal) using the recent series provided. Identify trend, give a clear sell/hold recommendation, and list real Indian government schemes (PM-KISAN, PMFBY, e-NAM, MSP, KCC, PM-AASHA, Soil Health Card, etc.) relevant to the commodity. Always respond by calling the provided tool.",
          },
          {
            role: "user",
            content: `Commodity: ${data.commodity}\nState: ${data.state || "India"}\nRecent modal prices (INR/quintal):\n${recentPrices.map((p) => `${p.date}: ${p.price}`).join("\n")}\n\nForecast the next 7 days starting from the day after the latest date.`,
          },
        ],
        tools: [{ type: "function", function: { name: "report_forecast", description: "Report market forecast", parameters: schema } }],
        tool_choice: { type: "function", function: { name: "report_forecast" } },
      }),
    });

    if (!aiRes.ok) {
      const body = await aiRes.text();
      throw new Error(`AI gateway error ${aiRes.status}: ${body}`);
    }
    const aiJson = await aiRes.json();
    const args = aiJson.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No forecast returned");
    const parsed = JSON.parse(args);

    return {
      commodity: data.commodity,
      state: data.state || "India",
      market,
      unit: "INR / quintal",
      recentPrices,
      forecast: parsed.forecast,
      trend: parsed.trend,
      trendReason: parsed.trendReason,
      recommendation: parsed.recommendation,
      schemes: parsed.schemes,
    };
  });
