"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const createUserSchama = z.object({
  image: z.string(),
  first_name: z.string().min(1, "firstname must 1 charackter"),
  last_name: z.string().min(1, "Lastname must 1 charackter"),
  user_name: z.string().min(1, "username must 1 charackter"),
  phone_number: z.string().min(9, "phonenumber must 9 characters"),
  email: z.string().email().min(1, "firstname must 1 charackter"),
  password: z.string().min(1, "firstname must 1 charackter"),
});

type SchamaCreate = z.infer<typeof createUserSchama>;

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SchamaCreate>({ resolver: zodResolver(createUserSchama) });

  async function onSubmit(data: SchamaCreate) {
    setLoading(true);

    try {
      const res = await axios.post("/api/users", data, {
        withCredentials: true,
      });

      console.log(res);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          "Create user failed";
        setError("root", { message });
      } else {
        setError("root", { message: "Connection error" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create an user</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Image Url</FieldLabel>
                <Input
                  id="image"
                  type="text"
                  placeholder="Image URL"
                  {...register("image")}
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.image.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">First Name</FieldLabel>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="First Name"
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.first_name.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">last_name</FieldLabel>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Last Name"
                  {...register("last_name")}
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.last_name.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">User Name</FieldLabel>
                <Input
                  id="user_name"
                  type="text"
                  placeholder="User Name"
                  {...register("user_name")}
                />
                {errors.user_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.user_name.message}
                  </p>
                )}
              </Field>
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
                <FieldLabel htmlFor="user_name">Phone Number</FieldLabel>
                <Input
                  id="phone_number"
                  type="tel"
                  placeholder="Phone Number"
                  {...register("phone_number")}
                />
                {errors.phone_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.phone_number.message}
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

              {errors.root && (
                <div className="text-red-500 text-sm text-center">
                  {errors.root.message}
                </div>
              )}

              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create user"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;
