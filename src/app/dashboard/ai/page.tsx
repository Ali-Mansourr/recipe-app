"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChefHat, Loader2, ArrowRight, RefreshCcw, Utensils, Calendar, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AIChefPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Chef
        </h1>
        <p className="text-muted-foreground">
          Use AI to generate recipes, find substitutes, and plan meals
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate" className="gap-2">
            <ChefHat className="h-4 w-4" /> Generate
          </TabsTrigger>
          <TabsTrigger value="substitute" className="gap-2">
            <FlaskConical className="h-4 w-4" /> Substitute
          </TabsTrigger>
          <TabsTrigger value="mealplan" className="gap-2">
            <Calendar className="h-4 w-4" /> Meal Plan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          <GenerateRecipeTab />
        </TabsContent>
        <TabsContent value="substitute">
          <SubstituteTab />
        </TabsContent>
        <TabsContent value="mealplan">
          <MealPlanTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function GenerateRecipeTab() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "generate", prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        toast.error(data.error || "AI generation failed");
      }
    } catch {
      toast.error("Failed to generate recipe");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: result.title,
          description: result.description,
          ingredients: result.ingredients,
          instructions: result.instructions,
          cuisineType: result.cuisineType,
          prepTime: result.prepTime,
          cookTime: result.cookTime,
          servings: result.servings,
          tags: result.tags || [],
        }),
      });
      if (res.ok) {
        const recipe = await res.json();
        toast.success("Recipe saved!");
        router.push(`/dashboard/recipes/${recipe.id}`);
      }
    } catch {
      toast.error("Failed to save recipe");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate a Recipe</CardTitle>
          <CardDescription>
            Describe what you want to cook, list ingredients you have, or specify dietary preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <Textarea
              placeholder="e.g., A healthy chicken stir-fry with vegetables, or I have eggs, cheese, and spinach..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Recipe
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{result.title}</CardTitle>
                <CardDescription>{result.description}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setResult(null); }} className="gap-2">
                  <RefreshCcw className="h-4 w-4" /> Regenerate
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Save to My Recipes
                </Button>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {result.cuisineType && <Badge variant="outline">{result.cuisineType}</Badge>}
              {result.prepTime && <Badge variant="secondary">{result.prepTime} min prep</Badge>}
              {result.cookTime && <Badge variant="secondary">{result.cookTime} min cook</Badge>}
              {result.servings && <Badge variant="secondary">{result.servings} servings</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Ingredients</h4>
              <ul className="space-y-1">
                {result.ingredients?.map((ing: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Instructions</h4>
              <ol className="space-y-2">
                {result.instructions?.map((inst: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    {inst}
                  </li>
                ))}
              </ol>
            </div>
            {result.tags && (
              <div className="flex gap-1 flex-wrap">
                {result.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="secondary">{tag}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SubstituteTab() {
  const [ingredient, setIngredient] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSubstitute(e: React.FormEvent) {
    e.preventDefault();
    if (!ingredient.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const prompt = context
        ? `Find substitutes for "${ingredient}". Context: ${context}`
        : `Find substitutes for "${ingredient}"`;
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "substitute", prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        toast.error(data.error || "Failed to find substitutes");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ingredient Substitution</CardTitle>
          <CardDescription>
            Don&apos;t have an ingredient? Find smart alternatives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubstitute} className="space-y-4">
            <div className="space-y-2">
              <Label>Ingredient to substitute</Label>
              <Input
                placeholder="e.g., buttermilk, heavy cream, soy sauce"
                value={ingredient}
                onChange={(e) => setIngredient(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Dietary restrictions (optional)</Label>
              <Input
                placeholder="e.g., vegan, gluten-free, nut-free"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
              Find Substitutes
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Substitutes for {result.original}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.substitutes?.map((sub: any, i: number) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted">
                  <Utensils className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{sub.name}</p>
                    <p className="text-sm text-muted-foreground">{sub.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MealPlanTab() {
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const prompt = preferences
        ? `Generate a 7-day meal plan. Preferences: ${preferences}`
        : "Generate a balanced 7-day meal plan with variety";
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "mealplan", prompt }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        toast.error(data.error || "Failed to generate meal plan");
      }
    } catch {
      toast.error("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Meal Plan</CardTitle>
          <CardDescription>
            Generate a personalized 7-day meal plan with a shopping list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label>Preferences (optional)</Label>
              <Textarea
                placeholder="e.g., Mediterranean diet, high protein, vegetarian, quick meals under 30 minutes"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                rows={2}
              />
            </div>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              Generate Meal Plan
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.days?.map((day: any, i: number) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{day.day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Breakfast</p>
                    <p>{day.breakfast}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Lunch</p>
                    <p>{day.lunch}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Dinner</p>
                    <p>{day.dinner}</p>
                  </div>
                  {day.snack && (
                    <div>
                      <p className="font-medium text-muted-foreground">Snack</p>
                      <p>{day.snack}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {result.shoppingList && (
            <Card>
              <CardHeader>
                <CardTitle>Shopping List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {result.shoppingList.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
