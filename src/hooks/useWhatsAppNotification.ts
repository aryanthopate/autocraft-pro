import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SendNotificationParams {
  templateType: string;
  recipientPhone: string;
  recipientName: string;
  variables: Record<string, string>;
  customerId?: string;
  jobId?: string;
  invoiceId?: string;
}

export function useWhatsAppNotification() {
  const { studio, profile } = useAuth();
  const { toast } = useToast();

  const fillTemplate = (template: string, variables: Record<string, string>) => {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value || "");
    }
    return result;
  };

  const sendNotification = async ({
    templateType,
    recipientPhone,
    recipientName,
    variables,
    customerId,
    jobId,
    invoiceId,
  }: SendNotificationParams) => {
    if (!studio?.id) return false;

    try {
      // Fetch template
      const { data: templates } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("template_type", templateType)
        .eq("channel", "whatsapp")
        .or(`studio_id.eq.${studio.id},is_default.eq.true`)
        .order("is_default", { ascending: true })
        .limit(1);

      const template = templates?.[0];
      if (!template) {
        toast({ variant: "destructive", title: "Template not found" });
        return false;
      }

      const allVars = {
        ...variables,
        studio_name: studio.name,
        customer_name: recipientName,
      };

      const messageBody = fillTemplate(template.body_template, allVars);

      // Log the notification (mock send)
      const { error } = await supabase.from("notification_logs").insert({
        studio_id: studio.id,
        customer_id: customerId || null,
        job_id: jobId || null,
        invoice_id: invoiceId || null,
        channel: "whatsapp",
        template_type: templateType,
        recipient_phone: recipientPhone,
        recipient_name: recipientName,
        message_body: messageBody,
        status: "sent",
        metadata: { variables: allVars, mock: true },
      });

      if (error) throw error;

      // Mock: open WhatsApp web link
      const waLink = `https://wa.me/${recipientPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(messageBody)}`;

      toast({
        title: "📱 WhatsApp Message Ready",
        description: `Message prepared for ${recipientName}. Click to open WhatsApp.`,
        action: undefined,
      });

      // Open WhatsApp in new tab
      window.open(waLink, "_blank");

      return true;
    } catch (error: any) {
      toast({ variant: "destructive", title: "Notification Error", description: error.message });
      return false;
    }
  };

  return { sendNotification };
}
