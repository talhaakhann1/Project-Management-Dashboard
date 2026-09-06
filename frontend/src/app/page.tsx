"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Check,
  ArrowRight,
  Star,
  Users,
  Send,
  Diamond,
} from "lucide-react";
import { useAppSelector } from "@/store/hook";
import dashboardImage from "../../public/image.png"

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  "Plan projects with ease",
  "Track tasks and deadlines",
  "Collaborate in real time",
  "Ship work that matters",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function PlaneflowLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Abstract plane icon built from rotated shapes */}
      <div className="relative flex h-8 w-8 items-center justify-center">
        <Send
          className="h-5 w-5 -rotate-12 text-primary"
          strokeWidth={2}
          aria-hidden="true"
        />
      </div>
      <span className="font-sans text-lg font-semibold tracking-tight text-foreground">
        Planeflow
      </span>
    </div>
  );
}

function GettingStartedBadge() {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-primary/50 bg-primary/10 px-3.5 py-1 text-xs font-medium tracking-wide text-primary">
      Getting Started
    </span>
  );
}

function FeatureList() {
  return (
    <ul className="space-y-3.5" aria-label="Key features">
      {FEATURES.map((feature) => (
        <li key={feature} className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary"
            aria-hidden="true"
          >
            <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="font-sans text-[15px] text-foreground/90">{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function SocialProof() {
  return (
    <div className="flex flex-wrap items-center gap-6 sm:gap-8">
      {/* Users stat */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-1.5" aria-hidden="true">
          {/* Three stacked avatar circles */}
          {["bg-primary/80", "bg-primary/60", "bg-primary/40"].map((bg, i) => (
            <span
              key={i}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-background ${bg}`}
            >
              <Users className="h-3.5 w-3.5 text-primary-foreground" />
            </span>
          ))}
        </div>
        <div className="flex flex-col">
          <span className="font-sans text-base font-semibold leading-tight text-foreground">
            50,000+
          </span>
          <span className="font-sans text-xs text-muted-foreground">active users</span>
        </div>
      </div>

      {/* Divider */}
      <div className="hidden h-8 w-px bg-border/50 sm:block" aria-hidden="true" />

      {/* Rating stat */}
      <div className="flex items-center gap-2.5">
        <Star
          className="h-6 w-6 fill-primary text-primary"
          aria-hidden="true"
        />
        <div className="flex flex-col">
          <span className="font-sans text-base font-semibold leading-tight text-foreground">
            4.9
          </span>
          <span className="font-sans text-xs text-muted-foreground">(2,000+ reviews)</span>
        </div>
      </div>
    </div>
  );
}

function FloatingMetricCard({
  title,
  value,
  delta,
  className = "",
}: {
  title: string;
  value: string;
  delta: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border/60 bg-card/90 px-4 py-3 shadow-lg backdrop-blur-sm ${className}`}
      aria-hidden="true"
    >
      <p className="mb-1 text-[11px] font-medium text-muted-foreground">{title}</p>
      <div className="flex items-end gap-2">
        <span className="text-xl font-semibold leading-none text-foreground">{value}</span>
        <span className="mb-0.5 text-xs font-medium text-primary">{delta}</span>
      </div>
      {/* Mini bar chart */}
      <div className="mt-2.5 flex items-end gap-0.5" aria-hidden="true">
        {[3, 5, 4, 6, 5, 7, 6, 8].map((h, i) => (
          <div
            key={i}
            className="w-2 rounded-sm bg-primary/40"
            style={{ height: `${h * 3}px` }}
          />
        ))}
      </div>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {/* Large ambient glow behind artwork */}
      <div
        className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      {/* Secondary smaller glow */}
      <div
        className="absolute right-8 top-16 h-64 w-64 rounded-full bg-primary/8 blur-2xl"
        aria-hidden="true"
      />

      {/* Decorative paper-plane icon — top right */}
      <div
        className="absolute right-4 top-6 text-primary/50 lg:right-0 lg:top-10"
        aria-hidden="true"
      >
        <Send className="h-8 w-8 -rotate-12 text-primary/60" strokeWidth={1.5} />
      </div>

      {/* Decorative diamond outline — mid right */}
      <div
        className="absolute bottom-24 right-2 text-primary/30"
        aria-hidden="true"
      >
        <Diamond className="h-5 w-5 text-primary/40" strokeWidth={1} />
      </div>

      {/* Decorative circle outlines */}
      <div
        className="absolute left-4 top-1/3 h-10 w-10 rounded-full border border-primary/25"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-10 left-10 h-6 w-6 rounded-full border border-primary/20"
        aria-hidden="true"
      />

      {/* Dotted accent line — decorative */}
      <svg
        className="absolute right-10 top-1/4 h-20 w-20 text-primary/20"
        viewBox="0 0 80 80"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 70 Q40 10 70 40"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      </svg>

      {/* Main product image */}
      <div className="relative z-10 w-full max-w-lg lg:max-w-none">
        <Image
          src={dashboardImage}
          alt="Planeflow dashboard showing Project Roadmap with Gantt chart and Team Activity feed"
          width={760}
          height={520}
          className="h-auto w-full rounded-2xl object-contain drop-shadow-2xl"
          priority
          quality={95}
        />

        {/* Floating metric cards — desktop only */}
        <FloatingMetricCard
          title="Team Members"
          value="12"
          delta="+8%"
          className="absolute -bottom-4 -left-6 hidden lg:block"
        />
        <FloatingMetricCard
          title="Tasks Done"
          value="128"
          delta="+22%"
          className="absolute -top-4 right-8 hidden lg:block"
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlaneflowOnboardingPage() {
  const {user,isLoggedIn}=useAppSelector((state)=>state.auth)
  return (
    <main className="min-h-screen w-full bg-background">
      <div className="mx-auto flex min-h-screen max-w-[1380px] flex-col px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:gap-8 lg:px-12 lg:py-10 xl:px-16">

        {/* ── Left: Hero Content ───────────────────────────────── */}
        <section className="flex w-full flex-col lg:w-[42%] lg:shrink-0 lg:pr-4 xl:pr-8">

          {/* Logo */}
          <div className="mb-10 lg:mb-12">
            <PlaneflowLogo />
          </div>

          {/* Badge */}
          <div className="mb-5">
            <GettingStartedBadge />
          </div>

          {/* Heading */}
          <h1 className="mb-5 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem]">
            Welcome to
            <br />
            Planeflow
          </h1>

          {/* Description */}
          <p className="mb-8 max-w-sm font-sans text-base leading-relaxed text-muted-foreground">
            Set up your workspace in minutes and start planning,
            tracking, and shipping projects with your team.
          </p>

          {/* Feature checklist */}
          <div className="mb-8">
            <FeatureList />
          </div>

          {/* Divider */}
          <div className="mb-6 h-px w-full bg-border/50" aria-hidden="true" />

          {/* Social proof */}
          <div className="mb-8">
            <SocialProof />
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4">
           {user||isLoggedIn?(
              <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-sans text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-150 hover:brightness-110 hover:shadow-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
            >
              Return to dashboard
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            </Link>
           ):(
            <>
              <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-sans text-[15px] font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-150 hover:brightness-110 hover:shadow-primary/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
              >
              Get Started
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            </Link>

            <Link
              href="/sign-in"
              className="font-sans text-[15px] font-medium text-primary transition-colors duration-150 hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Already a member
            </Link>
           </>
           )}
          </div>
        </section>

        {/* ── Right: Product Visual ────────────────────────────── */}
        <section
          className="relative mt-12 flex min-h-[340px] w-full flex-col items-center justify-center lg:mt-0 lg:flex-1"
          aria-label="Product preview"
        >
          <ProductPreview />
        </section>

      </div>
    </main>
  );
}