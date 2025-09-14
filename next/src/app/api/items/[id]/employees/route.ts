import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;

    // Get all employees who are assigned to this specific item
    const employees = await (prisma as any).employeeService.findMany({
      where: {
        itemId: itemId,
        isActive: true,
      },
      include: {
        employee: {
          include: {
            employeeServices: true,
            sales: true,
          },
        },
      },
    });

    // Transform the data to match the expected format
    const assignedEmployees = employees.map((es: any) => ({
      id: es.employee.id,
      name: es.employee.name,
      email: es.employee.email,
      phone: es.employee.phone,
      commissionRate: es.commissionRate,
    }));

    return NextResponse.json(assignedEmployees);
  } catch (error) {
    console.error("Error fetching employees for item:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees for item" },
      { status: 500 }
    );
  }
}
