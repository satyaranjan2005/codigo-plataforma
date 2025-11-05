"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { post as apiPost } from "@/lib/api"

export function SignupForm({ className, ...props }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [sic_no, setSic] = useState("")
  const [email, setEmail] = useState("")
  const [phone_no, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if ((password || "").length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      const payload = { name, sic_no, email, phone_no, password }
      const res = await apiPost("/auth/register", payload)
      // if server returns token, store it
      if (res?.token) {
        try { localStorage.setItem("authToken", res.token); } catch (e) { /* ignore */ }
        try {
          // Merge server response with form data to ensure sic_no, name, email are always present
          const serverUser = res?.user || res?.profile || (res?.data && res.data.user) || {};
          const user = {
            ...serverUser,
            sic_no: serverUser.sic_no || sic_no,
            name: serverUser.name || name,
            email: serverUser.email || email
          };
          localStorage.setItem("authUser", JSON.stringify(user));
          // Also store individual fields for easy access
          localStorage.setItem("sic_no", user.sic_no);
          localStorage.setItem("name", user.name);
          localStorage.setItem("email", user.email);
        } catch (e) { /* ignore */ }
        try { window.dispatchEvent(new Event('authChange')); } catch (e) { /* ignore */ }
        // Use window.location to ensure full page reload with new auth state
        window.location.href = "/";
        return;
      }
    } catch (err) {
      console.error(err)
      setError(err?.message || (err?.response?.data?.message) || "Failed to register")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Enter your details below to create your account
                </p>
              </div>
              {error && <div className="text-sm text-red-600 text-center">{error}</div>}
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input id="name" type="text" placeholder="John Doe" required value={name} onChange={(e)=>setName(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sic">SIC No</FieldLabel>
                  <Input id="sic" type="text" placeholder="26bcsn100" required value={sic_no} onChange={(e)=>setSic(e.target.value)} />
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e)=>setEmail(e.target.value)} />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your
                  email with anyone else.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" required value={phone_no} onChange={(e)=>setPhone(e.target.value)} />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input id="password" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input id="confirm-password" type="password" required value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</Button>
              </Field>
              <FieldDescription className="text-center">
                Already have an account? <a href="/login">Sign in</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
              alt="Coding workspace"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
