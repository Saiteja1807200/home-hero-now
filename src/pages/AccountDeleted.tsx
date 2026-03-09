import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AccountDeleted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-sm space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <ShieldCheck size={32} className="text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Your account has been deactivated</h1>
          <p className="text-sm text-muted-foreground">
            Your personal data has been removed. Booking and conversation history has been archived for platform records.
          </p>
        </div>
        <Button onClick={() => navigate("/auth")} className="w-full">
          Return to Home
        </Button>
      </div>
    </div>
  );
}
