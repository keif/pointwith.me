import React, {ReactNode} from 'react';
import {User, Twitter, Github, Settings, ArrowLeft} from 'lucide-react';
import {auth} from '@/firebase';
import {useParams, Link} from 'react-router-dom';

interface LayoutProps {
	children: ReactNode;
	contentCenter?: boolean;
}

const Layout = ({children, contentCenter = false}: LayoutProps) => {
	const {userId} = useParams();
	const currentUser = auth.auth.currentUser;
	const isHost = userId === currentUser?.uid;
	const userDisplay = userId
		? `${currentUser?.displayName || ``} - ${isHost ? `HOST` : `ATTENDEE`}`
		: currentUser?.displayName || ``;

	return (
		<div className="min-h-screen flex flex-col">
			{/* Top Navigation */}
			<nav className="bg-gray-800 text-white fixed top-0 left-0 right-0 z-50 shadow-lg">
				<div className="container-centered">
					<div className="flex items-center justify-between h-16">
						{/* Branding */}
						<Link to="/dashboard" className="flex items-center gap-3 hover:opacity-90 transition-opacity" id="topBranding">
							<img
								src="/point-pal-logo.png"
								alt="PointPal"
								className="w-10 h-10 rounded-lg"
							/>
							<div className="flex flex-col">
								<span className="text-xl font-bold tracking-tight">PointPal</span>
								<span className="text-xs text-gray-300 hidden sm:block">Planning Poker for Remote Teams</span>
							</div>
						</Link>

						{/* User Menu */}
						{!!currentUser && (
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg">
									<User size={16} className="text-gray-300" />
									<span className="text-sm font-medium hidden md:inline">{userDisplay}</span>
								</div>
								<Link
									to="/settings"
									className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
									title="Settings"
								>
									<Settings size={18} />
									<span className="hidden sm:inline text-sm font-medium">Settings</span>
								</Link>
								<button
									onClick={() => auth.auth.signOut()}
									className="btn btn-danger text-sm font-medium"
								>
									Logout
								</button>
							</div>
						)}
					</div>
				</div>
				{window.location.pathname === '/settings' && (
					<div className="bg-gray-700 text-white border-t border-gray-600">
						<div className="flex items-center gap-3 py-2 container-centered">
							<Link
								to="/dashboard"
								className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
							>
								<ArrowLeft size={18} />
								Back to Dashboard
							</Link>
						</div>
					</div>
				)}
			</nav>

			{/* Main Content */}
			<main className={`flex-1 mt-16 ${contentCenter ? 'flex items-center justify-center' : 'pt-4'}`}>
				<div className="container-centered">
					{children}
				</div>
			</main>

			{/* Footer */}
			<footer className="bg-white border-t mt-8 py-6">
				<div className="container-centered">
					<div className="flex flex-col items-center gap-4">
						<div className="flex items-center gap-4">
							<a
								href="https://twitter.com/pointwithme"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-600 hover:text-primary transition-colors"
							>
								<Twitter size={20} />
							</a>
							<a
								href="https://github.com/keif/pointwith.me"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-600 hover:text-primary transition-colors"
							>
								<Github size={20} />
							</a>
						</div>
						<div className="flex items-center gap-4 text-sm text-gray-600">
							<Link to="/terms" className="hover:text-primary transition-colors">
								Terms of Service
							</Link>
							<span>•</span>
							<Link to="/privacy" className="hover:text-primary transition-colors">
								Privacy Policy
							</Link>
						</div>
						<p className="text-center text-gray-600 text-sm">
							&copy; {new Date().getFullYear()} PointPal.app
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default Layout;
