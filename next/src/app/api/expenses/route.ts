import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, description, categoryId, amount, paymentMethod, notes } =
      body;

    if (!description || !categoryId || amount === undefined || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        date: date ? new Date(date) : new Date(),
        description,
        categoryId,
        amount: parseFloat(amount),
        paymentMethod,
        notes: notes || "",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    );
  }
}
