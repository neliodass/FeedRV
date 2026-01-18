"use client"
import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import api from "@/app/lib/api";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [password_repeat, setPasswordRepeat] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if(password !== password_repeat) {
            setError("Hasła nie są identyczne")
            return
        }

        setLoading(true)
        setError("")
        try {
            const res = await api.post('/auth/register', {
                email: username,
                password: password,
                password_confirm: password_repeat,
            })

            if (res.data) {
                router.push('/login')
            }
        } catch (err: any) {
            const msg = err.response?.data?.detail || err.response?.data?.message || "Błąd rejestracji";
            setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }


    }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">FeedRV</span>
            </a>
            <h1 className="text-xl font-bold">Welcome to your own FeedRV.</h1>
            <FieldDescription>
              Already have an account? <Link href="/login" className="underline">Sign in</Link>
            </FieldDescription>
          </div>
            {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={username}
                onChange={(e) => setUsername(e.target.value)}
              placeholder="m@example.com"
              required
            />
          </Field>
            <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </Field>
            <Field>
                <FieldLabel htmlFor="password_repeat">Repeat password</FieldLabel>
                <Input
                    id="password_repeat"
                    type="password"
                    placeholder="Repeat your password"
                    value={password_repeat}
                    onChange={(e) => setPasswordRepeat(e.target.value)}
                    required
                />
            </Field>
          <Field>
            <Button className={"w-full"} type="submit" disabled={loading}>{loading? "Signing up...":"Create Account"}</Button>
          </Field>

        </FieldGroup>
      </form>

    </div>
  )
}
