import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: params.id },
      include: {
        employeeRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee" },
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
    const { name, email, phone, roleIds, commissionRate } = body;

    if (
      !name ||
      !email ||
      !phone ||
      !roleIds ||
      !Array.isArray(roleIds) ||
      roleIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const employee = await prisma.$transaction(async (tx) => {
      // Update employee basic info
      const updatedEmployee = await tx.employee.update({
        where: { id: params.id },
        data: {
          name,
          email,
          phone,
          commissionRate: commissionRate || 0,
        },
      });

      // Delete existing employee roles
      await tx.employeeRole.deleteMany({
        where: { employeeId: params.id },
      });

      // Create new employee roles
      if (roleIds.length > 0) {
        await tx.employeeRole.createMany({
          data: roleIds.map((roleId: string) => ({
            employeeId: params.id,
            roleId,
          })),
        });
      }

      // Return updated employee with roles
      return await tx.employee.findUnique({
        where: { id: params.id },
        include: {
          employeeRoles: {
            include: {
              role: true,
            },
          },
        },
      });
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.employee.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { error: "Failed to delete employee" },
      { status: 500 }
    );
  }
}
