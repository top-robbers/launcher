import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	loading?: boolean;
	fullWidth?: boolean;
};

const baseClasses =
	'inline-flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-45';

const variantClasses: Record<ButtonVariant, string> = {
	primary: 'bg-accent text-white shadow-lg shadow-[#9083d2]/25 hover:brightness-110 disabled:hover:brightness-100',
	secondary: 'border border-primary/10 bg-primary/[0.06] text-primary/70 hover:bg-[#F1E1CD]/10 hover:text-primary',
	danger: 'border border-[#FDBC16]/20 bg-secondary/10 text-secondary hover:bg-[#FDBC16]/15',
	ghost: 'text-primary/45 hover:bg-[#F1E1CD]/10 hover:text-primary',
};

const sizeClasses: Record<ButtonSize, string> = {
	sm: 'h-9 px-3 text-xs',
	md: 'h-11 px-5 text-sm',
	lg: 'h-14 px-7 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			variant = 'primary',
			size = 'md',
			leftIcon,
			rightIcon,
			loading = false,
			fullWidth = false,
			disabled,
			children,
			className,
			type = 'button',
			...props
		},
		ref,
	) => {
		return (
			<button
				ref={ref}
				type={type}
				disabled={disabled || loading}
				className={[baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && 'w-full', className]
					.filter(Boolean)
					.join(' ')}
				{...props}
			>
				{loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : leftIcon}

				{children}

				{rightIcon}
			</button>
		);
	},
);

Button.displayName = 'Button';
