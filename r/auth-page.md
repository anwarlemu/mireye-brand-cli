# Auth page
Sign in and sign up: the form on the left (lockup, title, fields, the Forest key, single sign-on under a ruled "or", the switch to the other mode) and a survey plate on the right from 1024px.

Install: npx mireye-ds add auth-page
Requires: theme, icons, survey-plate, button, field, input, mireye-mark, utils
Packages: none
Exports: AuthValues, AuthPageProps, AuthPage
Client boundary: yes
Reference: brand/reference product UI boards (Figma 442:2) and the library's product parts: field, input, button (Figma UI · Inputs 442:79 and Buttons 442:3)


## Usage
Use for sign in (`mode="sign-in"`) and sign up (`mode="sign-up"`). Pass `onSubmit`, `onSso` and the links; the template signs no one in.
- Avoid: Social login buttons in brand colors
- Avoid: Photos behind the form
- Avoid: Placeholder text as the only label


## Examples
Example components: npx mireye-ds add auth-page
[Preview](https://mireye-ds.agencidev.com/preview/auth-page/Preview) | [SignUp](https://mireye-ds.agencidev.com/preview/auth-page/SignUp)

examples/auth-page.tsx

```tsx
"use client";

import { AuthPage } from "@/components/blocks/auth-page";

// Embedded at 760px; on its own the page fills the viewport.
export function Preview() {
  return <AuthPage className="min-h-190" />;
}

export function SignUp() {
  return <AuthPage mode="sign-up" className="min-h-190" />;
}

```

## Source

components/blocks/auth-page.tsx

```tsx
"use client";

import * as React from "react";

import { ArrowRightIcon } from "@/components/icons/arrow-right";
import { SurveyPlate } from "@/components/blocks/survey-plate";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MireyeMark } from "@/components/ui/mireye-mark";
import { cn } from "@/lib/utils";

// Sign in and sign up: the form on Bone on the left (the lockup, a 24px title, the fields, the Forest key, single sign-on
// as an outlined key under a ruled "or", and the switch to the other mode as a text link), and a survey plate on the
// right from 1024px with the product's line in DM Mono. The form calls `onSubmit` with its values; it signs no one in.

export type AuthValues = { name?: string; email: string; password: string };

export type AuthPageProps = {
  mode?: "sign-in" | "sign-up";
  name?: string;
  onSubmit?: (values: AuthValues) => void;
  onSso?: () => void;
  /** Where the other mode lives. */
  switchHref?: string;
  forgotHref?: string;
  className?: string;
};

const TEXT_LINK =
  "text-fg underline decoration-line underline-offset-4 outline-none transition-[text-decoration-color] duration-150 ease-out hover:decoration-line-strong focus-visible:outline-solid focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-line-strong motion-reduce:transition-none";

export function AuthPage({ mode = "sign-in", name = "Mireye", onSubmit, onSso, switchHref = "#", forgotHref = "#forgot", className }: AuthPageProps) {
  const up = mode === "sign-up";
  return (
    <div data-slot="auth-page" className={cn("grid min-h-dvh bg-page font-sans text-fg lg:grid-cols-2", className)}>
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex h-6 items-center gap-2 text-fg">
          <MireyeMark aria-hidden role="presentation" className="h-4 w-5.5" />
          <span className="text-body-lg leading-none">{name}</span>
        </div>
        <main className="mx-auto flex w-full max-w-90 flex-1 flex-col justify-center py-12">
          <div className="mb-8 grid gap-2">
            <h1 className="text-h1 leading-heading font-normal text-fg">{up ? "Create your account" : `Sign in to ${name}`}</h1>
            <p className="text-body leading-body text-fg-secondary">{up ? "Start free with 1,000 requests a month." : "Welcome back. Pick up where your agent left off."}</p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const data = new FormData(e.currentTarget);
              onSubmit?.({ name: up ? String(data.get("name") ?? "") : undefined, email: String(data.get("email") ?? ""), password: String(data.get("password") ?? "") });
            }}
          >
            <FieldGroup>
              {up && (
                <Field>
                  <FieldLabel htmlFor="auth-name">Name</FieldLabel>
                  <Input id="auth-name" name="name" autoComplete="name" required />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="auth-email">Work email</FieldLabel>
                <Input id="auth-email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
              </Field>
              <Field>
                <div className="flex items-baseline justify-between gap-3">
                  <FieldLabel htmlFor="auth-password">Password</FieldLabel>
                  {!up && (
                    <a href={forgotHref} className={cn(TEXT_LINK, "text-caption")}>
                      Forgot it?
                    </a>
                  )}
                </div>
                <Input id="auth-password" name="password" type="password" autoComplete={up ? "new-password" : "current-password"} minLength={up ? 12 : undefined} required />
                {up && <FieldDescription>12 characters or more.</FieldDescription>}
              </Field>
              <Button type="submit" className="w-full">
                {up ? "Create account" : "Sign in"}
                <ArrowRightIcon size={20} />
              </Button>
              <FieldSeparator>or</FieldSeparator>
              <Button type="button" variant="outline" className="w-full" onClick={onSso}>
                Continue with single sign-on
              </Button>
            </FieldGroup>
          </form>
          <p className="mt-8 text-body text-fg-secondary">
            {up ? "Have an account? " : "New here? "}
            <a href={switchHref} className={TEXT_LINK}>
              {up ? "Sign in" : "Create an account"}
            </a>
          </p>
        </main>
        <p className="text-caption text-fg-muted">
          By continuing you agree to the <a href="#terms" className={TEXT_LINK}>terms</a> and the <a href="#privacy" className={TEXT_LINK}>privacy policy</a>.
        </p>
      </div>
      <aside aria-hidden className="hidden border-l border-line p-6 lg:flex lg:flex-col lg:gap-4">
        <SurveyPlate className="min-h-0 w-full flex-1" />
        <p className="font-mono text-caption text-fg-muted">Physical world context for AI agents</p>
      </aside>
    </div>
  );
}

```
