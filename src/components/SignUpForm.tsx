"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export default function SignUpForm() {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { username: "", email: "", password: "" }});
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await api.post("/users/register", values);
            toast.success("Account created successfully! Please log in.");
            router.push("/login");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Registration failed.");
        }
    }
    return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center"><CardTitle className="text-2xl">Create Your Account</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="username" render={({ field }) => ( <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="pankaj" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="pankaj@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <Button type="submit" className="w-full">Create Account</Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">Already have an account?{" "}<Link href="/login" className="underline">Log in</Link></div>
          </CardContent>
        </Card>
    );
}