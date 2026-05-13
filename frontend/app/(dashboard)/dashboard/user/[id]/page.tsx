import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const userSchama = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z
    .string()
    .email("failed format email")
    .min(1, "please enter your email"),
  user_name: z.string().min(6, "user name must 6 character"),
  image: z.string().url("must be a valid URL"),
  phone_number: z.string().min(9, "phone number must 9 character"),
  role_id: z.number(),
});

type UserSchamaType = z.infer<typeof userSchama>;

const Edituser = () => {
  const form = useForm<UserSchamaType>({
    resolver: zodResolver(userSchama),
    defaultValues: {},
  });

  const onSubmit = () => {};
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Create an account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-primary">
                      First Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="first name"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-primary">
                      Last Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="last name"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-primary">
                      email
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@email.com"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="user_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-primary">
                      User Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-primary">
                      Phone number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+111 222 000"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold text-primary">
                      Image URL
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="image url"
                        {...field}
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {serverError && (
                <div className="rounded-md bg-red-50 p-3 text-sm font-medium text-red-700">
                  {serverError}
                </div>
              )}

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registering..." : "Sign up"}
              </Button>
              <FieldDescription className="px-6 text-center">
                Already have an account? <a href="/login">Log in</a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default Edituser;
