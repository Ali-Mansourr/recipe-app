"use client";

import { useEffect, useState } from "react";
import { RecipeCard } from "@/components/recipe-card";
import { Share2 } from "lucide-react";

export default function SharedRecipesPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShared() {
      try {
        const res = await fetch("/api/recipes/shared");
        const data = await res.json();
        setRecipes(data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchShared();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shared with Me</h1>
        <p className="text-muted-foreground">
          Recipes that other users have shared with you
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="text-center py-20">
          <Share2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl text-muted-foreground">
            No recipes have been shared with you yet
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            When someone shares a recipe with your email, it will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isOwner={false}
              showAuthor
            />
          ))}
        </div>
      )}
    </div>
  );
}
