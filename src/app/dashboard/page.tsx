"use client";

import { useEffect, useState } from "react";
import { Plus, Filter, SortAsc } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RecipeCard } from "@/components/recipe-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Recipe {
  id: string;
  title: string;
  description?: string | null;
  cuisineType?: string | null;
  prepTime?: number | null;
  cookTime?: number | null;
  servings?: number | null;
  imageUrl?: string | null;
  status: string;
  isPublic: boolean;
  tags?: { id: string; name: string }[];
  author?: { id: string; name: string | null; image: string | null };
}

export default function DashboardPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchRecipes();
  }, [sortBy]);

  async function fetchRecipes() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: sortBy });
      const res = await fetch(`/api/recipes?${params}`);
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      !search ||
      recipe.title.toLowerCase().includes(search.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(search.toLowerCase()) ||
      recipe.cuisineType?.toLowerCase().includes(search.toLowerCase()) ||
      recipe.tags?.some((t) => t.name.includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || recipe.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <p className="text-muted-foreground">
            Manage and organize your recipe collection
          </p>
        </div>
        <Link href="/dashboard/recipes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Recipe
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Recipes</SelectItem>
            <SelectItem value="FAVORITE">Favorites</SelectItem>
            <SelectItem value="TO_TRY">To Try</SelectItem>
            <SelectItem value="MADE_BEFORE">Made Before</SelectItem>
            <SelectItem value="NONE">No Status</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="title">Title A-Z</SelectItem>
            <SelectItem value="prepTime">Prep Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground mb-4">
            {search || statusFilter !== "all"
              ? "No recipes match your filters"
              : "No recipes yet"}
          </p>
          {!search && statusFilter === "all" && (
            <Link href="/dashboard/recipes/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create your first recipe
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} isOwner />
          ))}
        </div>
      )}
    </div>
  );
}
