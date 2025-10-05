"use client"
import { signIn } from 'next-auth/react';
import React, { useState } from 'react'
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card"
import { Label } from "../ui/label"
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginForm() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");

    console.log(email, password); 
    // Email and password State validation handler 
    const handleEmailOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmailError("");
        setEmail(e.target.value); 
        if (!email) {
            setEmailError("Email is required");
            return;
        } else if (!/@/.test(email)) {
            setEmailError("Invalied email address, '@' is missing");
            return;
        }; 
    }; 
    const handlePasswordOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        setPasswordError("");
        if (!password && password.length === 0 ) {
            setPasswordError("Password is required");
            return;
        } else if (!/^(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(password)) {
            setPasswordError("Password must be at least 6 characters long and contain at least one uppercase and one lowercase letter");
            return;
        }

    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });
        console.log("The sign in response is : ", res);
        if (res?.error) {
            toast("Login failed", {
                description: res.error, 
                action: {
                    label: "Close",
                    onClick: () => toast.dismiss(),
                }
            })
        } else {
            // router.push("/dashboard");
            toast("Login Successfully"); 
        }
    }
    return (
        <div>
            <div className='justify-center items-center flex min-h-screen bg-secondary'>
                <Card className="w-full max-w-sm shadow-2xl shadow-primary">
                    <CardHeader>
                        <CardTitle>Login to your account</CardTitle>
                        <CardDescription>
                            Enter your email below to login to your account
                        </CardDescription>
                        <CardAction>
                            <Button variant="link" className='cursor-pointer'>Sign Up</Button>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name='email'
                                        value={email}
                                        onChange={handleEmailOnChange}
                                        placeholder="mail@budgetmanager.com"
                                    />
                                    {emailError && <p className='text-sm text-red-500'>{emailError}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <Link
                                            href="#"
                                            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                        >
                                            Forgot your password?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name='password'
                                        value={password}
                                        onChange={handlePasswordOnChange}
                                    />
                                    {passwordError && <p className='text-sm text-red-500'>{passwordError}</p>}
                                </div>
                            </div>
                            <Button type="submit" className="w-full cursor-pointer mt-2">
                                Login
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button variant="outline" className="w-full cursor-pointer">
                            Login with Google
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
