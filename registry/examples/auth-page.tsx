"use client";

import { AuthPage } from "@/components/blocks/auth-page";

// Embedded at 760px; on its own the page fills the viewport.
export function Preview() {
  return <AuthPage className="min-h-190" />;
}

export function SignUp() {
  return <AuthPage mode="sign-up" className="min-h-190" />;
}
