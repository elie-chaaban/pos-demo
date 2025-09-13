import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userRole = await prisma.userRole.findUnique({
      where: { id: params.id },
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
    });

    if (!userRole) {
      return NextResponse.json(
        { error: "User role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userRole);
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Failed to fetch user role" },
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
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userRole = await prisma.userRole.update({
      where: { id: params.id },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(userRole);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if role is being used by employees
    const employeesWithRole = await prisma.employeeRole.findMany({
      where: { roleId: params.id },
    });

    if (employeesWithRole.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete role. It is currently assigned to ${employeesWithRole.length} employee(s).`,
        },
        { status: 400 }
      );
    }

    await prisma.userRole.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "User role deleted successfully" });
  } catch (error) {
    console.error("Error deleting user role:", error);
    return NextResponse.json(
      { error: "Failed to delete user role" },
      { status: 500 }
    );
  }
}
