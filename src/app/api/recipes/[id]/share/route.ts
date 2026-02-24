import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    if (!recipe || recipe.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, canEdit } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found with that email" }, { status: 404 });
    }

    if (targetUser.id === session.user.id) {
      return NextResponse.json({ error: "Cannot share with yourself" }, { status: 400 });
    }

    const sharedRecipe = await prisma.sharedRecipe.upsert({
      where: {
        recipeId_userId: { recipeId: id, userId: targetUser.id },
      },
      update: { canEdit: canEdit || false },
      create: {
        recipeId: id,
        userId: targetUser.id,
        canEdit: canEdit || false,
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(sharedRecipe, { status: 201 });
  } catch (error) {
    console.error("Error sharing recipe:", error);
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
    if (!recipe || recipe.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId } = await req.json();
    await prisma.sharedRecipe.delete({
      where: { recipeId_userId: { recipeId: id, userId } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing share:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
