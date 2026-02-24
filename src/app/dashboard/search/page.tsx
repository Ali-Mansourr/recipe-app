"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipeCard } from "@/components/recipe-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CUISINES = [
  "All", "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai",
  "French", "Mediterranean", "American", "Korean", "Vietnamese",
  "Middle Eastern", "African", "Caribbean",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [maxPrepTime, setMaxPrepTime] = useState("");
  const [myResults, setMyResults] = useState<any[]>([]);
  const [publicResults, setPublicResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (cuisine !== "All") params.set("cuisine", cuisine);
    if (maxPrepTime) params.set("maxPrepTime", maxPrepTime);

    try {
      const [myRes, publicRes] = await Promise.all([
        fetch(`/api/recipes?${params}`),
        fetch(`/api/recipes/public?${params}`),
      ]);
      setMyResults(await myRes.json());
      setPublicResults(await publicRes.json());
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Search Recipes</h1>
        <p className="text-muted-foreground">
          Find recipes by name, ingredients, cuisine, or prep time
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name or ingredient..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <Button type="submit" size="lg" disabled={loading} className="gap-2">
            <Search className="h-5 w-5" />
            Search
          </Button>
        </div>
        <div className="flex gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Cuisine</Label>
            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUISINES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max Prep Time (min)</Label>
            <Input
              type="number"
              placeholder="Any"
              value={maxPrepTime}
              onChange={(e) => setMaxPrepTime(e.target.value)}
              className="w-[120px]"
              min="0"
            />
          </div>
        </div>
      </form>

      {searched && (
        <Tabs defaultValue="my" className="space-y-4">
          <TabsList>
            <TabsTrigger value="my">My Recipes ({myResults.length})</TabsTrigger>
            <TabsTrigger value="public">Public Recipes ({publicResults.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="my">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : myResults.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No matching recipes found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myResults.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} isOwner />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="public">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-80 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : publicResults.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No public recipes found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicResults.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} isOwner={false} showAuthor />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
