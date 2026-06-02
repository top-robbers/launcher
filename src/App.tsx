import { BrowserRouter, Route, Routes } from 'react-router';
import { AppProviders } from './providers/AppProviders';
import { AppLayout } from './layouts/App';
import { WindowLayout } from './layouts/Window';
import { AuthGate } from './components/AuthGate';
import SplashScreen from './pages/SplashScreen';
import { HomePage } from './pages/Home';

export default function App() {
	return (
		<BrowserRouter>
			<AppProviders>
				<Routes>
					<Route path="/splashscreen" element={<SplashScreen />} />

					<Route element={<AppLayout />}>
						<Route element={<WindowLayout />}>
							<Route
								path="/"
								element={
									<AuthGate>
										<HomePage />
									</AuthGate>
								}
							/>
						</Route>
					</Route>
				</Routes>
			</AppProviders>
		</BrowserRouter>
	);
}
