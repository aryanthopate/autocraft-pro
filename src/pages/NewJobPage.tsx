import { useNavigate } from "react-router-dom";
import { IntakeWizard } from "@/components/intake/IntakeWizard";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function NewJobPage() {
  const navigate = useNavigate();
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <IntakeWizard
      onComplete={(jobId) => {
        navigate(`/dashboard/jobs/${jobId}`);
      }}
      onCancel={() => {
        navigate("/dashboard/jobs");
      }}
    />
  );
}
