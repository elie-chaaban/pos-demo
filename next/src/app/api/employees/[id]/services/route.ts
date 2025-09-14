import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employeeServices = await (prisma as any).employeeService.findMany({
      where: { employeeId: id },
      include: {
        item: {
          include: {},
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(employeeServices);
  } catch (error) {
    console.error("Error fetching employee services:", error);
    return NextResponse.json(
      { error: "Failed to fetch employee services" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { itemId, commissionRate } = body;

    if (!itemId || commissionRate === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if employee service already exists
    const existingService = await (prisma as any).employeeService.findUnique({
      where: {
        employeeId_itemId: {
          employeeId: id,
          itemId,
        },
      },
    });

    if (existingService) {
      return NextResponse.json(
        { error: "Employee service already exists" },
        { status: 400 }
      );
    }

    const employeeService = await (prisma as any).employeeService.create({
      data: {
        employeeId: id,
        itemId,
        commissionRate,
      },
      include: {
        item: {
          include: {},
        },
      },
    });

    return NextResponse.json(employeeService, { status: 201 });
  } catch (error) {
    console.error("Error creating employee service:", error);
    return NextResponse.json(
      { error: "Failed to create employee service" },
      { status: 500 }
    );
  }
}
