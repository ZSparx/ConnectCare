import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecret) {
      return new Response(JSON.stringify({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY in Edge Function secrets." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (!profile || profile.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { company_id, line_items, due_date, description } = body as {
      company_id: string;
      line_items: { description: string; amount: number; quantity?: number }[];
      due_date?: string;
      description?: string;
    };

    if (!company_id || !Array.isArray(line_items) || line_items.length === 0) {
      return new Response(JSON.stringify({ error: "company_id and at least one line item are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    for (const item of line_items) {
      if (!item.description || !(Number(item.amount) > 0)) {
        return new Response(JSON.stringify({ error: "Each line item needs a description and a positive amount" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", company_id)
      .maybeSingle();
    if (companyError || !company) {
      return new Response(JSON.stringify({ error: "Company not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!company.contact_email) {
      return new Response(JSON.stringify({ error: "This company has no contact email on file, so Stripe cannot send the invoice." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let customerId: string | null = company.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: company.name,
        email: company.contact_email,
        metadata: { company_id: company.id },
      });
      customerId = customer.id;
      await supabase.from("companies").update({ stripe_customer_id: customerId }).eq("id", company_id);
    }

    for (const item of line_items) {
      await stripe.invoiceItems.create({
        customer: customerId,
        description: item.description,
        quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
        unit_amount: Math.round(Number(item.amount) * 100),
        currency: "usd",
      });
    }

    const invoiceParams: Stripe.InvoiceCreateParams = {
      customer: customerId,
      collection_method: "send_invoice",
      description: description || undefined,
      auto_advance: true,
    };
    if (due_date) {
      invoiceParams.due_date = Math.floor(new Date(due_date).getTime() / 1000);
    } else {
      invoiceParams.days_until_due = 14;
    }

    const invoice = await stripe.invoices.create(invoiceParams);
    await stripe.invoices.finalizeInvoice(invoice.id);
    const sent = await stripe.invoices.sendInvoice(invoice.id);

    await supabase.from("invoices").insert({
      company_id,
      stripe_invoice_id: sent.id,
      stripe_customer_id: customerId,
      invoice_number: sent.number || "",
      status: sent.status || "open",
      amount_due: (sent.amount_due || 0) / 100,
      amount_paid: (sent.amount_paid || 0) / 100,
      currency: sent.currency || "usd",
      description: description || "",
      due_date: due_date || null,
      hosted_invoice_url: sent.hosted_invoice_url,
      pdf_url: sent.invoice_pdf,
      created_by: userData.user.id,
    });

    return new Response(
      JSON.stringify({ success: true, invoice_url: sent.hosted_invoice_url, invoice_number: sent.number }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
