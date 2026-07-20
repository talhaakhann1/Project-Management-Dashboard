"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signupSchema } from "@/Schemas/signupSchema";
import * as z from "zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import ApiResponse from "@/types/ApiResponse"
import { AxiosError } from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { User } from "@/Schemas/user.schema";


const GoogleIcon = (
  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AppleIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
    <path d="M17.05 12.04c-.03-2.6 2.13-3.85 2.22-3.91-1.21-1.77-3.1-2.02-3.77-2.04-1.6-.16-3.13.94-3.94.94-.81 0-2.07-.92-3.4-.89-1.75.03-3.37 1.02-4.27 2.58-1.82 3.16-.47 7.83 1.31 10.39.87 1.25 1.91 2.66 3.27 2.61 1.31-.05 1.81-.85 3.4-.85 1.59 0 2.03.85 3.41.82 1.41-.02 2.3-1.28 3.16-2.54.99-1.45 1.4-2.86 1.42-2.93-.03-.01-2.73-1.05-2.76-4.15zM14.5 4.5c.72-.87 1.21-2.08 1.08-3.29-1.04.04-2.3.69-3.04 1.56-.67.77-1.25 2-1.09 3.18 1.16.09 2.34-.59 3.05-1.45z" />
  </svg>
);

const legalText = 'By signing in, you agree to our <a href="https://beste.co">Terms of Service</a> and <a href="https://beste.co">Privacy Policy</a>.'


export default function SignUpPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const router = useRouter()

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      acceptTerms: false
    }
  })

  const termsLabel = 'I agree to the <a href="">Terms of Service</a> and <a href="">Privacy Policy</a>'

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {

    setIsSubmitting(true)
    try {
      console.log("hello1");

      const response = await api.post<ApiResponse<User>>('/api/auth/sign-up', data)

      toast.message(response.data.message)
      router.replace("/sign-in")
    
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse<unknown>>
      let errorMessage = AxiosError.response?.data.message
      toast("Signup Failed",
        {
          description: errorMessage
        })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-balance text-muted-foreground mb-4">
          Fill in the form below to create your account
        </p>
      </div>
      <FieldGroup>
        <Controller
          name="fullName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-title">
                Full-Name
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                placeholder="John-Doe"
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-title">
                Email
              </FieldLabel>
              <Input
                {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                placeholder="john@example.com"
                autoComplete="off"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>

              <div className="flex items-center">
                <FieldLabel htmlFor="form-rhf-demo-title">
                  Password
                </FieldLabel>
                <Link
                  href="#"
                  className="ml-auto text-sm font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...field}
                  id="form-rhf-demo-title"
                  type={showPassword ? "text" : "password"}
                  aria-invalid={fieldState.invalid}
                  placeholder="Create a password"
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={showPassword ? "Hide password"
                    : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="acceptTerms"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" className="justify-center" data-invalid={fieldState.invalid}>
      
                <Checkbox
                  id="remember-me"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />

                <FieldLabel
                  htmlFor={"accept-terms"}
                  className="whitespace-nowrap font-normal text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: termsLabel }}
                />

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>

          )}
        />
        <Field>
          <Button type="submit" size="lg">
            {
              isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                </>
              ) : ('Create account')
            }
          </Button>
        </Field>
      </FieldGroup>
      <FieldDescription className="!mt-6 text-center">
        Already have an account?
        <Link href={"/sign-in"} className="font-medium text-foreground">
          Sign in
        </Link>
      </FieldDescription>
    </form>

  );
}
