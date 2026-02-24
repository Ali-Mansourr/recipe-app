import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function canAccessRecipe(recipeId: string, userId: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { sharedWith: true },
  });

  if (!recipe) return { recipe: null, canEdit: false, canView: false };

  const isOwner = recipe.authorId === userId;
  const share = recipe.sharedWith.find((s) => s.userId === userId);
  const canView = isOwner || !!share || recipe.isPublic;
  const canEdit = isOwner || (share?.canEdit ?? false);

  return { recipe, canView, canEdit };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (!recipe.isPublic) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const isOwner = recipe.authorId === session.user.id;
      const isShared = recipe.sharedWith.some((s) => s.userId === session.user.id);
      if (!isOwner && !isShared) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { canEdit } = await canAccessRecipe(id, session.user.id);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, ingredients, instructions, cuisineType, prepTime, cookTime, servings, imageUrl, status, isPublic, tags } = body;

    const recipe = await prisma.recipe.update({
      where: { id },
      data: {
        title,
        description,
        ingredients,
        instructions,
        cuisineType,
        prepTime: prepTime != null ? parseInt(prepTime) : null,
        cookTime: cookTime != null ? parseInt(cookTime) : null,
        servings: servings != null ? parseInt(servings) : null,
        imageUrl,
        status: status || "NONE",
        isPublic: isPublic || false,
        tags: {
          set: [],
          connectOrCreate: (tags || []).map((tag: string) => ({
            where: { name: tag.toLowerCase().trim() },
            create: { name: tag.toLowerCase().trim() },
          })),
        },
      },
      include: { tags: true },
    });

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipe = await prisma.recipe.findUnique({ where: { id } });
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }
    if (recipe.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.recipe.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
