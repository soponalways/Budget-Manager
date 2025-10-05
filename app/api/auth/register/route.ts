import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, image } = body;
        if (!email || !password) {
            throw new Error("Missing email or password")
        };

        const query = { where: { email } };
        const existingUser = await prisma.user.findUnique(query);
        if (existingUser) {
            throw new Error("User already exists with this email");
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
        console.log("The created user is : ", user);
        return NextResponse.json({ user }, { status: 201 });
    } catch (error) {
        throw new Error("Internal Server Error", { cause: error});
    }
}