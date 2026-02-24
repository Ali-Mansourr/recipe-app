import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const cuisine = searchParams.get("cuisine") || "";

    const where: any = { isPublic: true };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (cuisine) {
      where.cuisineType = { equals: cuisine, mode: "insensitive" };
    }

    const recipes = await prisma.recipe.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        tags: true,
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json(recipes);
  } catch (error) {
    console.error("Error fetching public recipes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
