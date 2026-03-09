import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { phone, registration_number } = await req.json();

    if (!phone || !registration_number) {
      return new Response(
        JSON.stringify({ error: "Phone and registration number are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/\D/g, "")}`;
    const rawPhone = phone.replace(/\D/g, "");
    const regClean = registration_number.replace(/\s/g, "").toUpperCase();

    // Find customer by phone
    const { data: customers } = await supabase
      .from("customers")
      .select("id, name")
      .or(`phone.eq.${formattedPhone},phone.eq.${rawPhone}`);

    if (!customers || customers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No records found for this phone number" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const customerIds = customers.map((c) => c.id);

    // Find car by registration
    const { data: cars } = await supabase
      .from("cars")
      .select("id, make, model, year, color, registration_number")
      .in("customer_id", customerIds)
      .ilike("registration_number", `%${regClean}%`);

    if (!cars || cars.length === 0) {
      return new Response(
        JSON.stringify({ error: "No vehicle found with this registration number" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const car = cars[0];

    // Find latest job
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, status, notes, scheduled_date, total_price, created_at")
      .eq("car_id", car.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!jobs || jobs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No active jobs found for this vehicle" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const job = jobs[0];

    // Fetch zones and media
    const [zonesRes, mediaRes] = await Promise.all([
      supabase
        .from("job_zones")
        .select("zone_name, completed, completed_at")
        .eq("job_id", job.id)
        .order("created_at"),
      supabase
        .from("job_media")
        .select("url, stage, caption, created_at")
        .eq("job_id", job.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    return new Response(
      JSON.stringify({
        job,
        car: { make: car.make, model: car.model, year: car.year, color: car.color },
        customer: customers[0],
        zones: zonesRes.data || [],
        media: mediaRes.data || [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
