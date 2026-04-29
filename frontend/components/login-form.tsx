"use client";

import { useState } from "react";
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

export function LoginForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const form = event.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement)
      .value;

    if (!email || !password) {
      setErrorMessage("لطفاً ایمیل و رمز عبور را وارد کنید");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || data.error || "خطا در ورود");
        setLoading(false);
        return;
      }

      // موفقیت - کوکی jwt خودکار توسط مرورگر ذخیره شده
      router.push("/dashboard");
    } catch (error) {
      setErrorMessage("خطای اتصال به سرور");
      setLoading(false);
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>ورود به حساب کاربری</CardTitle>
        <CardDescription>
          لطفاً ایمیل و رمز عبور خود را وارد کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">ایمیل</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Email"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                required
              />
            </Field>
            {errorMessage && (
              <div className="text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
            <SubmitButton loading={loading} />
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <div className="space-y-4">
      <Button type="submit" disabled={loading}>
        {loading ? "در حال ورود..." : "ورود"}
      </Button>
      <Button variant="outline" type="button">
        ورود با گوگل
      </Button>
      <FieldDescription className="px-6 text-center">
        حساب کاربری ندارید؟ <a href="/signup">ثبت‌نام</a>
      </FieldDescription>
    </div>
  );
}
