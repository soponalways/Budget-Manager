import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json(); 
    console.log("The body is : ", body);
    const { name, email, password, image } = body; 
    if (!email || !password ) {
        return NextResponse.json({message: "Missing email or password"}, { status: 400}); 
    }; 

    const query = { where: { email } };
    const existingUser = await prisma.user.findUnique(query); 
    console.log("The existing user is : ", existingUser);
    if (existingUser) {
        return NextResponse.json({messsage: "User already exists"}, { status: 400});
    }

    // Hash password for safety
     const hashedPassword = await bcrypt.hash(password, 10); 

    const user = await prisma.user.create({
        data : {
            name, 
            email, 
            password: hashedPassword, 
            image
        }
    }); 
    console.log("The created user is : ", user);
    return NextResponse.json({ user }, { status: 201});
}