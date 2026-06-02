type PanelBackgroundProps = {
	variant?: 'default' | 'danger';
};

export function PanelBackground({ variant = 'default' }: PanelBackgroundProps) {
	const isDanger = variant === 'danger';

	const baseGradient = isDanger
		? 'bg-[linear-gradient(135deg,#170910_0%,#120912_45%,#1a0508_100%)]'
		: 'bg-[linear-gradient(135deg,#11101c_0%,#12101a_45%,#171106_100%)]';

	const rightGlowClass = isDanger ? 'bg-red-500/14' : 'bg-[#FDBC16]/12';

	const radialOverlay = isDanger
		? 'bg-[radial-gradient(circle_at_18%_12%,rgba(144,131,210,0.22),transparent_34%),radial-gradient(circle_at_85%_85%,rgba(239,68,68,0.08),transparent_36%)]'
		: 'bg-[radial-gradient(circle_at_18%_12%,rgba(144,131,210,0.22),transparent_34%),radial-gradient(circle_at_85%_85%,rgba(253,188,22,0.07),transparent_36%)]';

	return (
		<div className="pointer-events-none absolute inset-0 overflow-hidden">
			<div className={['absolute inset-0', baseGradient].join(' ')} />
			<div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-accent/35 blur-3xl" />
			<div className={['absolute -bottom-28 -right-20 h-80 w-80 rounded-full blur-3xl', rightGlowClass].join(' ')} />
			<div className={['absolute inset-0', radialOverlay].join(' ')} />
		</div>
	);
}
