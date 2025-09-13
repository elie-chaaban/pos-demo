import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        employeeRoles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, roleIds } = body;

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

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        phone,
        employeeRoles: {
          create: roleIds.map((roleId: string) => ({
            roleId,
          })),
        },
      },
      include: {
        employeeRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}
