import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RecipeForm } from "@/components/recipe-form";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { tags: true, sharedWith: true },
  });

  if (!recipe) notFound();

  const isOwner = recipe.authorId === session.user.id;
  const canEdit = recipe.sharedWith.some(
    (s) => s.userId === session.user.id && s.canEdit
  );

  if (!isOwner && !canEdit) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Recipe</h1>
        <p className="text-muted-foreground">Update your recipe details</p>
      </div>
      <RecipeForm
        initialData={{
          id: recipe.id,
          title: recipe.title,
          description: recipe.description || "",
          ingredients: recipe.ingredients as string[],
          instructions: recipe.instructions as string[],
          cuisineType: recipe.cuisineType || "",
          prepTime: recipe.prepTime?.toString() || "",
          cookTime: recipe.cookTime?.toString() || "",
          servings: recipe.servings?.toString() || "",
          imageUrl: recipe.imageUrl || "",
          status: recipe.status,
          isPublic: recipe.isPublic,
          tags: recipe.tags.map((t) => t.name),
        }}
      />
    </div>
  );
}
