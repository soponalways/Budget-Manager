"use client"
import React, { useRef, useState } from 'react'
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
import { Label } from '../ui/label';
import Link from 'next/link';
import { Spinner } from "../ui/spinner"
import { toast } from 'sonner';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function RegisterForm() {
    const [email, setEmail] = useState<string>("");
        const [password, setPassword] = useState<string>("");
        const [emailError, setEmailError] = useState<string>("");
        const [passwordError, setPasswordError] = useState<string>("");
        const [name, setName] = useState<string>("");
        const [nameError, setNameError] = useState<string>("");
        const [uploadedURL, setUploadURL] = useState<string>("");
        const [uploading, setUploading] = useState<boolean>(false);
        const imageRef = useRef<HTMLInputElement>(null);
        const [loading, setLoading] = useState<boolean>(false);

        // All handlers Functions 

    const handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void> = async (e) => {
        e.preventDefault();
        setLoading(true);

        const form = e.target as HTMLFormElement; 
        const formData = new FormData(form);
        const name: string = formData.get("name") as string;
        const email: string = formData.get("email") as string;
        const password: string = formData.get("password") as string;
        const image: string = uploadedURL;

        // Reset errors 
        setNameError("");
        setEmailError("");
        setPasswordError("");

        // Register user api call 
        try {
            // 1) create user in DB
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, image }),
            });
            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Registration failed");
                setLoading(false);
                return;
            }
            // 2) auto-login using NextAuth credentials provider
            const autoLogin = async (): Promise<void> => {
                const signInResult = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                // signInResult structure (when redirect:false) often: { error?, ok?, status?, url? }
                if ((signInResult)?.error) {
                    // rare: user created but login failed
                    toast("Registration succeeded but auto-login failed: " + (signInResult).error);
                    setLoading(false);
                    return;
                }

                // 3) success → redirect to protected page (server will now see session cookie)
                // router.push("/dashboard");
                toast("Registration and login successful", {
                    action: {
                        label: "Close",
                        onClick: () => toast.dismiss()
                    }
                });
                setLoading(false);
            }; 
            await autoLogin(); 

        } catch (error) {
            console.log("The error is : ", error);
            toast.error("Registration failed. Please try again.");
        }
    }; 

    const handleNameOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        setNameError("");
        setName(e.target.value); 
        if (!name) {
            setNameError("Name is Required"); 
            return; 
        }
    }

    const handleImageOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void = async (e) => {
        const image = e.target.files?.[0]; 

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if (image && !allowedTypes.includes(image.type)) {
            toast.error("Only JPG, JPEG, and PNG files are allowed", {
                action: {
                    label: "Close", 
                    onClick: () => toast.dismiss()
                }
            });
            if(imageRef.current) {
                imageRef.current.value = "";
            }
            return; 
        }; 

        if(!image) {
            toast.error("Please select an image file"); 
            return;
        }

        const imageFormData = new FormData(); 
        imageFormData.append("file", image)
        imageFormData.append('upload_preset', 'unsigned_profile_upload');
        setUploading(true);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/soponcloud/image/upload`, {
                method: 'POST',
                body: imageFormData,
            });
            const data = await res.json(); 
            if(data?.secure_url) {
                setUploadURL(data.secure_url); 
                setUploading(prev => !prev); 
            }
        } catch (error) {
            console.log("The image upload error is: ", error)
            toast.error("Image upload failed. Please try again."); 
        }
    }

    const handleEmailOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
        setEmailError("");
        setEmail(e.target.value);
        if (!email) {
            setEmailError("Email is required");
            return;
        } else if (!/@/.test(email)) {
            setEmailError("Invalied email address, '@' is missing");
            return;
        }; 
    }

    const handlePasswordOnChange: (e: React.ChangeEvent<HTMLInputElement>) => void = (e) => {
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

  return (
      <div className='justify-center items-center flex min-h-screen bg-secondary'>
          <Card className="w-full max-w-sm shadow-2xl shadow-primary">
              <CardHeader>
                  <CardTitle>Register an account</CardTitle>
                  <CardDescription>
                      Enter you details to create your personal account on Budget Manager
                  </CardDescription>
                  <CardAction>
                      <Link href={'/login'}><Button variant="link" className='cursor-pointer'>Sign In</Button></Link>
                  </CardAction>
              </CardHeader>
              <CardContent>
                  <form onSubmit={handleSubmit}>
                      <div className="flex flex-col gap-6">
                          <div className="grid gap-2">
                              <Label htmlFor="name">Full Name</Label>
                              <Input
                                  id="name"
                                  type="text"
                                  name='name'
                                  value={name}
                                  onChange={handleNameOnChange}
                                  placeholder="Sopon Islam"
                              />
                              {nameError && <p className='text-sm text-red-500'>{nameError}</p>}
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="email">Profile Photo</Label>
                              <Input id="picture" ref={imageRef} onChange={handleImageOnChange} type="file" />
                              {uploading ? <span className='w-full flex justify-center items-center'><Spinner /></span> : uploadedURL && <figure className=''>
                                  <Image src={uploadedURL} alt='Profile Photo' width={150} height={150} className='h-20 w-20 rounded-full ring-1 ring-primary shadow-lg duration-300 shadow-primary hover:shadow-xl mx-auto' />
                                </figure>}
                          </div>
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
                      <Button type="submit" disabled={loading} className="w-full cursor-pointer mt-2">
                            {loading ? <Spinner /> : "Create Account"}
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
  )
}
