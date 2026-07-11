'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/auth/sign-in/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: String(data.get('email') || ''),
          password: String(data.get('password') || ''),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message || body?.error?.message || 'Email atau password salah.');
        return;
      }
      router.refresh();
      window.location.href = '/';
    } catch {
      setError('Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[420px] flex-col justify-center px-4 py-16">
      <div className="rounded-page border border-border bg-card/40 p-8 grain">
        <div className="mb-6">
          <p className="font-mono text-eyebrow uppercase tracking-eyebrow text-accent-bright">Account</p>
          <h1 className="mt-2 font-serif text-3.5xl font-semibold text-foreground">Masuk</h1>
        </div>

        {error && (
          <p role="alert" aria-live="assertive" className="mb-5 rounded-page border border-destructive/40 bg-destructive/10 px-3 py-2.5 font-mono text-micro uppercase text-destructive">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field
            id="email"
            name="email"
            type="email"
            label="Email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
          <Field
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Masuk…' : 'Masuk'}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => (window.location.href = '/api/auth/sign-in/oauth/google')}
          className="mt-4 w-full border border-border px-[26px] py-[13px] font-mono text-xs uppercase tracking-xs text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Masuk dengan Google
        </button>

        <p className="mt-6 text-center font-mono text-micro text-muted-foreground">
          Belum punya akun?{' '}
          <Link href="/register" className="text-accent-bright hover:text-primary">Daftar</Link>
        </p>
      </div>
    </div>
  );
}
