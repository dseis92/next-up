"use client";

import { useState } from "react";

export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { updateUserProfile } from "@/lib/storage/profile";
import { AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required - show message
        setNeedsEmailConfirmation(true);
        setLoading(false);
        return;
      }

      if (data.user && data.session) {
        // User is authenticated - save profile and redirect
        try {
          await updateUserProfile({ name });
        } catch (profileError) {
          console.error("Failed to save profile:", profileError);
          // Continue anyway - profile can be updated later
        }

        // Redirect to onboarding
        router.push("/onboarding");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="text-heading-lg mb-2">Create your account</h1>
          <p className="text-foreground-secondary">
            Find what's next in your career
          </p>
        </div>

        <Card className="p-6">
          {needsEmailConfirmation ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                  <AlertCircle className="h-6 w-6 text-brand" />
                </div>
              </div>
              <div>
                <h2 className="text-heading mb-2">Check your email</h2>
                <p className="text-sm text-foreground-secondary">
                  We sent a confirmation link to{" "}
                  <span className="font-medium text-foreground">{email}</span>.
                  Click the link to activate your account.
                </p>
              </div>
              <Link href="/login">
                <Button variant="secondary" className="w-full">
                  Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Full name
              </label>
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-foreground-muted">
                At least 6 characters
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          )}

          {!needsEmailConfirmation && (
            <div className="mt-6 text-center text-sm">
            <p className="text-foreground-secondary">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-brand hover:underline">
                Sign in
              </Link>
            </p>
          </div>
          )}
        </Card>

        <p className="mt-4 text-center text-xs text-foreground-muted">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
}
