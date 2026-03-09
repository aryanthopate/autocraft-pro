import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { phone } = await req.json();
    if (!phone || phone.length < 10) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    // Find customer by phone
    const { data: customers } = await supabase
      .from("customers")
      .select("id, name, phone, email")
      .or(`phone.ilike.%${cleanPhone},whatsapp_number.ilike.%${cleanPhone}`);

    if (!customers || customers.length === 0) {
      return new Response(JSON.stringify({ error: "No customer found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const customer = customers[0];

    // Fetch vehicles
    const { data: vehicles } = await supabase
      .from("cars")
      .select("id, make, model, registration_number, color, vehicle_type")
      .eq("customer_id", customer.id);

    // Fetch jobs with zones
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, status, created_at, total_price, notes, scheduled_date, estimated_completion, car_id")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const enrichedJobs = [];
    for (const job of (jobs || [])) {
      const car = (vehicles || []).find(v => v.id === job.car_id);
      const { data: zones } = await supabase
        .from("job_zones")
        .select("zone_name, completed, services")
        .eq("job_id", job.id);

      enrichedJobs.push({
        ...job,
        car: car || { make: "Unknown", model: "Vehicle", registration_number: null },
        zones: zones || [],
      });
    }

    return new Response(JSON.stringify({
      customer: { name: customer.name, phone: customer.phone, email: customer.email },
      vehicles: vehicles || [],
      jobs: enrichedJobs,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
