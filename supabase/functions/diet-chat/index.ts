import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // requests per minute
const RATE_WINDOW = 60000; // 1 minute in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// Input validation schema
const messageSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().min(1).max(4000)
    })
  ).min(1).max(50)
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Authenticate user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check user-based rate limit (50 requests per day for chat)
    const { data: rateLimitOk, error: rateLimitError } = await supabaseClient.rpc(
      'check_rate_limit',
      { _user_id: user.id, _function_name: 'diet-chat', _daily_limit: 50 }
    );

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      return new Response(
        JSON.stringify({ error: "Rate limit check failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Daily chat limit exceeded. Please try again tomorrow." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Input validation
    const body = await req.json();
    const validationResult = messageSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.log("Validation error:", validationResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input format. Please check your message structure.",
          details: validationResult.error.issues 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { messages } = validationResult.data;
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    
    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    console.log("Starting diet chat stream with", messages.length, "messages");

    const systemPrompt = `You are a friendly and knowledgeable diet tracking assistant. Your role is to:

1. Help users log their meals with detailed nutritional information
2. Provide nutrition advice and healthy eating tips
3. Track calories, protein, carbs, and fats for each meal
4. Suggest meal improvements and alternatives
5. Answer questions about nutrition and dieting

When users describe a meal:
- Ask clarifying questions if needed (portion sizes, cooking methods)
- Provide estimated nutritional values (calories, protein, carbs, fats)
- Offer helpful tips about the meal's nutritional profile
- Be encouraging and supportive
- At the END of your response, include a JSON code block with meal data in this exact format:

\`\`\`json
{
  "meal_name": "Name of the meal",
  "meal_type": "breakfast|lunch|dinner|snack",
  "calories": 500,
  "protein": 25,
  "carbs": 45,
  "fats": 15,
  "notes": "Brief description"
}
\`\`\`

Only include the JSON block when the user has clearly described a complete meal. If they're asking questions or discussing nutrition without mentioning a specific meal they ate, don't include the JSON.

Keep responses conversational, friendly, and informative. Use emojis occasionally to keep it engaging. 🥗`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "Groq API error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Diet chat error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
