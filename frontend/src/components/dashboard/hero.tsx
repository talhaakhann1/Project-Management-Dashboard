"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowRight, Send } from "lucide-react";

interface HeroProps {
    badge?: {
        label: string;
        variant?: "default" | "secondary" | "outline";
    };
    heading: string;
    description?: string;
    buttons?: {
        label: string;
        href: string;
        variant?: "default" | "outline";
        icon?: React.ReactNode;
    }[];
    image?: React.ReactNode;
    featureList?: React.ReactNode;
    socialProof?: React.ReactNode;
    className?: string;
}

export function Hero({
    badge,
    heading,
    description,
    buttons,
    image,
    featureList,
    socialProof,
    className,
}: HeroProps) {
    return (
        <section className={cn("py-16 md:py-24 w-full", className)}>
            <div className="mx-auto max-w-6xl px-6">
                <div className="flex flex-col items-center text-center">
                    <div className="flex flex-col items-center justify-center pb-8 md:pb-10">

                        {badge && (
                            <div className="mb-6">
                                <Badge variant={badge.variant ?? "secondary"}>{badge.label}</Badge>
                            </div>
                        )}

                        {heading && (
                            <h1 className="mb-6 text-4xl font-semibold text-balance md:text-6xl max-w-4xl mx-auto">
                                {heading}
                                <Send
                                    className="inline-block h-[0.6em] w-[0.6em] -rotate-12 text-primary align-super ml-1"
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                            </h1>
                        )}

                        {description && (
                            <p className="mb-8 max-w-2xl text-lg text-muted-foreground text-balance">
                                {description}
                            </p>
                        )}


                        {buttons && buttons.length > 0 && (
                            <div className="flex flex-wrap justify-center items-center gap-4">
                                {buttons.map((button, index) =>
                                    button.variant === "outline" ? (
                                        <Link
                                            key={index}
                                            href={button.href}
                                            className="font-sans text-[15px] font-medium text-primary transition-colors duration-150 hover:text-primary/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                        >
                                            {button.label}
                                        </Link>
                                    ) : (
                                        <Button
                                            key={index}
                                            variant="default"
                                            size="lg"
                                            render={<Link href={button.href} />}
                                        >
                                            {button.label}
                                            {button.icon}
                                        </Button>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {image && (
                        <div className="w-full max-w-4xl px-4">
                            {image}
                        </div>
                    )}
                    {socialProof && (
                        <div className="mt-10">{socialProof}</div>
                    )}
                </div>
            </div>
        </section>
    );
}