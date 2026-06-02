import { Loader2, ShieldCheck } from 'lucide-react';

export function CheckingSessionPage() {
	return (
		<main className="flex h-full items-center justify-center px-8">
			<section className="w-full max-w-155 rounded-4xl border border-white/10 bg-white/[0.045] p-9 text-center shadow-2xl shadow-black/35">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-accent shadow-2xl shadow-[#9083d2]/35">
					<ShieldCheck size={30} />
				</div>

				<h1 className="mt-6 text-4xl font-black uppercase tracking-[-0.06em]">Checking session</h1>

				<p className="mx-auto mt-4 max-w-105 text-sm leading-6 text-white/50">Checking session...</p>

				<Loader2 className="mx-auto mt-7 animate-spin text-accent" size={26} />
			</section>
		</main>
	);
}
