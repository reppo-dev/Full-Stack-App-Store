// app/components/signup-form.tsx
"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
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
import { registerAction, RegisterActionResponse } from "@/app/actions/register";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const initialState: RegisterActionResponse = {};
  const [state, formAction] = useActionState(registerAction, initialState);

  useEffect(() => {
    if (state.success) {
      if (state.token) {
        document.cookie = `jwt=${state.token};path=/;max-age=86400;SameSite=Lax`;
      }
      router.push("/dashboard");
    }
  }, [state.success, state.token, router]);

  const errorMessage = state.error || "";

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Create a account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="user_name">Username</FieldLabel>
              <Input
                id="user_name"
                name="user_name"
                type="text"
                placeholder="username"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password_confirm">
                Confirm Password
              </FieldLabel>
              <Input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
              />
            </Field>

            {errorMessage && (
              <div className="text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
            <SubmitButton />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div className="space-y-4">
      <Button type="submit" disabled={pending}>
        {pending ? "در حال ثبت‌نام..." : "Sign up"}
      </Button>
      <Button variant="outline" type="button">
        Sign up with Google
      </Button>
      <FieldDescription className="px-6 text-center">
        Already have an account? <a href="/login">Login in</a>
      </FieldDescription>
    </div>
  );
}
