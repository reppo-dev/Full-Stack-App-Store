"use client";

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
import { registerAction } from "@/app/actions/register";

type formdata = {
  user_name: string;
  email: string;
  password: string;
  password_confirm: string;
};

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Create a account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
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
            <FieldGroup>
              <Field>
                <Button type="submit">Sign up</Button>
                <Button variant="outline" type="button">
                  Sign up with Google
                </Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/login">Login in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
