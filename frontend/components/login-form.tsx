"use client";
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/app/lib/api";
import { useAuth } from "@/app/context/AuthContext";

export function LoginForm({
                              className,
                              ...props
                          }: React.ComponentProps<"div">) {
    const router = useRouter()
    const { checkUser } = useAuth()
    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>("")

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError("")
        try {
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            await api.post('/auth/login', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            })

            await checkUser();
            router.refresh();
            router.push('/dashboard');

        } catch (err: any) {
            const msg = err.response?.data?.detail || "Error logging in";
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
                        <a href="#" className="flex flex-col items-center gap-2 font-medium">
                            <div className="flex size-8 items-center justify-center rounded-md">
                                <GalleryVerticalEnd className="size-6" />
                            </div>
                            <span className="sr-only">FeedRV</span>
                        </a>
                        <h1 className="text-xl font-bold">Welcome to your own FeedRV.</h1>
                        <FieldDescription>
                            Don&apos;t have an account? <Link href="/signup" className="underline">Sign up</Link>
                        </FieldDescription>
                    </div>
                    {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            value={username}
                            required
                            onChange={e => setUsername(e.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Your password"
                            value={password}
                            required
                            onChange={e => setPassword(e.target.value)}
                        />
                    </Field>
                    <Field>
                        <Button className={"w-full"} type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    )
}