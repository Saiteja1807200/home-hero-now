import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  userId: string;
  currentUrl: string | null;
  onUploaded: (url: string) => void;
}

export default function AvatarUpload({ userId, currentUrl, onUploaded }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const initials = "?";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2 MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
    onUploaded(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  };

  return (
    <div className="relative mx-auto w-24 h-24">
      {currentUrl ? (
        <img src={currentUrl} alt="Avatar" className="h-24 w-24 rounded-2xl object-cover" />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-2xl font-bold">
          {initials}
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md"
      >
        <Camera size={14} />
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
