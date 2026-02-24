import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 503 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
      },
    });

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

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userPrompt },
    ]);

    const content = result.response.text();
    if (!content) {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("AI error:", error?.message || error);
    const message = error?.message || "";
    if (error?.status === 429 || message.includes("429") || message.includes("RATE_LIMIT")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again in a moment." },
        { status: 429 }
      );
    }
    if (message.includes("API_KEY_INVALID") || message.includes("API key not valid")) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your Gemini API key." },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: `AI request failed: ${message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
