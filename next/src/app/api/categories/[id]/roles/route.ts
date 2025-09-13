import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const categoryRoles = await prisma.categoryRole.findMany({
      where: { categoryId: params.id },
      include: {
        role: true,
      },
    });

    return NextResponse.json(categoryRoles);
  } catch (error) {
    console.error("Error fetching category roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch category roles" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { roleIds } = body;

    if (!Array.isArray(roleIds)) {
      return NextResponse.json(
        { error: "roleIds must be an array" },
        { status: 400 }
      );
    }

    // Delete existing category roles
    await prisma.categoryRole.deleteMany({
      where: { categoryId: params.id },
    });

    // Create new category roles
    if (roleIds.length > 0) {
      await prisma.categoryRole.createMany({
        data: roleIds.map((roleId: string) => ({
          categoryId: params.id,
          roleId,
        })),
      });
    }

    // Fetch updated category with roles
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

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category roles:", error);
    return NextResponse.json(
      { error: "Failed to update category roles" },
      { status: 500 }
    );
  }
}
