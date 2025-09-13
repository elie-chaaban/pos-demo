import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userRoles = await prisma.userRole.findMany({
      include: {
        categoryRoles: {
          include: {
            category: true,
          },
        },
        employeeRoles: {
          include: {
            employee: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(userRoles);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user roles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userRole = await prisma.userRole.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(userRole, { status: 201 });
  } catch (error) {
    console.error("Error creating user role:", error);
    return NextResponse.json(
      { error: "Failed to create user role" },
      { status: 500 }
    );
  }
}
