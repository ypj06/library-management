"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { registerAction, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "注册中…" : "创建账号"}
    </button>
  );
}

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="name" className="text-sm text-ink-soft">
          昵称
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={20}
          className="field"
          placeholder="怎么称呼你"
        />
      </div>

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
          placeholder="you@example.com"
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
          autoComplete="new-password"
          required
          minLength={6}
          className="field"
          placeholder="至少 6 位"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm" className="text-sm text-ink-soft">
          确认密码
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="field"
          placeholder="再输入一次"
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
