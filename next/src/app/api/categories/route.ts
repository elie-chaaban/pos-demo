import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        categoryRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const category = await prisma.category.create({
      data: {
        name,
        commissionRate,
        salonOwnerRate,
        description,
        categoryRoles:
          roleIds && roleIds.length > 0
            ? {
                create: roleIds.map((roleId: string) => ({
                  roleId,
                })),
              }
            : undefined,
      },
      include: {
        categoryRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
