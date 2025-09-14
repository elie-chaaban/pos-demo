import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Expense category not found" },
        { status: 404 }
      );
    }

    // Check if another category with same name already exists (excluding current one)
    const allCategories = await prisma.expenseCategory.findMany({
      where: { id: { not: id } },
    });
    const duplicateCategory = allCategories.find(
      (category) => category.name.toLowerCase() === name.toLowerCase()
    );

    if (duplicateCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.expenseCategory.update({
      where: { id },
      data: {
        name,
        description: description || "",
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating expense category:", error);
    return NextResponse.json(
      { error: "Failed to update expense category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        expenses: true,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Expense category not found" },
        { status: 404 }
      );
    }

    // Check if category is being used by any expenses
    if (existingCategory.expenses.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. It is being used by ${existingCategory.expenses.length} expense(s). Please reassign or delete those expenses first.`,
        },
        { status: 400 }
      );
    }

    await prisma.expenseCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Expense category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting expense category:", error);
    return NextResponse.json(
      { error: "Failed to delete expense category" },
      { status: 500 }
    );
  }
}
