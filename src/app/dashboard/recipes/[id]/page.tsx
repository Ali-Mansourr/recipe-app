import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDuration, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  Clock, Users, ChefHat, Pencil, ArrowLeft, Globe,
  Heart, BookmarkPlus, CheckCircle2,
} from "lucide-react";
import { ShareDialog } from "@/components/share-dialog";
import { StatusToggle } from "@/components/status-toggle";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      tags: true,
      author: { select: { id: true, name: true, email: true, image: true } },
      sharedWith: {
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      },
    },
  });

  if (!recipe) notFound();

  const isOwner = session?.user?.id === recipe.authorId;
  const isShared = recipe.sharedWith.some((s) => s.userId === session?.user?.id);

  if (!recipe.isPublic && !isOwner && !isShared) {
    notFound();
  }

  const ingredients = recipe.ingredients as string[];
  const instructions = recipe.instructions as string[];
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Recipes
        </Button>
      </Link>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{recipe.title}</h1>
                {recipe.description && (
                  <p className="text-lg text-muted-foreground mt-2">{recipe.description}</p>
                )}
              </div>
              {isOwner && (
                <div className="flex gap-2">
                  <ShareDialog recipeId={recipe.id} sharedWith={recipe.sharedWith} />
                  <Link href={`/dashboard/recipes/${recipe.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
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
              {recipe.cuisineType && (
                <Badge variant="outline">{recipe.cuisineType}</Badge>
              )}
              {recipe.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
              ))}
            </div>

            {isOwner && (
              <div className="mt-4">
                <StatusToggle recipeId={recipe.id} currentStatus={recipe.status} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recipe.prepTime && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <Clock className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Prep Time</p>
                  <p className="font-semibold">{formatDuration(recipe.prepTime)}</p>
                </CardContent>
              </Card>
            )}
            {recipe.cookTime && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <ChefHat className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Cook Time</p>
                  <p className="font-semibold">{formatDuration(recipe.cookTime)}</p>
                </CardContent>
              </Card>
            )}
            {totalTime > 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <Clock className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Total Time</p>
                  <p className="font-semibold">{formatDuration(totalTime)}</p>
                </CardContent>
              </Card>
            )}
            {recipe.servings && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-4">
                  <Users className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">Servings</p>
                  <p className="font-semibold">{recipe.servings}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {instructions.map((inst, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                      {i + 1}
                    </span>
                    <p className="pt-1">{inst}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground">
            Created by {recipe.author.name || "Anonymous"} &middot;{" "}
            {new Date(recipe.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
