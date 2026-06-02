import { useState } from 'react';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

export function LoginPage() {
	const { login, status, error } = useAuth();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const isSubmitting = status === 'authenticating';

	return (
		<main className="grid h-full grid-cols-[1.05fr_0.95fr] overflow-hidden">
			<section className="relative flex items-center justify-center border-r border-white/10 p-10">
				<div className="relative max-w-[520px]">
					<h1 className="mt-6 text-6xl font-black uppercase leading-[0.9] tracking-[-0.07em]">
						Build your crew.
						<span className="block text-accent">Rule the city.</span>
					</h1>

					<p className="mt-6 max-w-[460px] text-sm leading-7 text-white/50">
						Sign in with your Top Robbers account to prepare your game, check updates and join the server.
					</p>
				</div>
			</section>

			<section className="flex items-center justify-center p-10">
				<form
					className="w-full max-w-[420px]"
					onSubmit={(event) => {
						event.preventDefault();
						void login({ email, password });
					}}
				>
					<h2 className="text-3xl font-black tracking-[-0.04em]">Sign in</h2>

					<p className="mt-2 text-sm text-white/45">Use your platform account to continue.</p>

					<div className="mt-8 space-y-4">
						<label className="block">
							<span className="mb-2 block text-sm font-bold text-white/60">Email</span>

							<div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 transition focus-within:border-[#9083d2]/60">
								<Mail size={18} className="text-white/35" />

								<input
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/25"
									placeholder="you@example.com"
									autoComplete="email"
									required
								/>
							</div>
						</label>

						<label className="block">
							<span className="mb-2 block text-sm font-bold text-white/60">Password</span>

							<div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 transition focus-within:border-[#9083d2]/60">
								<Lock size={18} className="text-white/35" />

								<input
									type="password"
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/25"
									placeholder="••••••••"
									autoComplete="current-password"
									required
								/>
							</div>
						</label>
					</div>

					{error && (
						<div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100/80">
							{error}
						</div>
					)}

					<button
						type="submit"
						disabled={isSubmitting}
						className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent px-6 py-4 text-sm font-black uppercase tracking-[0.16em] text-white shadow-xl shadow-[#9083d2]/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
					>
						<LogIn size={18} />
						{isSubmitting ? 'Signing in...' : 'Sign in'}
					</button>

					<div className="mt-5 flex items-center justify-between text-sm font-semibold text-white/40">
						<button type="button" className="transition hover:text-white">
							Create account
						</button>

						<button type="button" className="transition hover:text-white">
							Forgot password?
						</button>
					</div>
				</form>
			</section>
		</main>
	);
}
