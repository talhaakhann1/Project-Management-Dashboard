"use client"

import { LoginForm } from "@/components/login-form"
import { FieldGroup, FieldDescription, FieldLabel, Field, FieldError } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { signInSchema } from "@/Schemas/signInSchema"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"
import { toast } from "sonner"
import { useAppDispatch } from "@/store/hook"
import { AxiosError } from "axios"
import { Checkbox } from "@/components/ui/checkbox";
import { login } from "@/store/authSlice"
import { store } from "@/store/authStore"
import  ApiResponse from "@/types/ApiResponse"
import { User } from "@/Schemas/user.schema"


export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const legal = 'By signing in, you agree to our <a href="">Terms of Service</a> and <a href="">Privacy Policy</a>.'

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true)
    try {

      const response = await api.post<ApiResponse<User>>('/sign-in', data)
       console.log(response);
      dispatch(login(response.data.data))
      router.replace("/dashboard")
      
      toast.message(response.data.message)
    } catch (error) {
      const AxiosError = error as AxiosError<ApiResponse<unknown>>

      let errorMessage = AxiosError.response?.data.message
     console.log(errorMessage);
     
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

      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Welcome Back!</h1>
          <p className="text-sm text-balance text-muted-foreground mb-4">
            Enter your email below to login to your account
          </p>
        </div>
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
              <FieldLabel htmlFor="form-rhf-demo-title">
                Password
              </FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="form-rhf-demo-title"
                  type={showPassword ? "text" : "password"}
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter your password"
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
          name="rememberMe"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id="remember-me"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />

              <FieldLabel htmlFor="remember-me">
                Remember Me for 30 days
              </FieldLabel>

              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>

          )}
        />

        <Button type="submit" size="lg">
          {
            isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
              </>
            ) :
              ("Sign in")
          }
        </Button>

        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <a href="/sign-up" className="text-foreground underline underline-offset-4">
              Sign up
            </a>
          </FieldDescription>
        </Field>
          <Field orientation={"horizontal"} className="justify-center">
            <FieldLabel
              htmlFor={"accept-terms"}
              className="whitespace-nowrap font-normal text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: legal }}
            />
          </Field>
      </FieldGroup>

    </form>
  )
}
