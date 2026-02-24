import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const cuisine = searchParams.get("cuisine") || "";
    const status = searchParams.get("status") || "";
    const maxPrepTime = searchParams.get("maxPrepTime");
    const sort = searchParams.get("sort") || "newest";

    const where: any = { authorId: session.user.id };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (cuisine) {
      where.cuisineType = { equals: cuisine, mode: "insensitive" };
    }

    if (status) {
      where.status = status;
    }

    if (maxPrepTime) {
      where.prepTime = { lte: parseInt(maxPrepTime) };
    }

    const orderBy: any =
      sort === "oldest" ? { createdAt: "asc" }
      : sort === "title" ? { title: "asc" }
      : sort === "prepTime" ? { prepTime: "asc" }
      : { createdAt: "desc" };

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy,
      include: {
        tags: true,
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, ingredients, instructions, cuisineType, prepTime, cookTime, servings, imageUrl, status, isPublic, tags } = body;

    if (!title || !ingredients || !instructions) {
      return NextResponse.json(
        { error: "Title, ingredients, and instructions are required" },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        ingredients,
        instructions,
        cuisineType,
        prepTime: prepTime ? parseInt(prepTime) : null,
        cookTime: cookTime ? parseInt(cookTime) : null,
        servings: servings ? parseInt(servings) : null,
        imageUrl,
        status: status || "NONE",
        isPublic: isPublic || false,
        authorId: session.user.id,
        tags: tags?.length
          ? {
              connectOrCreate: tags.map((tag: string) => ({
                where: { name: tag.toLowerCase().trim() },
                create: { name: tag.toLowerCase().trim() },
              })),
            }
          : undefined,
      },
      include: { tags: true },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
