import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  try {
    const { serviceId } = await params;
    const body = await request.json();
    const { commissionRate, isActive } = body;

    if (commissionRate === undefined || isActive === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const employeeService = await (prisma as any).employeeService.update({
      where: { id: serviceId },
      data: {
        commissionRate,
        isActive,
      },
      include: {
        item: {
          include: {},
        },
      },
    });

    return NextResponse.json(employeeService);
  } catch (error) {
    console.error("Error updating employee service:", error);
    return NextResponse.json(
      { error: "Failed to update employee service" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; serviceId: string }> }
) {
  try {
    const { serviceId } = await params;
    await (prisma as any).employeeService.delete({
      where: { id: serviceId },
    });

    return NextResponse.json({
      message: "Employee service deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee service:", error);
    return NextResponse.json(
      { error: "Failed to delete employee service" },
      { status: 500 }
    );
  }
}
