import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Building2, Key, Bell, MessageCircle, Save, Loader2, Eye, EyeOff, FileText } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { studio } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [savingStudio, setSavingStudio] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [studioInfo, setStudioInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
  });
  const [whatsappSettings, setWhatsappSettings] = useState({
    api_key: "",
    phone_number: "",
  });

  useEffect(() => {
    if (studio) {
      setStudioInfo({
        name: studio.name || "",
        email: studio.email || "",
        phone: studio.phone || "",
        address: studio.address || "",
        gstin: (studio as any)?.gstin || "",
      });
      setWhatsappSettings({
        api_key: (studio as any)?.whatsapp_api_key || "",
        phone_number: (studio as any)?.whatsapp_phone_number || "",
      });
    }
  }, [studio]);

  const saveStudioInfo = async () => {
    if (!studio?.id) return;

    setSavingStudio(true);
    try {
      const { error } = await supabase
        .from("studios")
        .update({
          name: studioInfo.name,
          email: studioInfo.email || null,
          phone: studioInfo.phone || null,
          address: studioInfo.address || null,
          gstin: studioInfo.gstin || null,
        })
        .eq("id", studio.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Studio information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not save settings.",
      });
    } finally {
      setSavingStudio(false);
    }
  };

  const saveWhatsAppSettings = async () => {
    if (!studio?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("studios")
        .update({
          whatsapp_api_key: whatsappSettings.api_key || null,
          whatsapp_phone_number: whatsappSettings.phone_number || null,
        })
        .eq("id", studio.id);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "WhatsApp settings have been updated successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not save settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your studio settings and preferences
          </p>
        </motion.div>

        {/* Studio Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Studio Information
              </CardTitle>
              <CardDescription>
                Basic information about your studio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Studio Name</Label>
                <Input 
                  value={studioInfo.name} 
                  onChange={(e) => setStudioInfo({ ...studioInfo, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={studioInfo.email} 
                    onChange={(e) => setStudioInfo({ ...studioInfo, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input 
                    value={studioInfo.phone} 
                    onChange={(e) => setStudioInfo({ ...studioInfo, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input 
                  value={studioInfo.address} 
                  onChange={(e) => setStudioInfo({ ...studioInfo, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  GSTIN (Business Tax ID)
                </Label>
                <Input 
                  value={studioInfo.gstin} 
                  onChange={(e) => setStudioInfo({ ...studioInfo, gstin: e.target.value.toUpperCase() })}
                  placeholder="22AAAAA0000A1Z5"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  Your GST Identification Number for invoicing
                </p>
              </div>
              <Button onClick={saveStudioInfo} disabled={savingStudio}>
                {savingStudio ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Studio Info
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Studio Key */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Studio Join Key
              </CardTitle>
              <CardDescription>
                Share this key with staff members so they can join your studio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    value={studio?.join_key || ""}
                    readOnly
                    className="font-mono text-lg"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(studio?.join_key || "");
                    toast({
                      title: "Copied!",
                      description: "Studio key copied to clipboard.",
                    });
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Staff members can use this key when signing up to request access
                to your studio.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* WhatsApp Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                WhatsApp Integration
              </CardTitle>
              <CardDescription>
                Connect WhatsApp Business API to send automatic notifications to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>WhatsApp Business Phone Number</Label>
                <Input
                  placeholder="+91 9876543210"
                  value={whatsappSettings.phone_number}
                  onChange={(e) =>
                    setWhatsappSettings({ ...whatsappSettings, phone_number: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      placeholder="Your WhatsApp Business API key"
                      value={whatsappSettings.api_key}
                      onChange={(e) =>
                        setWhatsappSettings({ ...whatsappSettings, api_key: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from WhatsApp Business API provider (e.g., Twilio, MessageBird)
                </p>
              </div>
              <Button onClick={saveWhatsAppSettings} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save WhatsApp Settings
              </Button>

              {!whatsappSettings.api_key && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-4">
                  <p className="text-sm text-amber-600">
                    <strong>Note:</strong> Without a WhatsApp API key, automatic notifications
                    will not be sent. You can still manually send messages.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure automatic notifications to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Job Started</p>
                  <p className="text-sm text-muted-foreground">
                    Notify when work begins on their vehicle
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Zone Completed</p>
                  <p className="text-sm text-muted-foreground">
                    Notify when each service zone is completed
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Job Completed</p>
                  <p className="text-sm text-muted-foreground">
                    Notify when vehicle is ready for pickup
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Invoice Generated</p>
                  <p className="text-sm text-muted-foreground">
                    Send invoice details to customer
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}