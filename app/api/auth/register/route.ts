import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, image } = body;
        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        };

        const query = { where: { email } };
        const existingUser = await prisma.user.findUnique(query);
        if (existingUser) {
            return NextResponse.json({ message: "User already exists with this email" }, { status: 400 });
        }

        // Hash password for safety
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                image
            }
        });
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
    } catch (error) {
        console.error("Error in user registration: ", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}