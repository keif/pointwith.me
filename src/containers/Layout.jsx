import React from 'react';
import PropTypes from 'prop-types';
import {User, Twitter, Github} from 'lucide-react';
import {auth} from '../firebase';
import {useParams} from 'react-router-dom';

const propTypes = {
	children: PropTypes.node.isRequired,
	contentCenter: PropTypes.bool,
};

const defaultProps = {
	contentCenter: false,
};

const Layout = ({children, contentCenter}) => {
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
						<div className="flex items-center gap-4" id="topBranding">
							<img
								src="/favicon-32x32.png"
								alt="PointWith.me"
								className="w-8 h-8"
							/>
							<p className="text-lg font-medium">Planning Poker for Remote Teams!</p>
						</div>

						{/* User Menu */}
						{!!currentUser && (
							<div className="flex items-center gap-4">
								<div className="flex items-center gap-2">
									<User size={16} />
									<span className="text-sm">{userDisplay}</span>
								</div>
								<button
									onClick={() => auth.auth.signOut()}
									className="btn btn-danger text-sm"
								>
									Logout
								</button>
							</div>
						)}
					</div>
				</div>
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
					<p className="text-center text-gray-600 flex items-center justify-center gap-4">
						<a
							href="https://twitter.com/pointwithme"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-primary transition-colors"
						>
							<Twitter size={20} />
						</a>
						<a
							href="https://github.com/philpalmieri/pointwith.me"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-primary transition-colors"
						>
							<Github size={20} />
						</a>
						<span>&copy; {new Date().getFullYear()} PointWith.me</span>
					</p>
				</div>
			</footer>
		</div>
	);
};

Layout.propTypes = propTypes;
Layout.defaultProps = defaultProps;

export default Layout;
