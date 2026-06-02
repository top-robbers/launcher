import { useState } from 'react';

export function CrashTest() {
	const [shouldCrash, setShouldCrash] = useState(false);

	if (shouldCrash) {
		throw new Error('Intentional React render crash for AppErrorBoundary preview.');
	}

	return (
		<button
			type="button"
			onClick={() => setShouldCrash(true)}
			className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-200 hover:bg-red-500/20"
		>
			Trigger AppErrorBoundary
		</button>
	);
}
