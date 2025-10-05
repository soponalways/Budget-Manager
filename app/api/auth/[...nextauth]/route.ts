import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma} from "@/lib/prisma" 
import bcrypt from "bcryptjs";

interface credentials {
    name: string;
    credentials: {
        email: { label: string; type: string };
        password: { label: string; type: string };
    };
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("The credentials are : ", credentials);
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({ where: { email: credentials.email } });
                if (!user) {
                    throw new Error("No user found with the given email");
                };

                const valid = await bcrypt.compare(credentials.password, user.password || "");
                if (!valid) {
                    throw new Error("Incorrect password");
                };

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                };
            }
        })
    ], 

    session: {
        strategy: "jwt", 
        maxAge: 24 * 60 * 60, 
    }, 
    jwt: {
        secret: process.env.JWT_SECRET,
        maxAge: 24 * 60 * 60,
    }, 
    callbacks: {
        async jwt({ token, user}) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.name = user.name;
                token.email = user.email;
                token.image = user.image;
            }; 

            return token; 
        }, 
        async session({ session, token }) {
            if (token) {
                session.user = {
                    id: token.id as string,
                    name: token.name as string,
                    email: token.email as string,
                    role: token.role as string,
                    image: token.image as string | undefined,
                };
            }
            return session;
        },
    }, 
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login", 
        error: "/login",
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };