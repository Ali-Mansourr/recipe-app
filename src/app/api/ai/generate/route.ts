import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 503 }
      );
    }

    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { prompt, type } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "generate":
        systemPrompt = `You are a professional chef and recipe creator. Generate a detailed recipe based on the user's request. Return a valid JSON object with these fields:
        - title (string)
        - description (string, 1-2 sentences)
        - ingredients (array of strings, each with quantity and ingredient)
        - instructions (array of strings, step-by-step)
        - cuisineType (string)
        - prepTime (number in minutes)
        - cookTime (number in minutes)
        - servings (number)
        - tags (array of strings)
        Return ONLY valid JSON, no markdown or extra text.`;
        userPrompt = prompt;
        break;

      case "substitute":
        systemPrompt = `You are a culinary expert. The user will give you an ingredient and optionally dietary restrictions. Suggest 3-5 substitutes with brief explanations. Return a JSON object with:
        - original (string)
        - substitutes (array of objects with "name" and "notes" fields)
        Return ONLY valid JSON, no markdown or extra text.`;
        userPrompt = prompt;
        break;

      case "mealplan":
        systemPrompt = `You are a meal planning expert. Generate a 7-day meal plan based on the user's preferences. Return a JSON object with:
        - days (array of 7 objects, each with "day", "breakfast", "lunch", "dinner", and "snack" fields as strings)
        - shoppingList (array of strings with quantities)
        Return ONLY valid JSON, no markdown or extra text.`;
        userPrompt = prompt;
        break;

      case "analyze":
        systemPrompt = `You are a culinary and nutrition expert. Analyze the given recipe and return a JSON object with:
        - cuisineType (string)
        - estimatedPrepTime (number in minutes)
        - estimatedCookTime (number in minutes)
        - difficulty (string: "Easy", "Medium", or "Hard")
        - nutritionEstimate (object with "calories", "protein", "carbs", "fat" as strings with units)
        - tips (array of 2-3 helpful cooking tips)
        - tags (array of relevant tags)
        Return ONLY valid JSON, no markdown or extra text.`;
        userPrompt = prompt;
        break;

      default:
        return NextResponse.json({ error: "Invalid AI type" }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI error:", error);
    if (error?.code === "insufficient_quota") {
      return NextResponse.json(
        { error: "OpenAI quota exceeded. Please check your API key." },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }
}
