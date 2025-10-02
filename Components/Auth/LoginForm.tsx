"use client"
import { signIn } from 'next-auth/react';
import React, { useState } from 'react'

export default function LoginForm() {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password,
        });
        console.log("The sign in response is : ", res);
        if (res?.error) {
            alert("Login failed");
        } else {
            // router.push("/dashboard");
            console.log("Login Successfully")
        }
    }
  return (
    <div>

          <form onSubmit={handleSubmit}>
              <input className='w-full bg-red-500' value={email} onChange={(e) => setEmail(e.target.value)} />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
              <button type="submit">Login</button>
          </form>
    </div>
  )
}
