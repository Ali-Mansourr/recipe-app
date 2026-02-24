"use client";

import Link from "next/link";
import { Clock, Users, ChefHat, Heart, BookmarkPlus, CheckCircle2, MoreVertical, Pencil, Trash2, Share2, Globe } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDuration, getStatusColor, getStatusLabel } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RecipeCardProps {
  recipe: {
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
  };
  isOwner?: boolean;
  showAuthor?: boolean;
}

export function RecipeCard({ recipe, isOwner = true, showAuthor = false }: RecipeCardProps) {
  const router = useRouter();

  async function handleStatusChange(status: string) {
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(`Marked as ${getStatusLabel(status)}`);
        router.refresh();
      }
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Recipe deleted");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete recipe");
    }
  }

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative h-48 bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950 dark:to-gray-900 flex items-center justify-center">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <ChefHat className="h-16 w-16 text-orange-300 dark:text-orange-800" />
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {recipe.status !== "NONE" && (
            <Badge className={getStatusColor(recipe.status)}>
              {recipe.status === "FAVORITE" && <Heart className="h-3 w-3 mr-1" />}
              {recipe.status === "TO_TRY" && <BookmarkPlus className="h-3 w-3 mr-1" />}
              {recipe.status === "MADE_BEFORE" && <CheckCircle2 className="h-3 w-3 mr-1" />}
              {getStatusLabel(recipe.status)}
            </Badge>
          )}
          {recipe.isPublic && (
            <Badge variant="secondary" className="gap-1">
              <Globe className="h-3 w-3" /> Public
            </Badge>
          )}
        </div>
        {isOwner && (
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange("FAVORITE")}>
                  <Heart className="mr-2 h-4 w-4" /> Favorite
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("TO_TRY")}>
                  <BookmarkPlus className="mr-2 h-4 w-4" /> To Try
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("MADE_BEFORE")}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Made Before
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("NONE")}>
                  Clear Status
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href={`/dashboard/recipes/${recipe.id}/edit`}>
                  <DropdownMenuItem>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <Link href={`/dashboard/recipes/${recipe.id}`}>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{recipe.title}</h3>
          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {recipe.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {totalTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(totalTime)}
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {recipe.servings} servings
              </span>
            )}
            {recipe.cuisineType && (
              <Badge variant="outline" className="text-xs">
                {recipe.cuisineType}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0">
          <div className="flex gap-1 flex-wrap">
            {recipe.tags?.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {(recipe.tags?.length ?? 0) > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{(recipe.tags?.length ?? 0) - 3}
              </Badge>
            )}
          </div>
          {showAuthor && recipe.author && (
            <span className="ml-auto text-xs text-muted-foreground">
              by {recipe.author.name}
            </span>
          )}
        </CardFooter>
      </Link>
    </Card>
  );
}
