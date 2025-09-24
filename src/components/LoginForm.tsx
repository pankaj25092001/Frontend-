"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const formSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export default function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { email: "", password: "" }});
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const response = await api.post("/users/login", values);
            toast.success("Logged in successfully!");
            login(response.data);
            router.push("/");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Login failed.");
        }
    }
    return (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center"><CardTitle className="text-2xl">Welcome Back!</CardTitle></CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="tech@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="password" render={({ field }) => ( <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <Button type="submit" className="w-full">Log In</Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">Don't have an account?{" "}<Link href="/signup" className="underline">Sign up</Link></div>
          </CardContent>
        </Card>
    );
}