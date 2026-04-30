"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const signUpSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    user_name: z.string().min(6, "Username must be at least 6 characters"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      user_name: "",
      password: "",
      password_confirm: "",
    },
  });

  async function onSubmit(data: SignUpFormValues) {
    setLoading(true);

    try {
      await axios.post("/api/register", data, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      router.push("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          "Registration failed";
        setError("root", { message });
      } else {
        setError("root", { message: "Connection error" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Create an account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="user_name">Username</FieldLabel>
              <Input
                id="user_name"
                type="text"
                placeholder="Username"
                {...register("user_name")}
              />
              {errors.user_name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.user_name.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="password_confirm">
                Confirm Password
              </FieldLabel>
              <Input
                id="password_confirm"
                type="password"
                placeholder="Confirm password"
                {...register("password_confirm")}
              />
              {errors.password_confirm && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password_confirm.message}
                </p>
              )}
            </Field>

            {errors.root && (
              <div className="text-red-500 text-sm text-center">
                {errors.root.message}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Sign up"}
            </Button>
            <Button variant="outline" type="button">
              Sign up with Google
            </Button>
            <FieldDescription className="px-6 text-center">
              Already have an account? <a href="/login">Log in</a>
            </FieldDescription>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
