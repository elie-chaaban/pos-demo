import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.expenseCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching expense categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch expense categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if category with same name already exists (case-insensitive)
    const allCategories = await prisma.expenseCategory.findMany();
    const existingCategory = allCategories.find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.expenseCategory.create({
      data: {
        name,
        description: description || "",
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating expense category:", error);
    return NextResponse.json(
      { error: "Failed to create expense category" },
      { status: 500 }
    );
  }
}
