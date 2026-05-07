import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, AlertTriangle, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import type { DiseaseAnalysis } from "@/utils/analyze.functions";

const sevColor: Record<string, string> = {
  none: "bg-success text-success-foreground",
  mild: "bg-warning text-warning-foreground",
  moderate: "bg-accent text-accent-foreground",
  severe: "bg-destructive text-destructive-foreground",
};

export function DiagnosisCard({ result, image }: { result: DiseaseAnalysis; image: string }) {
  const healthy = result.status === "healthy";
  return (
    <Card className="overflow-hidden border-0 shadow-elegant">
      <div className="grid md:grid-cols-[260px_1fr]">
        <div className="relative bg-gradient-leaf p-4">
          <img src={image} alt="Analyzed leaf" className="h-full w-full rounded-lg object-cover" />
          <Badge className={`absolute right-6 top-6 ${sevColor[result.severity]}`}>{result.severity}</Badge>
        </div>
        <div className="p-6">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="h-4 w-4" /> {result.crop}
            </div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              {healthy ? <CheckCircle2 className="h-6 w-6 text-success" /> : <AlertTriangle className="h-6 w-6 text-destructive" />}
              {healthy ? "Looks healthy" : result.disease}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0">
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span>{result.confidence.toFixed(0)}%</span>
              </div>
              <Progress value={result.confidence} className="h-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Affected region: </span>
              {result.affectedRegion}
            </p>
            <Section icon={<Sparkles className="h-4 w-4" />} title="Symptoms" items={result.symptoms} />
            {!healthy && <Section icon={<ShieldCheck className="h-4 w-4 text-destructive" />} title="Treatment" items={result.treatment} />}
            <Section icon={<ShieldCheck className="h-4 w-4 text-primary" />} title="Preventive measures" items={result.preventive} />
          </CardContent>
        </div>
      </div>
    </Card>
  );
}

function Section({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-sm font-semibold">{icon}{title}</div>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{it}</li>
        ))}
      </ul>
    </div>
  );
}
