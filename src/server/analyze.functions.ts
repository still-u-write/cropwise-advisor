import { createServerFn } from "@tanstack/react-start";

export type DiseaseAnalysis = {
  crop: string;
  status: "healthy" | "diseased";
  disease: string;
  confidence: number;
  severity: "none" | "mild" | "moderate" | "severe";
  affectedRegion: string;
  symptoms: string[];
  treatment: string[];
  preventive: string[];
};

export const analyzeLeaf = createServerFn({ method: "POST" })
  .inputValidator((d: { imageBase64: string; mimeType: string }) => d)
  .handler(async ({ data }): Promise<DiseaseAnalysis> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const schema = {
      type: "object",
      properties: {
        crop: { type: "string", description: "Crop name (e.g. Tomato, Corn, Wheat, Rice)" },
        status: { type: "string", enum: ["healthy", "diseased"] },
        disease: { type: "string", description: "Disease name or 'None' if healthy" },
        confidence: { type: "number", description: "0-100" },
        severity: { type: "string", enum: ["none", "mild", "moderate", "severe"] },
        affectedRegion: { type: "string", description: "Description of affected leaf area" },
        symptoms: { type: "array", items: { type: "string" } },
        treatment: { type: "array", items: { type: "string" } },
        preventive: { type: "array", items: { type: "string" } },
      },
      required: ["crop", "status", "disease", "confidence", "severity", "affectedRegion", "symptoms", "treatment", "preventive"],
      additionalProperties: false,
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are an expert agronomist and plant pathologist. Analyze crop leaf images for diseases. Be accurate and conservative — if the image isn't a leaf, set status='healthy', disease='Unknown', confidence=0 and explain in symptoms. Always respond by calling the provided tool.",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this crop leaf image. Identify crop, any disease, severity, and give actionable treatment + preventive guidance." },
              { type: "image_url", image_url: { url: `data:${data.mimeType};base64,${data.imageBase64}` } },
            ],
          },
        ],
        tools: [{ type: "function", function: { name: "report_diagnosis", description: "Report leaf diagnosis", parameters: schema } }],
        tool_choice: { type: "function", function: { name: "report_diagnosis" } },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`AI gateway error ${res.status}: ${body}`);
    }
    const json = await res.json();
    const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("No diagnosis returned");
    return JSON.parse(args) as DiseaseAnalysis;
  });
