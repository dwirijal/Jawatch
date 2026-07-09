'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name') || ''),
          email: String(data.get('email') || ''),
          password: String(data.get('password') || ''),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message || body?.error?.message || 'Gagal mendaftar. Coba lagi.');
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
    <main className="mx-auto flex min-h-[calc(100vh-12rem)] w-full max-w-[420px] flex-col justify-center px-4 py-16">
      <div className="rounded-page border border-border bg-card/40 p-8 grain">
        <div className="mb-6">
          <p className="font-mono text-eyebrow uppercase tracking-eyebrow text-accent-bright">Account</p>
          <h1 className="mt-2 font-serif text-3.5xl font-semibold text-foreground">Daftar</h1>
        </div>

        {error && (
          <p role="alert" aria-live="assertive" className="mb-5 rounded-page border border-red-500/40 bg-red-500/10 px-3 py-2.5 font-mono text-micro uppercase text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Field
            id="name"
            name="name"
            type="text"
            label="Nama"
            autoComplete="name"
            required
            placeholder="Nama lengkap"
          />
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
            autoComplete="new-password"
            required
            placeholder="••••••••"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Mendaftar…' : 'Daftar'}
          </Button>
        </form>

        <p className="mt-6 text-center font-mono text-micro text-muted-foreground">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-accent-bright hover:text-primary">Masuk</Link>
        </p>
      </div>
    </main>
  );
}
