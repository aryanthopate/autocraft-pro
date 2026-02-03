import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { QuickJobForm } from "@/components/intake/QuickJobForm";
import { Button } from "@/components/ui/button";

export default function NewJobPage() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/jobs")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Create New Job</h1>
        </div>
        <QuickJobForm
          onComplete={(jobId) => navigate(`/dashboard/jobs/${jobId}`)}
          onCancel={() => navigate("/dashboard/jobs")}
        />
      </div>
    </DashboardLayout>
  );
}
