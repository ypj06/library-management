"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { loginAction, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

function SubmitButton() {
  // useFormStatus 必须在 <form> 的子组件里调用，才能拿到提交状态
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "登录中…" : "登录"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm text-ink-soft">
          邮箱
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
          placeholder="reader@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm text-ink-soft">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="field"
          placeholder="至少 6 位"
        />
      </div>

      {state.error ? (
        <p className="rounded-md bg-clay-50 px-3 py-2 text-sm text-clay-600">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
