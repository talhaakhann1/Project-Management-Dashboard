"use client"

import { Check, Users, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  "Unlimited projects and tasks",
  "Real-time team collaboration",
  "Visual timelines & Kanban boards",
  "Advanced progress analytics",
];

export default function OnboardingSplit() {
  return (
    <div className="min-h-screen w-full bg-[#0a0e17] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#0a0e17] shadow-2xl">
        <div className="grid md:grid-cols-2">

          <div className="flex flex-col justify-center px-8 py-4 md:px-14">

            <span className="mb-6 inline-flex w-fit items-center rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-medium tracking-wide text-slate-300">
              Getting Started
            </span>

            {/* Heading */}
            <h1 className="mb-5 text-4xl font-semibold leading-[1.1] tracking-tight text-white md:text-[2.75rem]">
              Welcome to
              <br />
              Project hub
            </h1>

            {/* Description */}
            <p className="mb-9 max-w-md text-[15px] leading-relaxed text-slate-400 md:text-base">
              Set up your workspace in minutes and start planning,
              tracking, and shipping projects with your team.
            </p>

            {/* Feature checklist */}
            <ul className="mb-9 space-y-3.5">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="text-[15px] text-slate-200">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-5 border-t border-white/10 pt-6 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span>
                  <span className="font-medium text-slate-200">50,000+</span>{" "}
                  active users
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span>
                  <span className="font-medium text-slate-200">4.9</span>{" "}
                  (2,000+ reviews)
                </span>
              </span>
            </div>

            <div className="mt-9 flex items-center gap-5">
              <Link
                href={'/sign-up'}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0e17]"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={'/sign-in'}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-slate-200 focus:outline-none focus-visible:underline"
              >
                Already a member
              </Link>
            </div>
          </div>

         <div className="relative hidden bg-muted lg:block">
        <img

          alt="Image"
          src="https://picsum.photos/seed/projecthub-kanban/980/1000"
        />
      </div>
        </div>
      </div>
    </div>
  );
}
              