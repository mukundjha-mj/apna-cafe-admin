import { useState } from 'react';
import { login } from '../lib/auth';
import { ArrowRight, Coffee, Lock, Mail, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Owner login logic
      if (email !== 'owner@apna-cafe.com') {
        throw new Error('Access denied. Only owner can login here.');
      }
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-bg-dark px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,118,34,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(255,118,34,0.08),_transparent_28%)]" />
      <div className="absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-[-10rem] right-[-6rem] h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-7xl items-center">
        <div className="mx-auto w-full max-w-lg animate-soft-fade-up">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] border border-primary/20 bg-primary/10 text-primary shadow-[0_0_40px_rgba(255,118,34,0.12)]">
              <Coffee size={42} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-text-cream sm:text-5xl">Welcome Back</h1>
            <p className="mt-3 text-sm leading-6 text-text-muted sm:text-base">Enter your credentials to manage your cafe</p>
          </div>

          <section className="rounded-[28px] border border-white/5 bg-bg-card/90 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-md sm:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.28em] text-text-muted sm:text-xs">
                  Owner Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" size={20} />
                  <input
                    type="email"
                    required
                    placeholder="owner@apna-cafe.com"
                    className="w-full rounded-[16px] border border-white/5 bg-bg-accent/90 py-3.5 pl-12 pr-4 text-text-cream outline-none transition-all placeholder:text-text-muted/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 sm:py-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.28em] text-text-muted sm:text-xs">
                  Secret Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-primary" size={20} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-[16px] border border-white/5 bg-bg-accent/90 py-3.5 pl-12 pr-4 text-text-cream outline-none transition-all placeholder:text-text-muted/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 sm:py-4"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-error/20 bg-error/10 p-4 text-sm font-bold text-error">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-error" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-[18px] bg-primary px-5 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(255,118,34,0.28)] transition-all hover:bg-primary-dark hover:shadow-[0_16px_40px_rgba(255,118,34,0.36)] disabled:cursor-not-allowed disabled:opacity-70 sm:text-lg"
              >
                {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
                <span>{loading ? 'Signing In...' : 'Sign In to Panel'}</span>
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-text-muted">
              Forgot password? <span className="cursor-pointer font-bold text-primary hover:underline">Contact Support</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
