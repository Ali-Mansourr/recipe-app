"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RecipeFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    cuisineType: string;
    prepTime: string;
    cookTime: string;
    servings: string;
    imageUrl: string;
    status: string;
    isPublic: boolean;
    tags: string[];
  };
}

const CUISINE_TYPES = [
  "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai",
  "French", "Mediterranean", "American", "Korean", "Vietnamese",
  "Middle Eastern", "African", "Caribbean", "Other",
];

export function RecipeForm({ initialData }: RecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [ingredients, setIngredients] = useState<string[]>(
    initialData?.ingredients || [""]
  );
  const [instructions, setInstructions] = useState<string[]>(
    initialData?.instructions || [""]
  );
  const [cuisineType, setCuisineType] = useState(initialData?.cuisineType || "");
  const [prepTime, setPrepTime] = useState(initialData?.prepTime || "");
  const [cookTime, setCookTime] = useState(initialData?.cookTime || "");
  const [servings, setServings] = useState(initialData?.servings || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [status, setStatus] = useState(initialData?.status || "NONE");
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);

  function addIngredient() {
    setIngredients([...ingredients, ""]);
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function updateIngredient(index: number, value: string) {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  }

  function addInstruction() {
    setInstructions([...instructions, ""]);
  }

  function removeInstruction(index: number) {
    setInstructions(instructions.filter((_, i) => i !== index));
  }

  function updateInstruction(index: number, value: string) {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  async function handleAiAnalyze() {
    if (!title && ingredients.filter(Boolean).length === 0) {
      toast.error("Add a title or some ingredients first");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "analyze",
          prompt: `Recipe: ${title}\nIngredients: ${ingredients.filter(Boolean).join(", ")}\nInstructions: ${instructions.filter(Boolean).join(". ")}`,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.cuisineType && !cuisineType) setCuisineType(data.cuisineType);
        if (data.estimatedPrepTime && !prepTime) setPrepTime(String(data.estimatedPrepTime));
        if (data.estimatedCookTime && !cookTime) setCookTime(String(data.estimatedCookTime));
        if (data.tags) setTags([...new Set([...tags, ...data.tags.map((t: string) => t.toLowerCase())])]);
        toast.success("AI analysis applied!");
      } else {
        toast.error(data.error || "AI analysis failed");
      }
    } catch {
      toast.error("AI analysis failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const filteredIngredients = ingredients.filter(Boolean);
    const filteredInstructions = instructions.filter(Boolean);

    if (!title || filteredIngredients.length === 0 || filteredInstructions.length === 0) {
      toast.error("Title, ingredients, and instructions are required");
      setLoading(false);
      return;
    }

    try {
      const url = initialData?.id
        ? `/api/recipes/${initialData.id}`
        : "/api/recipes";

      const res = await fetch(url, {
        method: initialData?.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          ingredients: filteredIngredients,
          instructions: filteredInstructions,
          cuisineType,
          prepTime,
          cookTime,
          servings,
          imageUrl,
          status,
          isPublic,
          tags,
        }),
      });

      if (res.ok) {
        const recipe = await res.json();
        toast.success(initialData?.id ? "Recipe updated!" : "Recipe created!");
        router.push(`/dashboard/recipes/${recipe.id}`);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save recipe");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Recipe Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Classic Margherita Pizza"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description of your recipe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuisineType">Cuisine</Label>
              <Select value={cuisineType} onValueChange={setCuisineType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {CUISINE_TYPES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepTime">Prep (min)</Label>
              <Input
                id="prepTime"
                type="number"
                min="0"
                placeholder="15"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookTime">Cook (min)</Label>
              <Input
                id="cookTime"
                type="number"
                min="0"
                placeholder="30"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Servings</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                placeholder="4"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredients *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder={`Ingredient ${i + 1} (e.g., 2 cups flour)`}
                value={ing}
                onChange={(e) => updateIngredient(i, e.target.value)}
              />
              {ingredients.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(i)}>
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addIngredient} className="gap-2">
            <Plus className="h-4 w-4" /> Add Ingredient
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions *</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {instructions.map((inst, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex items-center text-sm text-muted-foreground w-8">
                {i + 1}.
              </span>
              <Textarea
                placeholder={`Step ${i + 1}`}
                value={inst}
                onChange={(e) => updateInstruction(i, e.target.value)}
                rows={2}
                className="flex-1"
              />
              {instructions.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => removeInstruction(i)}>
                  <Minus className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addInstruction} className="gap-2">
            <Plus className="h-4 w-4" /> Add Step
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tags & Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag (e.g., easy, vegetarian)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            <div className="flex gap-1 flex-wrap">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} <span className="text-xs">&times;</span>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">No Status</SelectItem>
                  <SelectItem value="FAVORITE">Favorite</SelectItem>
                  <SelectItem value="TO_TRY">To Try</SelectItem>
                  <SelectItem value="MADE_BEFORE">Made Before</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Visibility</Label>
              <Select value={isPublic ? "public" : "private"} onValueChange={(v) => setIsPublic(v === "public")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {initialData?.id ? "Update Recipe" : "Create Recipe"}
        </Button>
        <Button type="button" variant="outline" disabled={aiLoading} onClick={handleAiAnalyze} className="gap-2">
          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          AI Auto-fill
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
