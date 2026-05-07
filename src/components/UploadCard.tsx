import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { analyzeLeaf, type DiseaseAnalysis } from "@/utils/analyze.functions";
import { toast } from "sonner";

type Props = {
  onResult: (r: DiseaseAnalysis, preview: string) => void;
};

export function UploadCard({ onResult }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      const base64 = dataUrl.split(",")[1];
      setLoading(true);
      try {
        const result = await analyzeLeaf({ data: { imageBase64: base64, mimeType: file.type } });
        onResult(result, dataUrl);
        toast.success("Analysis complete");
      } catch (e) {
        console.error(e);
        toast.error("Analysis failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <Card className="overflow-hidden border-2 border-dashed bg-card/60 backdrop-blur">
      <div
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-4 p-8 text-center transition-colors hover:bg-secondary/40"
      >
        {preview ? (
          <img src={preview} alt="Uploaded leaf" className="max-h-56 rounded-lg object-cover shadow-md" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-glow">
            <ImageIcon className="h-7 w-7" />
          </div>
        )}
        <div>
          <p className="text-base font-semibold">{loading ? "Analyzing leaf…" : "Drop a leaf photo or click to upload"}</p>
          <p className="mt-1 text-sm text-muted-foreground">JPG / PNG up to 8 MB. AI detects disease in seconds.</p>
        </div>
        <Button size="lg" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {loading ? "Analyzing" : preview ? "Upload another" : "Choose image"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>
    </Card>
  );
}
