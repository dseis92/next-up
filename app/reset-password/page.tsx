"use client";

import { useState, useEffect } from "react";

export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setValidSession(true);
      } else {
        setError("Invalid or expired reset link. Please request a new one.");
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  if (!validSession && !error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <Card className="p-6 text-center">
            <p className="text-foreground-secondary">Verifying reset link...</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="text-heading-lg mb-2">Set new password</h1>
          <p className="text-foreground-secondary">
            Enter your new password below
          </p>
        </div>

        <Card className="p-6">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
                  <CheckCircle2 className="h-6 w-6 text-brand" />
                </div>
              </div>
              <div>
                <h2 className="text-heading mb-2">Password updated!</h2>
                <p className="text-sm text-foreground-secondary">
                  Your password has been reset successfully. Redirecting to
                  login...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  New Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading || !validSession}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={loading || !validSession}
                />
                <p className="mt-1 text-xs text-foreground-muted">
                  At least 6 characters
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading || !validSession}
              >
                {loading ? "Updating password..." : "Update password"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
