import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.item.findMany({
      include: {
        category: {
          include: {
            categoryRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, categoryId, price, stock, isService, description } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        name,
        categoryId,
        price,
        stock: isService ? 0 : stock || 0, // Services don't have stock
        isService: isService || false,
        description: description || "",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
