import { LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import type { AuthUser } from '../types';

type UserBadgeProps = {
	compact?: boolean;
};

export function UserBadge({ compact = false }: UserBadgeProps) {
	const { user, status, logout } = useAuth();

	if (!user) {
		return (
			<div
				className={[
					'mr-2 flex items-center gap-2 rounded-xl border border-primary/10 bg-[#F1E1CD]/[0.035] font-bold text-primary/35',
					compact ? 'h-8 px-2.5 text-[11px]' : 'px-3 py-1.5 text-xs',
				].join(' ')}
			>
				<UserRound size={compact ? 13 : 14} />
				<span>{status === 'checking' ? 'Checking session' : 'Guest'}</span>
			</div>
		);
	}

	const initial = getUserInitial(user);

	return (
		<div
			className={[
				'mr-2 flex items-center rounded-xl border border-primary/10 bg-[#F1E1CD]/[0.035]',
				compact ? 'h-8 gap-2 px-2' : 'gap-3 px-3 py-1.5',
			].join(' ')}
		>
			<div
				className={[
					'flex shrink-0 items-center justify-center rounded-full bg-accent font-black text-white',
					compact ? 'h-6 w-6 text-[10px]' : 'h-8 w-8 text-xs',
				].join(' ')}
			>
				{initial}
			</div>

			<div className={compact ? 'hidden leading-none lg:block' : 'hidden leading-none md:block'}>
				<div className={['truncate font-bold text-primary', compact ? 'max-w-28 text-xs' : 'max-w-32 text-sm'].join(' ')}>
					{user.name}
				</div>

				<div
					className={['truncate text-primary/40', compact ? 'mt-0.5 max-w-32 text-[10px]' : 'mt-0.5 max-w-40 text-xs'].join(' ')}
				>
					{user.email}
				</div>
			</div>

			<button
				type="button"
				aria-label="Logout"
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					void logout();
				}}
				className={[
					'flex shrink-0 items-center justify-center rounded-lg text-primary/40 transition hover:bg-[#F1E1CD]/10 hover:text-primary',
					compact ? 'h-7 w-7' : 'h-8 w-8',
				].join(' ')}
			>
				<LogOut size={compact ? 13 : 15} />
			</button>
		</div>
	);
}

function getUserInitial(user: AuthUser): string {
	const firstCharacter = user.name.trim().charAt(0);

	return firstCharacter.length > 0 ? firstCharacter.toLocaleUpperCase() : 'U';
}
