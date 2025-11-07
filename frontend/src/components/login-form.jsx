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

export function LoginForm({ className, ...props }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    
    // Validate inputs
    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }
    
    try {
      const payload = { email: email.trim(), password }
      console.log('Attempting login with:', { email: email.trim() });
      
      const res = await apiPost("/auth/login", payload)
      console.log('Login response:', res);
      
      if (res?.token) {
        try { 
          localStorage.setItem("authToken", res.token);
          console.log('Token stored successfully');
        } catch (e) { 
          console.error('Failed to store token:', e);
        }
        
        // persist user info ensuring sic_no, name, email are always present
        try {
          const serverUser = res?.user || res?.profile || (res?.data && res.data.user) || {};
          const user = {
            ...serverUser,
            sic_no: serverUser.sic_no || serverUser.sic || "",
            name: serverUser.name || email.split("@")[0],
            email: serverUser.email || email
          };
          localStorage.setItem("authUser", JSON.stringify(user));
          // Also store individual fields for easy access
          if (user.sic_no) localStorage.setItem("sic_no", user.sic_no);
          localStorage.setItem("name", user.name);
          localStorage.setItem("email", user.email);
          console.log('User data stored successfully');
        } catch (e) { 
          console.error('Failed to store user data:', e);
        }
        
        try { 
          window.dispatchEvent(new Event('authChange'));
          console.log('Auth change event dispatched');
        } catch (e) { 
          console.error('Failed to dispatch auth change:', e);
        }
        
        // Use window.location to ensure full page reload with new auth state
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
        return;
      } else {
        setError("Invalid response from server. Please try again.");
      }
    } catch (err) {
      console.error('Login error:', err)
      
      // Handle different types of errors
      if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
        setError("Request timeout. Please check your connection and try again.");
      } else if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error')) {
        setError("Network error. Please check if the server is running and try again.");
      } else if (err?.response?.status === 401) {
        setError("Invalid email or password");
      } else if (err?.response?.status === 404) {
        setError("User not found");
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.message) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
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
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Codigo account
                </p>
              </div>
              {error && <div className="text-sm text-red-600 text-center">{error}</div>}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e)=>setEmail(e.target.value)} />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} />
              </Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <FieldDescription className="text-center">
                Don&apos;t have an account?{" "}
                <a href="/register">Sign up</a>
              </FieldDescription>
            </FieldGroup>
          </form>
          <div className="bg-muted relative hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop"
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
  )
}
