import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Loader2, Image as ImageIcon, CheckCircle2, Trash2 } from "lucide-react";
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

interface MediaItem {
  id: string;
  url: string;
  stage: string;
  caption: string | null;
  created_at: string;
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
  const [existingMedia, setExistingMedia] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  useEffect(() => {
    if (open && jobId && zoneId) {
      fetchExistingMedia();
    }
  }, [open, jobId, zoneId]);

  const fetchExistingMedia = async () => {
    setLoadingMedia(true);
    try {
      const { data, error } = await supabase
        .from("job_media")
        .select("id, url, stage, caption, created_at")
        .eq("job_id", jobId)
        .eq("zone_id", zoneId)
        .order("created_at", { ascending: false });

      if (!error && data) setExistingMedia(data);
    } catch {
      // silent
    } finally {
      setLoadingMedia(false);
    }
  };

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
        .from("job-media")
        .upload(path, selectedFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("job-media")
        .getPublicUrl(path);

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
      setPreview(null);
      setSelectedFile(null);
      setCaption("");
      fetchExistingMedia();
    } catch (err) {
      console.error("Upload error:", err);
      toast({ variant: "destructive", title: "Upload failed", description: "Could not upload photo." });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    try {
      const { error } = await supabase.from("job_media").delete().eq("id", mediaId);
      if (error) throw error;
      toast({ title: "Photo removed" });
      fetchExistingMedia();
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Could not delete photo." });
    }
  };

  const resetAndClose = () => {
    setPreview(null);
    setSelectedFile(null);
    setCaption("");
    setStage("before");
    onOpenChange(false);
  };

  const beforePhotos = existingMedia.filter(m => m.stage === "before");
  const afterPhotos = existingMedia.filter(m => m.stage === "after");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Photos — {zoneName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Existing Photos Gallery */}
          {existingMedia.length > 0 && (
            <div className="space-y-3">
              {beforePhotos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Before</p>
                  <div className="grid grid-cols-3 gap-2">
                    {beforePhotos.map(media => (
                      <div key={media.id} className="relative group rounded-lg overflow-hidden border aspect-square">
                        <img src={media.url} alt="Before" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleDeleteMedia(media.id)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {afterPhotos.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">After</p>
                  <div className="grid grid-cols-3 gap-2">
                    {afterPhotos.map(media => (
                      <div key={media.id} className="relative group rounded-lg overflow-hidden border aspect-square">
                        <img src={media.url} alt="After" className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleDeleteMedia(media.id)}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          {existingMedia.length > 0 && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Add New</span></div>
            </div>
          )}

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
              className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">Tap to take photo or upload</p>
                <p className="text-xs text-muted-foreground">JPG, PNG up to 10MB</p>
              </div>
            </button>
          )}

          {/* Caption */}
          {selectedFile && (
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
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={resetAndClose} className="flex-1">
              {existingMedia.length > 0 ? "Done" : "Cancel"}
            </Button>
            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Upload
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
