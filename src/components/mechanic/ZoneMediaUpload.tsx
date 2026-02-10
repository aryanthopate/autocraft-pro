import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ZoneMediaUploadProps {
  jobId: string;
  zoneId: string;
  zoneName: string;
  profileId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ZoneMediaUpload({
  jobId,
  zoneId,
  zoneName,
  profileId,
  open,
  onOpenChange,
}: ZoneMediaUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [stage, setStage] = useState<"before" | "after">("before");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ variant: "destructive", title: "Invalid file", description: "Please select an image." });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Max 10MB." });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      const ext = selectedFile.name.split(".").pop();
      const path = `${jobId}/${zoneId}/${stage}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("car-models")
        .upload(`job-media/${path}`, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("car-models")
        .getPublicUrl(`job-media/${path}`);

      const { error: dbError } = await supabase
        .from("job_media")
        .insert({
          job_id: jobId,
          zone_id: zoneId,
          url: urlData.publicUrl,
          type: "image",
          stage,
          caption: caption || null,
          uploaded_by: profileId,
        });

      if (dbError) throw dbError;

      toast({ title: "Photo uploaded!", description: `${stage} photo saved for ${zoneName}.` });
      resetAndClose();
    } catch (err) {
      console.error("Upload error:", err);
      toast({ variant: "destructive", title: "Upload failed", description: "Could not upload photo." });
    } finally {
      setUploading(false);
    }
  };

  const resetAndClose = () => {
    setPreview(null);
    setSelectedFile(null);
    setCaption("");
    setStage("before");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Upload Photo — {zoneName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Stage Toggle */}
          <div className="flex gap-2">
            {(["before", "after"] as const).map((s) => (
              <Button
                key={s}
                variant={stage === s ? "default" : "outline"}
                size="sm"
                className="flex-1 capitalize"
                onClick={() => setStage(s)}
              >
                {s}
              </Button>
            ))}
          </div>

          {/* Upload Area */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {preview ? (
            <div className="relative rounded-lg overflow-hidden border">
              <img src={preview} alt="Preview" className="w-full max-h-64 object-cover" />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur"
                onClick={() => { setPreview(null); setSelectedFile(null); }}
              >
                <X className="h-4 w-4" />
              </Button>
              <Badge className="absolute bottom-2 left-2 capitalize bg-background/80 text-foreground">
                {stage}
              </Badge>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Tap to take photo or upload</p>
                <p className="text-xs text-muted-foreground">JPG, PNG up to 10MB</p>
              </div>
            </button>
          )}

          {/* Caption */}
          <div className="space-y-1.5">
            <Label className="text-sm">Caption (optional)</Label>
            <Textarea
              placeholder="Describe what's shown..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetAndClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 gap-2"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
