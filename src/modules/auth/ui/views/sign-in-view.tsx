"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { OctagonAlertIcon } from "lucide-react";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { getSafeCallbackUrl } from "../../lib/callback-url";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

interface Props {
  callbackUrl?: string;
}

export const SignInView = ({ callbackUrl }: Props) => {
  const safeCallbackUrl = getSafeCallbackUrl(callbackUrl);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setPending(true);

    console.log("🔐 Initiating email sign-in for:", data.email);

    try {
      const result = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        callbackURL: safeCallbackUrl,
      });

      if (result?.error) {
        throw result.error;
      }

      window.location.replace(safeCallbackUrl);
    } catch (error) {
      console.error("✗ Email sign-in error:", error);

      const message =
        error && typeof error === "object" && "message" in error
          ? String(error.message)
          : "Sign in failed. Please try again.";

      if (message.includes("Failed to fetch") || message.includes("network")) {
        setError("Network error: Unable to connect to authentication service. Please check your internet connection and try again.");
      } else if (message.includes("Invalid credentials") || message.includes("not found")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(message);
      }
    } finally {
      setPending(false);
    }
  };

  const onSocial = (provider: "github" | "google") => {
    setError(null);
    setPending(true);

    console.log("🔐 Initiating social login:", {
      provider,
      appOrigin: typeof window !== "undefined" ? window.location.origin : "server-side",
      callbackURL: safeCallbackUrl,
    });

    try {
      authClient.signIn.social(
        {
          provider: provider,
          callbackURL: safeCallbackUrl,
        },
        {
          onSuccess: () => {
            console.log("✓ Social sign-in started, waiting for provider redirect...");
          },
          onError: ({ error }) => {
            console.error("✗ Social sign-in error:", {
              message: error.message,
              code: error.code,
              status: error.status,
            });
            setPending(false);
            
            // Provide helpful error messages based on error type
            if (error.message?.includes("Failed to fetch") || error.message?.includes("network")) {
              setError(`Network error: Cannot connect to ${provider} authentication. Please check if the auth service is properly configured for this domain.`);
            } else if (error.message === "invalid_code") {
              setError(`${provider} OAuth authentication failed. Please verify that ${provider} OAuth is properly configured.`);
            } else {
              setError(error.message || `${provider} sign-in failed. Please try again.`);
            }
          },
        }
      );
    } catch (err) {
      console.error("✗ Social login exception:", err);
      setPending(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">
                    Welcome back
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    Login to your account
                  </p>
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {!!error && (
                  <Alert className="bg-destructive/10 border-none">
                    <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                    <AlertTitle>{error}</AlertTitle>
                  </Alert>
                )}
                <Button
                  disabled={pending}
                  type="submit"
                  className="w-full"
                >
                  Sign in
                </Button>
                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    disabled={pending}
                    onClick={() => onSocial("google")}
                    variant="outline"
                    type="button"
                    className="w-full"
                  >
                    <FaGoogle />
                  </Button>
                  <Button
                    disabled={pending}
                    onClick={() => onSocial("github")}
                    variant="outline"
                    type="button"
                    className="w-full"
                  >
                    <FaGithub />
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>

          <div className="bg-radial from-sidebar-accent to-sidebar relative hidden md:flex flex-col gap-y-4 items-center justify-center">
            <Image
              src="/logo.png"
              alt="NeexMeet logo"
              width={92}
              height={92}
              priority
              className="h-auto w-auto"
            />
            <p className="text-2xl font-semibold text-white">
              NeexMeet
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
      </div>
    </div>
  );
};
