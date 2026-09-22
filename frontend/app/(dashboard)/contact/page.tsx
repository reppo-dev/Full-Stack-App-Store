"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiClient, ApiError } from "@/lib/api/client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

const createUserSchema = z.object({
  image: z.string().url("Please enter a valid URL").or(z.literal("")),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  user_name: z.string().min(1, "Username is required"),
  phone_number: z.string().min(9, "Phone number must be at least 9 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

const CreateUserPage = () => {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<CreateUserForm>({ resolver: zodResolver(createUserSchema) });

  async function onSubmit(data: CreateUserForm) {
    setLoading(true);

    try {
      await apiClient.post("/api/v1/users", data);
      toast.success("User created successfully");
      reset();
    } catch (error) {
      if (error instanceof ApiError) {
        setError("root", { message: error.message });
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
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Create User
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="image">Image URL</FieldLabel>
                <Input
                  id="image"
                  type="text"
                  placeholder="https://example.com/avatar.jpg"
                  {...register("image")}
                />
                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.image.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="first_name">First Name</FieldLabel>
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
                <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
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
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="phone_number">Phone Number</FieldLabel>
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
                {loading ? "Creating..." : "Create User"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUserPage;
