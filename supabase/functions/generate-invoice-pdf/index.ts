import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoice_id } = await req.json();
    if (!invoice_id) {
      return new Response(JSON.stringify({ error: "invoice_id is required" }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch invoice with relations
    const { data: invoice, error: invError } = await supabase
      .from("invoices")
      .select("*, customers(name, phone, email, address, gstn), jobs(id, total_price, cars(make, model, registration_number, color))")
      .eq("id", invoice_id)
      .single();

    if (invError || !invoice) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Fetch studio
    const { data: studio } = await supabase
      .from("studios")
      .select("name, email, phone, address, gstin")
      .eq("id", invoice.studio_id)
      .single();

    // Fetch job zones for line items
    const { data: zones } = await supabase
      .from("job_zones")
      .select("zone_name, zone_type, services, price")
      .eq("job_id", invoice.job_id);

    const customer = invoice.customers;
    const car = invoice.jobs?.cars;
    const subtotal = invoice.subtotal || invoice.amount;
    const gstPct = invoice.gst_percentage || 18;
    const gstAmt = invoice.gst_amount || (subtotal * gstPct / 100);
    const grandTotal = subtotal + gstAmt;

    // Generate HTML invoice
    const zoneRows = (zones || []).map((z: any, i: number) => {
      const services = Array.isArray(z.services) ? z.services.join(", ") : "";
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${z.zone_name} - ${z.zone_type}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${services}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">₹${(z.price || 0).toLocaleString("en-IN")}</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; color: #1a1a1a; background: #fff; }
  .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
  .studio-name { font-size: 28px; font-weight: 700; color: #FF6600; }
  .invoice-title { font-size: 32px; font-weight: 700; color: #333; text-align: right; }
  .invoice-meta { text-align: right; color: #666; font-size: 14px; }
  .section { margin-bottom: 24px; }
  .section-title { font-size: 12px; text-transform: uppercase; font-weight: 600; color: #999; margin-bottom: 8px; letter-spacing: 1px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .info-box { background: #f9fafb; border-radius: 8px; padding: 16px; }
  .info-box p { margin: 2px 0; font-size: 14px; }
  .info-box .label { color: #999; font-size: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { background: #f3f4f6; padding: 10px 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; }
  .totals { margin-left: auto; width: 280px; }
  .totals tr td { padding: 6px 8px; font-size: 14px; }
  .totals .grand { font-size: 18px; font-weight: 700; border-top: 2px solid #333; }
  .footer { margin-top: 48px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  .gstin-badge { display: inline-block; background: #FFF3E0; color: #E65100; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
</style></head><body>
  <div class="header">
    <div>
      <div class="studio-name">${studio?.name || "Studio"}</div>
      <p style="color:#666;font-size:14px;margin:4px 0;">${studio?.address || ""}</p>
      <p style="color:#666;font-size:14px;margin:2px 0;">${studio?.phone || ""} ${studio?.email ? "• " + studio.email : ""}</p>
      ${studio?.gstin ? `<span class="gstin-badge">GSTIN: ${studio.gstin}</span>` : ""}
    </div>
    <div>
      <div class="invoice-title">INVOICE</div>
      <div class="invoice-meta">
        <p><strong>${invoice.invoice_number}</strong></p>
        <p>Date: ${new Date(invoice.created_at).toLocaleDateString("en-IN")}</p>
        ${invoice.due_date ? `<p>Due: ${new Date(invoice.due_date).toLocaleDateString("en-IN")}</p>` : ""}
        <p>Status: ${invoice.status.toUpperCase()}</p>
      </div>
    </div>
  </div>

  <div class="info-grid section">
    <div class="info-box">
      <div class="section-title">Bill To</div>
      <p><strong>${customer?.name || "Customer"}</strong></p>
      <p>${customer?.phone || ""}</p>
      <p>${customer?.email || ""}</p>
      <p>${customer?.address || ""}</p>
      ${customer?.gstn ? `<p class="label">GSTN: ${customer.gstn}</p>` : ""}
    </div>
    <div class="info-box">
      <div class="section-title">Vehicle</div>
      <p><strong>${car?.make || ""} ${car?.model || ""}</strong></p>
      ${car?.registration_number ? `<p>Reg: ${car.registration_number}</p>` : ""}
      ${car?.color ? `<p>Color: ${car.color}</p>` : ""}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Services</div>
    <table>
      <thead><tr><th>#</th><th>Zone / Service</th><th>Details</th><th style="text-align:right;">Amount</th></tr></thead>
      <tbody>
        ${zoneRows || `<tr><td colspan="4" style="padding:8px;">Detailing services</td></tr>`}
      </tbody>
    </table>
  </div>

  <table class="totals">
    <tr><td>Subtotal</td><td style="text-align:right;">₹${subtotal.toLocaleString("en-IN")}</td></tr>
    <tr><td>GST (${gstPct}%)</td><td style="text-align:right;">₹${gstAmt.toLocaleString("en-IN")}</td></tr>
    <tr class="grand"><td>Grand Total</td><td style="text-align:right;">₹${grandTotal.toLocaleString("en-IN")}</td></tr>
  </table>

  ${invoice.notes ? `<div class="section"><div class="section-title">Notes</div><p style="font-size:14px;color:#666;">${invoice.notes}</p></div>` : ""}

  <div class="footer">
    <p>Thank you for your business!</p>
    <p>${studio?.name || "Studio"} • Generated on ${new Date().toLocaleDateString("en-IN")}</p>
  </div>
</body></html>`;

    return new Response(JSON.stringify({ html, invoice, studio }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
