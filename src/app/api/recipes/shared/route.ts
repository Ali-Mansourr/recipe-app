import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sharedRecipes = await prisma.sharedRecipe.findMany({
      where: { userId: session.user.id },
      include: {
        recipe: {
          include: {
            tags: true,
            author: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
    });

    const recipes = sharedRecipes.map((sr) => ({
      ...sr.recipe,
      canEdit: sr.canEdit,
      sharedBy: sr.recipe.author,
    }));

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching shared recipes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
