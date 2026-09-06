"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeIn, slideUp, spring } from "@/lib/motion";
import {
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface">
      {/* Navigation */}
      <nav className="safe-top sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            {/* Left: Copy */}
            <motion.div
              className="flex flex-col justify-center"
              initial="initial"
              animate="animate"
              variants={{
                animate: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              <motion.h1
                className="text-hero mb-6 bg-gradient-to-br from-foreground to-foreground-secondary bg-clip-text text-transparent"
                variants={slideUp}
              >
                Find what&apos;s next.
              </motion.h1>

              <motion.p
                className="text-body-lg mb-8 max-w-xl text-foreground-secondary"
                variants={slideUp}
              >
                Stop digging through job boards. NextUp learns what you&apos;re good
                at, what you want, and what actually fits — then helps you move
                from searching to hired.
              </motion.p>

              <motion.div
                className="flex flex-col gap-4 sm:flex-row"
                variants={slideUp}
              >
                <Link href="/discover">
                  <Button size="lg" className="w-full sm:w-auto">
                    Find my next role
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  See how it works
                </Button>
              </motion.div>

              <motion.div
                className="mt-12 flex items-center gap-6 text-sm text-foreground-muted"
                variants={fadeIn}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand" />
                  <span>No credit card</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Product Preview */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={spring.smooth}
            >
              <div className="relative">
                {/* Floating Job Card Mock */}
                <Card
                  variant="elevated"
                  className="relative z-10 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                          <span className="text-lg font-bold">AC</span>
                        </div>
                        <div>
                          <p className="text-sm text-foreground-muted">
                            Acme Construction
                          </p>
                          <p className="text-xs text-foreground-muted">
                            2 days ago
                          </p>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-heading mb-2">Project Engineer</h3>

                    <div className="mb-4 flex flex-wrap gap-2 text-sm text-foreground-secondary">
                      <span>Madison, WI</span>
                      <span>•</span>
                      <span>Hybrid</span>
                      <span>•</span>
                      <span>Full-time</span>
                    </div>

                    <div className="mb-4">
                      <p className="text-display text-foreground">
                        $72K–$90K
                      </p>
                    </div>

                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-green-500">
                        <span className="text-2xl font-bold text-brand-foreground">
                          93
                        </span>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-brand">
                          Great fit
                        </p>
                        <p className="text-sm text-foreground-muted">
                          Strong match for your profile
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="mb-2 text-sm font-semibold text-foreground">
                        Why it fits
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="brand">Leadership</Badge>
                        <Badge variant="brand">Field Ops</Badge>
                        <Badge variant="brand">Construction</Badge>
                        <Badge variant="brand">Safety</Badge>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1">
                        Pass
                      </Button>
                      <Button variant="primary" className="flex-1">
                        Save
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Floating accent elements */}
                <motion.div
                  className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand/20 blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-8 -left-4 h-32 w-32 rounded-full bg-accent/20 blur-3xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-display mb-4">
              Job searching that doesn&apos;t suck
            </h2>
            <p className="text-body-lg mx-auto max-w-2xl text-foreground-secondary">
              NextUp combines smart matching, AI assistance, and progress
              tracking to make finding your next opportunity actually
              enjoyable.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card variant="elevated" className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                <Target className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-heading mb-2">Personalized discovery</h3>
              <p className="text-foreground-secondary">
                See opportunities that actually match your skills, experience,
                and career goals. No more endless scrolling through irrelevant
                listings.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card variant="elevated" className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                <Sparkles className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-heading mb-2">AI career copilot</h3>
              <p className="text-foreground-secondary">
                Get instant help analyzing jobs, tailoring resumes, prepping
                for interviews, and planning your next career move.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card variant="elevated" className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                <TrendingUp className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-heading mb-2">Track your progress</h3>
              <p className="text-foreground-secondary">
                Manage applications, schedule follow-ups, and build momentum
                with streaks and daily missions that keep you moving forward.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card variant="elevated" className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                <Zap className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-heading mb-2">Know why you match</h3>
              <p className="text-foreground-secondary">
                Every opportunity shows exactly why you&apos;re a fit, what skills
                you bring, and what gaps to address before applying.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card variant="elevated" className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                <CheckCircle2 className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-heading mb-2">Stay organized</h3>
              <p className="text-foreground-secondary">
                Track every application from saved to offer. Never miss a
                follow-up or lose track of where you stand.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card variant="elevated" className="p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                <TrendingUp className="h-6 w-6 text-brand" />
              </div>
              <h3 className="text-heading mb-2">Explore careers</h3>
              <p className="text-foreground-secondary">
                Not sure what&apos;s next? Discover career paths, understand
                transitions, and see what opportunities fit your transferable
                skills.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card variant="elevated" className="overflow-hidden">
            <div className="relative bg-gradient-to-br from-brand/5 to-accent/5 p-12 text-center">
              <h2 className="text-display mb-4">Your next move is out there</h2>
              <p className="text-body-lg mb-8 text-foreground-secondary">
                Let&apos;s find it.
              </p>
              <Link href="/discover">
                <Button size="lg">
                  Get started for free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Logo size="sm" />
            <p className="text-sm text-foreground-muted">
              © 2024 NextUp. Find what&apos;s next.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
