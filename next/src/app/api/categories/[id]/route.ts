import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        categoryRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, commissionRate, salonOwnerRate, description, roleIds } = body;

    if (
      !name ||
      commissionRate === undefined ||
      salonOwnerRate === undefined ||
      !description
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update category and handle role assignments
    const category = await prisma.$transaction(async (tx) => {
      // Update category basic info
      const updatedCategory = await tx.category.update({
        where: { id: params.id },
        data: {
          name,
          commissionRate,
          salonOwnerRate,
          description,
        },
      });

      // Delete existing category roles
      await tx.categoryRole.deleteMany({
        where: { categoryId: params.id },
      });

      // Create new category roles if provided
      if (roleIds && roleIds.length > 0) {
        await tx.categoryRole.createMany({
          data: roleIds.map((roleId: string) => ({
            categoryId: params.id,
            roleId,
          })),
        });
      }

      // Return updated category with roles
      return await tx.category.findUnique({
        where: { id: params.id },
        include: {
          categoryRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
