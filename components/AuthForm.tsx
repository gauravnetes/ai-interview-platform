"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { z } from "zod";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { signIn, signUp } from "@/lib/actions/auth.action";

const authFormSchema = (type: FormType) => {
  return z.object({
    name: type === "sign-up" ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3).max(12),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const formSchema = authFormSchema(type);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-up") {
        const { name, email, password } = values;

        // creates the user acc with email & password
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const res = await signUp({
          uid: userCredentials.user.uid, // unique id of the firebasea auth user
          name: name!,
          email,
          password,
        });

        if (!res?.success) {
          toast.error(res?.message);
          return;
        }

        toast.success("Account Created Successfully! Please Sign in");
        router.push("/sign-in");
        console.log("SIGN UP", values);
      } else {
        const { email, password } = values;

        // sign in on the client side 
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const idToken = await userCredential.user.getIdToken();

        if(!idToken) {
          toast.error('Sign in Failed')
          return; 
        }

        // set token on the server side 
        await signIn({  
          email, idToken
        }) 

        toast.success("Signed In Successfully!");
        router.push("/");
        console.log("SIGN IN", values);
      }
    } catch (error) {
      console.log("Form submit error: ", error);
      toast.error(`There was an Error while submitting the Form`);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" height={32} width={38} />

          <h2 className="text-primary-100">PrePared</h2>
        </div>

        <h3>Prepare with your Own AI Interviewer</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full mt-4 space-y-6 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Enter your name"
              />
            )}

            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Enter email address"
              type="email"
            />

            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
            >
              <div onClick={() => setShowPassword((prev) => !prev)} className="text-black">
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </div>
            </FormField>

            {/* FormField component */}
            <Button type="submit" className="btn">
              {isSignIn ? "Sign in" : "Create an Account"}
            </Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? "No Account Yet?" : "Existing User?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1 "
          >
            {!isSignIn ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
